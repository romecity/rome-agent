import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import { Construct } from 'constructs';

interface RomeAgentAIStackProps extends cdk.StackProps {
  environment: string;
  knowledgeBucket: s3.Bucket;
}

export class RomeAgentAIStack extends cdk.Stack {
  public readonly knowledgeBaseId: string;

  constructor(scope: Construct, id: string, props: RomeAgentAIStackProps) {
    super(scope, id, props);

    const { environment, knowledgeBucket } = props;

    // IAM role for Bedrock Knowledge Base
    const bedrockKBRole = new iam.Role(this, 'BedrockKBRole', {
      roleName: `rome-agent-bedrock-kb-role-${environment}`,
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      inlinePolicies: {
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:ListBucket'],
              resources: [
                knowledgeBucket.bucketArn,
                `${knowledgeBucket.bucketArn}/*`,
              ],
            }),
          ],
        }),
        BedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['bedrock:InvokeModel'],
              resources: [
                `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-embed-text-v2:0`,
              ],
            }),
          ],
        }),
      },
    });

    // Bedrock Knowledge Base with built-in vector store
    const knowledgeBase = new bedrock.CfnKnowledgeBase(this, 'KnowledgeBase', {
      name: `rome-agent-kb-${environment}`,
      description: 'Rome AI Agent knowledge base — RAG system for romecity.dev',
      roleArn: bedrockKBRole.roleArn,
      knowledgeBaseConfiguration: {
        type: 'VECTOR',
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-embed-text-v2:0`,
        },
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS', // Bedrock managed — no OpenSearch setup needed
      },
    });

    // S3 data source for Knowledge Base
    new bedrock.CfnDataSource(this, 'KnowledgeBaseDataSource', {
      name: `rome-agent-s3-source-${environment}`,
      knowledgeBaseId: knowledgeBase.attrKnowledgeBaseId,
      dataSourceConfiguration: {
        type: 'S3',
        s3Configuration: {
          bucketArn: knowledgeBucket.bucketArn,
          inclusionPrefixes: ['documents/'],
        },
      },
      vectorIngestionConfiguration: {
        chunkingConfiguration: {
          chunkingStrategy: 'FIXED_SIZE',
          fixedSizeChunkingConfiguration: {
            maxTokens: 512,
            overlapPercentage: 20,
          },
        },
      },
    });

    this.knowledgeBaseId = knowledgeBase.attrKnowledgeBaseId;

    // Outputs
    new cdk.CfnOutput(this, 'KnowledgeBaseId', {
      value: knowledgeBase.attrKnowledgeBaseId,
      exportName: `rome-agent-kb-id-${environment}`,
    });
  }
}
