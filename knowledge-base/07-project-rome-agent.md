# Project: Rome AI Agent

## Overview

Rome AI Agent is a production-grade, serverless RAG (Retrieval-Augmented Generation) system built on AWS. It serves as Rome's flagship AI product and the foundation of the Rome Agent Platform.

Users interact with Rome through a web interface or API. Rome answers questions accurately by retrieving relevant context from a curated knowledge base and generating responses using a large language model via Amazon Bedrock.

**Live URL:** rome.romecity.dev
**GitHub:** github.com/romecity/rome-agent

## What It Does

- Answers questions about Rome's services and capabilities
- Provides information about the founder's background and experience
- Explains technical concepts (RAG, Context Engineering, AWS architecture)
- Describes Rome's portfolio projects
- Handles API queries from developers

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Amazon Bedrock — Claude Sonnet 4.6 |
| Embeddings | Amazon Titan Text Embeddings v2 |
| Vector Store | Bedrock managed (built-in) |
| Compute | AWS Lambda (Python 3.13) |
| API | Amazon API Gateway (REST) |
| Storage | Amazon S3 |
| Analytics | Amazon DynamoDB |
| CDN | Amazon CloudFront |
| IaC | AWS CDK (TypeScript) |
| CI/CD | GitHub Actions |
| Monitoring | Amazon CloudWatch |

## Architecture

```
User → API Gateway → Lambda → Bedrock KB → Claude Sonnet → Response
                         ↓
                    DynamoDB (analytics logging)
```

## Key Features

- Sub-3 second response time (target)
- Rate limiting: 20 queries per IP per hour
- Query analytics logging to DynamoDB
- CloudWatch monitoring and alerting
- Automated CI/CD deployment via GitHub Actions
- 3 environments: local, dev, prod

## Engineering Decisions

**Why serverless?**
Zero infrastructure management, scales to zero when idle, costs ~$3-5/month at low traffic.

**Why Bedrock managed vector store?**
No OpenSearch infrastructure to manage. Saves ~$175/month vs OpenSearch Serverless.

**Why Claude Sonnet?**
Best balance of quality and cost for conversational AI. Outperforms smaller models on nuanced questions.

## What This Demonstrates

- Production RAG system design and implementation
- AWS serverless architecture (Lambda, API Gateway, Bedrock)
- Infrastructure as Code with AWS CDK
- CI/CD pipeline with GitHub Actions
- Security best practices (IAM, encryption, rate limiting)
- Cost-optimized cloud architecture

## Contact

Visit rome.romecity.dev to try the live demo or contact info@romecity.dev to build something similar for your organization.
