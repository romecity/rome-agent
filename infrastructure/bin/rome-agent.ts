#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RomeAgentDataStack } from '../lib/data-stack';
import { RomeAgentAIStack } from '../lib/ai-stack';
import { RomeAgentAPIStack } from '../lib/api-stack';

const app = new cdk.App();

const env = app.node.tryGetContext('env') || 'dev';

const dataStack = new RomeAgentDataStack(app, `RomeAgentDataStack-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment: env,
});

const aiStack = new RomeAgentAIStack(app, `RomeAgentAIStack-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment: env,
  knowledgeBucket: dataStack.knowledgeBucket,
});

const apiStack = new RomeAgentAPIStack(app, `RomeAgentAPIStack-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment: env,
  analyticsTable: dataStack.analyticsTable,
  knowledgeBaseId: aiStack.knowledgeBaseId,
  alertEmail: 'mackj1@bu.edu',
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
});

cdk.Tags.of(app).add('Project', 'rome-agent');
cdk.Tags.of(app).add('Environment', env);
cdk.Tags.of(app).add('Owner', 'romecity');
