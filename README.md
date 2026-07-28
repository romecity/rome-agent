# Rome AI Agent

> *"Ask Rome anything."*

A production-grade, serverless RAG (Retrieval-Augmented Generation) AI agent built on AWS. Rome answers questions about the Rome technology company, its services, and technical concepts by intelligently retrieving context from a curated knowledge base and generating responses using Claude 3 Sonnet via Amazon Bedrock.

**Live demo:** [rome.romecity.dev](https://rome.romecity.dev)

---

## Architecture

```
User (Web UI / API)
        ↓
  API Gateway (REST) — rate limited 20 req/IP/hr
        ↓
  Lambda (Python 3.13) — Query Handler
        ↓
  Amazon Bedrock Knowledge Base ← S3 (10 curated documents)
  [Titan Embeddings v2 + built-in vector store]
        ↓
  Amazon Bedrock — Claude Sonnet 4.6
  [retrieved context + question → answer]
        ↓
  DynamoDB (analytics) + CloudWatch (observability)
```

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Amazon Bedrock — Claude Sonnet 4.6 |
| Embeddings | Amazon Titan Text Embeddings v2 |
| Vector Store | Bedrock built-in (managed) |
| Compute | AWS Lambda (Python 3.13) |
| API | Amazon API Gateway (REST) |
| Storage | Amazon S3 |
| Analytics | Amazon DynamoDB |
| CDN | Amazon CloudFront |
| IaC | AWS CDK (TypeScript) |
| CI/CD | GitHub Actions |
| Monitoring | Amazon CloudWatch |

## Project Structure

```
rome-agent/
├── infrastructure/    # AWS CDK stacks (TypeScript)
│   ├── bin/           # CDK app entry point
│   └── lib/           # Stack definitions
├── backend/           # Lambda functions (Python)
│   ├── query_handler/ # RAG pipeline
│   ├── health_check/  # Health endpoint
│   └── document_uploader/ # KB document ingestion
├── frontend/          # React chat UI
├── knowledge-base/    # Source documents (Markdown)
├── docs/              # OpenAPI spec, architecture diagrams
└── .github/workflows/ # CI/CD pipelines
```

## Environments

| Environment | URL | Branch |
|---|---|---|
| dev | dev.rome.romecity.dev | `dev` |
| prod | rome.romecity.dev | `main` |

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.13+
- AWS CLI configured with `portfolio-dev` profile
- AWS CDK 2.x

### Deploy to dev
```bash
cd infrastructure
npm install
npx cdk deploy --all --context env=dev --profile portfolio-dev
```

### Run locally (Lambda testing)
```bash
cd backend/query_handler
pip install -r requirements.txt
python -c "import index; print(index.handler({'body': '{\"question\": \"What is Rome?\"}'}, None))"
```

---

Built by [rome city](https://romecity.dev) — Rome Technology Company
