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

    // S3 bucket for vector storage (S3 Vectors)
    const vectorBucket = new s3.Bucket(this, 'VectorBucket', {
      bucketName: `rome-agent-vectors-${environment}-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
    });

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
        S3VectorAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:ListBucket',
                's3:DeleteObject',
                's3vectors:CreateIndex',
                's3vectors:DeleteIndex',
                's3vectors:GetIndex',
                's3vectors:ListIndexes',
                's3vectors:PutVectors',
                's3vectors:GetVectors',
                's3vectors:DeleteVectors',
                's3vectors:QueryVectors',
              ],
              resources: [
                vectorBucket.bucketArn,
                `${vectorBucket.bucketArn}/*`,
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

    // NOTE: Bedrock Knowledge Base with S3 Vectors storage
    // The KB will be created via AWS Console or CLI for now,
    // as S3 Vectors index creation requires the S3 Vectors API
    // which isn't fully supported in CDK yet.
    // We'll output the role ARN and bucket info for manual KB creation.

    // Outputs for manual Knowledge Base setup
    new cdk.CfnOutput(this, 'BedrockKBRoleArn', {
      value: bedrockKBRole.roleArn,
      exportName: `rome-agent-bedrock-kb-role-arn-${environment}`,
    });

    new cdk.CfnOutput(this, 'VectorBucketArn', {
      value: vectorBucket.bucketArn,
      exportName: `rome-agent-vector-bucket-arn-${environment}`,
    });

    new cdk.CfnOutput(this, 'VectorBucketName', {
      value: vectorBucket.bucketName,
      exportName: `rome-agent-vector-bucket-name-${environment}`,
    });

    // Placeholder — will be set after manual KB creation
    // For now, export a placeholder that the API stack can reference
    this.knowledgeBaseId = 'PLACEHOLDER_KB_ID';

    new cdk.CfnOutput(this, 'KnowledgeBaseIdNote', {
      value: 'Create KB in AWS Console, then update this stack with the actual KB ID',
      exportName: `rome-agent-kb-note-${environment}`,
    });
  }
}
