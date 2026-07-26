"""
Rome AI Agent — Query Handler Lambda
Handles RAG queries: retrieve from Bedrock KB + generate with Claude 3 Sonnet
"""

import json
import os
import time
import uuid
import hashlib
import logging
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

# Configure structured logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS clients
bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb')

# Environment variables
KB_ID = os.environ['KB_ID']
TABLE_NAME = os.environ['TABLE_NAME']
MODEL_ID = os.environ['MODEL_ID']
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'dev')

# DynamoDB table
table = dynamodb.Table(TABLE_NAME)

ROME_PERSONA = """You are Rome, the AI assistant for Rome — a technology company specializing in 
production-grade AI systems, RAG, Context Engineering, AWS cloud infrastructure, and DevOps consulting.

The founder of Rome has:
- Master's in Software Engineering
- AWS Cloud Institute certification (Cloud Application Developer)
- Master's in Data Science (AI concentration) in progress
- Software engineering and QA experience
- Internship at Apple, NOC experience at Wayfair

Use ONLY the provided context to answer questions accurately and professionally.
If the context doesn't contain enough information to answer, respond:
"I don't have specific information about that. For more details, please reach out at romecity.dev"

Keep responses concise, professional, and helpful. When relevant, mention that Rome can help
build similar systems for the user's organization."""


def build_prompt(question: str, context: str) -> str:
    return f"""{ROME_PERSONA}

Context:
{context}

Question: {question}

Answer:"""


def format_context(chunks: list) -> str:
    if not chunks:
        return "No relevant context found."
    return "\n\n".join([
        f"[Source: {c.get('location', {}).get('s3Location', {}).get('uri', 'unknown')}]\n{c['content']['text']}"
        for c in chunks
    ])


def format_sources(chunks: list) -> list:
    sources = []
    for chunk in chunks:
        uri = chunk.get('location', {}).get('s3Location', {}).get('uri', '')
        doc_name = uri.split('/')[-1] if uri else 'unknown'
        excerpt = chunk.get('content', {}).get('text', '')[:200]
        sources.append({
            'document': doc_name,
            'excerpt': excerpt + '...' if len(excerpt) == 200 else excerpt,
        })
    return sources


def log_query(query_id: str, question: str, latency_ms: int, source_count: int, ip: str):
    """Log query analytics to DynamoDB"""
    try:
        now = datetime.now(timezone.utc)
        ttl = int(now.timestamp()) + (90 * 24 * 60 * 60)  # 90 days

        table.put_item(Item={
            'queryId': query_id,
            'timestamp': now.isoformat(),
            'question': question,
            'questionHash': hashlib.sha256(question.lower().encode()).hexdigest(),
            'ipHash': hashlib.sha256(ip.encode()).hexdigest() if ip else 'unknown',
            'latency_ms': latency_ms,
            'sourceCount': source_count,
            'modelId': MODEL_ID,
            'environment': ENVIRONMENT,
            'ttl': ttl,
        })
    except Exception as e:
        logger.warning(f"Failed to log analytics: {e}")


def handler(event, context):
    start_time = time.time()
    query_id = str(uuid.uuid4())

    logger.info(json.dumps({
        'queryId': query_id,
        'event': 'query_received',
        'environment': ENVIRONMENT,
    }))

    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        question = body.get('question', '').strip()
        ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')

        if not question or len(question) < 3:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Question must be at least 3 characters'}),
            }

        if len(question) > 500:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Question must be 500 characters or less'}),
            }

        # Retrieve relevant context from Bedrock Knowledge Base
        retrieval_response = bedrock_agent.retrieve(
            knowledgeBaseId=KB_ID,
            retrievalQuery={'text': question},
            retrievalConfiguration={
                'vectorSearchConfiguration': {'numberOfResults': 5}
            }
        )

        chunks = retrieval_response.get('retrievalResults', [])
        context_text = format_context(chunks)

        # Generate answer with Claude 3 Sonnet
        prompt = build_prompt(question, context_text)

        model_response = bedrock_runtime.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 1024,
                'messages': [{'role': 'user', 'content': prompt}],
            }),
            contentType='application/json',
            accept='application/json',
        )

        response_body = json.loads(model_response['body'].read())
        answer = response_body['content'][0]['text']
        latency_ms = int((time.time() - start_time) * 1000)

        # Log analytics
        log_query(query_id, question, latency_ms, len(chunks), ip)

        logger.info(json.dumps({
            'queryId': query_id,
            'event': 'query_completed',
            'latency_ms': latency_ms,
            'source_count': len(chunks),
        }))

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'answer': answer,
                'sources': format_sources(chunks),
                'latency_ms': latency_ms,
            }),
        }

    except ClientError as e:
        logger.error(json.dumps({
            'queryId': query_id,
            'event': 'aws_error',
            'error': str(e),
        }))
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'An error occurred processing your request. Please try again.'}),
        }

    except Exception as e:
        logger.error(json.dumps({
            'queryId': query_id,
            'event': 'unexpected_error',
            'error': str(e),
        }))
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'An unexpected error occurred. Please try again.'}),
        }
