import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

interface RomeAgentAPIStackProps extends cdk.StackProps {
  environment: string;
  analyticsTable: dynamodb.Table;
  knowledgeBaseId: string;
}

export class RomeAgentAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RomeAgentAPIStackProps) {
    super(scope, id, props);

    const { environment, analyticsTable, knowledgeBaseId } = props;

    // IAM role for Query Handler Lambda
    const queryHandlerRole = new iam.Role(this, 'QueryHandlerRole', {
      roleName: `rome-agent-query-handler-role-${environment}`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        BedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:Retrieve',
                'bedrock:RetrieveAndGenerate',
              ],
              resources: ['*'],
            }),
          ],
        }),
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['dynamodb:PutItem'],
              resources: [analyticsTable.tableArn],
            }),
          ],
        }),
      },
    });

    // Query Handler Lambda
    const queryHandler = new lambda.Function(this, 'QueryHandler', {
      functionName: `rome-agent-query-handler-${environment}`,
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/query_handler'),
      role: queryHandlerRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        KB_ID: knowledgeBaseId,
        TABLE_NAME: analyticsTable.tableName,
        MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
        ENVIRONMENT: environment,
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Health Check Lambda
    const healthCheck = new lambda.Function(this, 'HealthCheck', {
      functionName: `rome-agent-health-check-${environment}`,
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/health_check'),
      timeout: cdk.Duration.seconds(5),
      memorySize: 128,
      environment: {
        ENVIRONMENT: environment,
        VERSION: '1.0.0',
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'RomeAgentAPI', {
      restApiName: `rome-agent-api-${environment}`,
      description: 'Rome AI Agent REST API',
      defaultCorsPreflightOptions: {
        allowOrigins: environment === 'prod'
          ? ['https://rome.romecity.dev']
          : apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['POST', 'GET', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'X-Api-Key'],
      },
      deployOptions: {
        stageName: 'v1',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        metricsEnabled: true,
      },
    });

    // API Key and Usage Plan for rate limiting
    const apiKey = api.addApiKey(`RomeAgentAPIKey-${environment}`, {
      apiKeyName: `rome-agent-key-${environment}`,
      description: 'Rome AI Agent API key for direct access',
    });

    const usagePlan = api.addUsagePlan(`RomeAgentUsagePlan-${environment}`, {
      name: `rome-agent-usage-plan-${environment}`,
      throttle: {
        rateLimit: 20,    // 20 req/sec max
        burstLimit: 5,
      },
      quota: {
        limit: 1000,
        period: apigateway.Period.DAY,
      },
    });

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({ stage: api.deploymentStage });

    // Routes
    const queryResource = api.root.addResource('query');
    queryResource.addMethod('POST', new apigateway.LambdaIntegration(queryHandler));

    const healthResource = api.root.addResource('health');
    healthResource.addMethod('GET', new apigateway.LambdaIntegration(healthCheck));

    // CloudWatch Alarms
    const errorAlarm = new cloudwatch.Alarm(this, 'ErrorRateAlarm', {
      alarmName: `rome-agent-error-rate-${environment}`,
      metric: queryHandler.metricErrors({
        period: cdk.Duration.minutes(5),
      }),
      threshold: 5,
      evaluationPeriods: 1,
      alarmDescription: 'Rome Agent query handler error rate too high',
    });

    const latencyAlarm = new cloudwatch.Alarm(this, 'LatencyAlarm', {
      alarmName: `rome-agent-latency-${environment}`,
      metric: queryHandler.metricDuration({
        period: cdk.Duration.minutes(5),
        statistic: 'p95',
      }),
      threshold: 5000, // 5 seconds
      evaluationPeriods: 2,
      alarmDescription: 'Rome Agent p95 latency exceeded 5 seconds',
    });

    // Outputs
    new cdk.CfnOutput(this, 'APIEndpoint', {
      value: api.url,
      exportName: `rome-agent-api-url-${environment}`,
    });

    new cdk.CfnOutput(this, 'QueryHandlerArn', {
      value: queryHandler.functionArn,
      exportName: `rome-agent-query-handler-arn-${environment}`,
    });
  }
}
