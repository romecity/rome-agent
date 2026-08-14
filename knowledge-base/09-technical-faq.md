# Technical FAQ

## About Rome's Approach

**Q: How do you approach a new cloud project?**
Rome follows a structured engineering process: requirements document, architecture design, sprint planning, then implementation. Every project includes security review, cost analysis, monitoring setup, and documentation. We build like AWS engineers — not just to make it work, but to make it maintainable, secure, and cost-effective.

**Q: What AWS services does Rome use most?**
Lambda, API Gateway, DynamoDB, S3, CloudFront, Bedrock, CDK, IAM, CloudWatch, Secrets Manager, EventBridge, and Cognito. Rome uses serverless-first architecture where possible to minimize operational overhead and cost.

**Q: How do you handle security?**
Security is built in from day one — not added later. Every system Rome builds uses: IAM least-privilege roles, AWS Secrets Manager for credentials, encryption at rest and in transit, rate limiting, input validation, and structured logging. We treat security as an engineering discipline, not a checkbox.

**Q: How do you estimate AWS costs?**
Rome analyzes usage patterns and calculates per-service costs using AWS pricing calculators. We architect for cost efficiency — using serverless to scale to zero, selecting appropriate storage tiers, and setting up cost dashboards and alerts to catch runaway spending.

## About RAG and AI

**Q: What is the difference between RAG and fine-tuning?**
RAG retrieves relevant documents at query time and provides them as context to the LLM. Fine-tuning trains the model on your data to change its behavior. RAG is preferred for most enterprise use cases because it keeps knowledge current, costs less, and doesn't require retraining when data changes.

**Q: How accurate is RAG?**
Accuracy depends heavily on the quality of the knowledge base and retrieval system. With well-written documents, good chunking strategy, and proper context engineering, RAG systems can achieve very high accuracy on questions within their knowledge domain. Rome designs systems with retrieval quality monitoring to catch accuracy degradation.

**Q: What is Context Engineering?**
Context Engineering is the practice of designing and optimizing the information provided to an LLM. It includes document chunking strategy, retrieval optimization, prompt structure, and context window management. It is the key differentiator between a demo RAG system and a production-grade one.

**Q: Can Rome build a custom AI agent for my company?**
Yes. Rome designs and builds production agentic AI systems using Amazon Bedrock. This includes knowledge bases, tool use, multi-step reasoning, and integration with existing systems. Contact info@romecity.dev to discuss your requirements.

## About IAM and Security

**Q: How do you know if our IAM is misconfigured?**
Rome uses AWS IAM Access Analyzer, AWS Config rules, and custom scripts to audit IAM configurations. Common issues include wildcard permissions, unused credentials, and cross-account trust relationships that are too permissive. Rome provides a detailed report with risk ratings and remediation steps.

**Q: How long does an offboarding automation take to build?**
A basic offboarding automation for AWS + GitHub takes 1-2 weeks to implement. A comprehensive system covering all SaaS tools, with audit trails and HR integration, takes 3-4 weeks. Rome builds these as reusable systems that can be triggered from your existing HR workflow.

## About Working with Rome

**Q: How does Rome engage with clients?**
Rome offers hourly consulting, fixed-price projects, and retainer engagements. All engagements begin with a discovery call to understand your needs and scope. Contact info@romecity.dev to get started.

**Q: What makes Rome different from a large consulting firm?**
Rome brings senior-level expertise without enterprise overhead. You work directly with the founder — someone with academic depth (multiple master's degrees) and practical experience (Apple, Wayfair). Decisions are made quickly, communication is direct, and Rome is invested in your success as a long-term partner.

**Q: What industries does Rome serve?**
Rome works with technology startups, scale-ups, and mid-market companies across all industries. Any organization running on AWS or building AI-powered products can benefit from Rome's services.
