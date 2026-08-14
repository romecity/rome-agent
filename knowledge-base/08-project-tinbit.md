# Project: Tinbit AI

## Overview

Tinbit AI is a production SaaS dating application powered by AI and built on AWS. It is Rome's flagship distributed systems project and demonstrates end-to-end production SaaS architecture.

Tinbit is an emoji-based dating app where users express themselves through emoji combinations, and an AI recommendation engine matches them with compatible partners.

**GitHub:** github.com/romecity/tinbit-app
**Status:** In development (Project 3 in Rome's portfolio)

## What Makes It Different

- Emoji-first expression system — no text bios required
- AI-powered recommendation engine using Amazon Bedrock
- Event-driven architecture for real-time matching
- Built as a production SaaS with proper subscription management

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (web) + React Native (mobile) |
| Backend | Node.js + Express |
| Database | AWS DynamoDB + Aurora Serverless |
| Events | Amazon EventBridge |
| AI | Amazon Bedrock (recommendation engine) |
| Storage | Amazon S3 |
| CDN | Amazon CloudFront |
| IaC | AWS CDK |
| CI/CD | GitHub Actions |

## Architecture

Tinbit uses an event-driven, distributed architecture:

```
User Action → API → EventBridge → Event Processors
                                       ↓
                               Match Engine (Bedrock)
                               Notification Service
                               Analytics Pipeline
```

## Key Engineering Concepts Demonstrated

**Distributed Systems**
- Event-driven architecture with Amazon EventBridge
- Eventual consistency patterns
- Distributed state management
- Message queue design

**AI-Powered Features**
- Recommendation engine using RAG and embeddings
- User preference learning
- Real-time match scoring

**Production SaaS**
- Subscription management
- Multi-tenant architecture
- Analytics and metrics
- Monitoring and alerting

## Why This Project Matters

Tinbit AI demonstrates Rome's ability to build the full stack of a modern SaaS product:
- Product thinking (what users want)
- System design (how to build it at scale)
- AI integration (recommendation and matching)
- Cloud operations (deploying and running it in production)

## Contact

Interested in building a similar AI-powered SaaS product? Contact Rome at info@romecity.dev or visit romecity.dev.
