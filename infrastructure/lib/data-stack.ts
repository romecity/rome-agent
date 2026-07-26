import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

interface RomeAgentDataStackProps extends cdk.StackProps {
  environment: string;
}

export class RomeAgentDataStack extends cdk.Stack {
  public readonly knowledgeBucket: s3.Bucket;
  public readonly analyticsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: RomeAgentDataStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // S3 bucket for knowledge base documents
    this.knowledgeBucket = new s3.Bucket(this, 'KnowledgeBucket', {
      bucketName: `rome-agent-knowledge-base-${environment}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
    });

    // DynamoDB table for query analytics
    this.analyticsTable = new dynamodb.Table(this, 'AnalyticsTable', {
      tableName: `rome-agent-analytics-${environment}`,
      partitionKey: {
        name: 'queryId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: 'ttl',
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // Outputs
    new cdk.CfnOutput(this, 'KnowledgeBucketName', {
      value: this.knowledgeBucket.bucketName,
      exportName: `rome-agent-knowledge-bucket-${environment}`,
    });

    new cdk.CfnOutput(this, 'AnalyticsTableName', {
      value: this.analyticsTable.tableName,
      exportName: `rome-agent-analytics-table-${environment}`,
    });
  }
}
