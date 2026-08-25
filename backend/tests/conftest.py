"""
Shared test fixtures for Rome AI Agent backend tests.
"""

import os
import json
import pytest
from unittest.mock import patch, MagicMock

# Set environment variables before importing the handler
os.environ['KB_ID'] = 'test-kb-id'
os.environ['TABLE_NAME'] = 'test-analytics-table'
os.environ['MODEL_ID'] = 'us.anthropic.claude-sonnet-4-6'
os.environ['ENVIRONMENT'] = 'test'
os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'
os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'


@pytest.fixture
def api_gateway_event():
    """Factory fixture for creating API Gateway events."""
    def _make_event(body=None, source_ip='192.168.1.1'):
        return {
            'body': json.dumps(body) if body else None,
            'requestContext': {
                'identity': {
                    'sourceIp': source_ip,
                },
            },
            'headers': {
                'Content-Type': 'application/json',
            },
        }
    return _make_event


@pytest.fixture
def mock_bedrock_retrieval_response():
    """Sample Bedrock KB retrieval response with 3 chunks."""
    return {
        'retrievalResults': [
            {
                'content': {'text': 'Rome offers AI and RAG system design services.'},
                'location': {
                    's3Location': {
                        'uri': 's3://rome-agent-knowledge-base-dev/02-rome-services.md',
                    },
                },
                'score': 0.92,
            },
            {
                'content': {'text': 'Rome provides AWS DevOps consulting including CI/CD pipelines.'},
                'location': {
                    's3Location': {
                        'uri': 's3://rome-agent-knowledge-base-dev/05-aws-devops.md',
                    },
                },
                'score': 0.87,
            },
            {
                'content': {'text': 'Rome specializes in IAM security audits and least-privilege implementation.'},
                'location': {
                    's3Location': {
                        'uri': 's3://rome-agent-knowledge-base-dev/06-iam-services.md',
                    },
                },
                'score': 0.84,
            },
        ],
    }


@pytest.fixture
def mock_bedrock_model_response():
    """Sample Bedrock model invocation response."""
    response_body = {
        'content': [
            {
                'type': 'text',
                'text': 'Rome offers a comprehensive suite of services including AI/RAG system design, AWS DevOps consulting, and IAM security audits.',
            },
        ],
        'model': 'us.anthropic.claude-sonnet-4-6',
        'stop_reason': 'end_turn',
        'usage': {'input_tokens': 500, 'output_tokens': 50},
    }
    # Create a mock body that behaves like a streaming response
    mock_body = MagicMock()
    mock_body.read.return_value = json.dumps(response_body).encode('utf-8')
    return {'body': mock_body}


@pytest.fixture
def lambda_context():
    """Mock Lambda context object."""
    context = MagicMock()
    context.function_name = 'rome-agent-query-handler-test'
    context.memory_limit_in_mb = 512
    context.invoked_function_arn = 'arn:aws:lambda:us-east-1:266878857915:function:rome-agent-query-handler-test'
    context.aws_request_id = 'test-request-id'
    return context
