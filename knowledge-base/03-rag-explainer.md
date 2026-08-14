# What is RAG (Retrieval-Augmented Generation)?

## Overview

RAG stands for Retrieval-Augmented Generation. It is a technique that combines the power of large language models (LLMs) with a custom knowledge base to produce accurate, grounded responses.

Instead of relying solely on what the LLM learned during training, RAG retrieves relevant information from your own documents and provides it as context to the model before generating a response.

## How RAG Works

1. **User submits a question** — the query is received by the system
2. **Retrieval** — the system searches a vector database for the most relevant document chunks
3. **Context building** — retrieved chunks are combined with the user's question into a prompt
4. **Generation** — the LLM generates an answer grounded in the retrieved context
5. **Response** — the answer is returned with source references

## Why RAG Instead of Fine-Tuning?

| Approach | When to Use | Cost | Freshness |
|---|---|---|---|
| RAG | Most use cases | Low | Always current |
| Fine-tuning | Specialized style/behavior | High | Requires retraining |
| Prompt engineering | Simple tasks | None | N/A |

RAG is preferred for most enterprise use cases because it keeps knowledge fresh, costs less than fine-tuning, and is easier to update.

## Key Components of a RAG System

- **Document store** — where source documents live (S3, databases, SharePoint)
- **Embedding model** — converts text into numerical vectors for semantic search
- **Vector database** — stores and searches embeddings efficiently
- **LLM** — generates the final answer using retrieved context
- **Orchestration layer** — coordinates retrieval and generation

## Context Engineering

Context Engineering is the practice of designing and optimizing the context provided to an LLM to maximize response quality. It goes beyond basic prompt engineering to include:

- Document chunking strategies
- Retrieval ranking and filtering
- Prompt structure and persona design
- Context window management
- Metadata filtering

Rome specializes in Context Engineering for production RAG systems.

## Rome's RAG Architecture

Rome builds RAG systems using Amazon Bedrock Knowledge Bases on AWS:
- **Embedding**: Amazon Titan Text Embeddings
- **Vector store**: Amazon S3 Vectors or OpenSearch Serverless
- **LLM**: Claude Sonnet via Amazon Bedrock
- **Infrastructure**: AWS Lambda + API Gateway (serverless)
- **IaC**: AWS CDK for repeatable deployments

## Use Cases

- Internal knowledge bases (HR policies, runbooks, documentation)
- Customer-facing AI assistants
- Sales and product Q&A bots
- Compliance and legal document search
- Technical support automation

## Contact

To build a RAG system for your organization, contact Rome at info@romecity.dev or visit romecity.dev.
