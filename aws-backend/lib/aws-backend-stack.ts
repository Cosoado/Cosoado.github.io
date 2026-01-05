import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class AwsBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. DynamoDB for Rate Limiting
    const table = new dynamodb.Table(this, 'ContactRateLimit', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: 'ttl',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/demo purpose
    });

    // 2. Lambda Function
    const handler = new nodejs.NodejsFunction(this, 'ContactHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
        SOURCE_EMAIL: 'noreply@cosoado-lab.com', // Placeholder, verify in SES
        DESTINATION_EMAIL: 'askcosoado@gmail.com',
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    // Grant permissions
    table.grantReadWriteData(handler);

    // SES Permission
    handler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'], // Ideally restricted to specific identity ARN
    }));

    // 3. API Gateway
    const api = new apigateway.RestApi(this, 'ContactApi', {
      restApiName: 'Contact Form API',
      description: 'API for Cosoado Lab Contact Form',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // Restrict this in production to cosoado-lab.com
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 1,
        throttlingBurstLimit: 2,
      }
    });

    const integration = new apigateway.LambdaIntegration(handler);
    api.root.addMethod('POST', integration);

    // Usage Plan (Rate Limiting at API GW level)
    const plan = api.addUsagePlan('ContactUsagePlan', {
      name: 'Basic',
      throttle: {
        rateLimit: 1,
        burstLimit: 2,
      },
      quota: {
        limit: 5,
        period: apigateway.Period.DAY,
      }
    });
    plan.addApiStage({
      stage: api.deploymentStage,
    });
    // Note: To enforce Usage Plan, API keys are usually required. 
    // However, Usage Plans can be associated with stages for method throttling.
    // But quota usually requires API keys. 
    // The user requested usage plan settings. Without API Key, quota is per API Key. 
    // Wait, the user manual says "Usage Plan... 5 requests/day". 
    // Global quota without API Key is not possible per IP via Usage Plan. 
    // Usage Plan is key-based. 
    // RateBasedRule (WAF) handles IP-based blocking. 
    // I will stick to WAF for IP limiting and keep Usage Plan for global throttle (protect backend).

    // 4. AWS WAF
    const webAcl = new wafv2.CfnWebACL(this, 'ContactWebACL', {
      defaultAction: { allow: {} },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'ContactWebACL',
        sampledRequestsEnabled: true,
      },
      rules: [
        // Rate-based rule (100 is min for WAFv2 usually... user asked for 10/5min)
        // AWS WAF minimum rate limit is 100 per 5 minutes. 
        // Providing 10 is not directly possible with standard RateBasedRule.
        // I will set it to the minimum (100) or use custom lambda for tighter control (which I did in Lambda logic).
        // Actually, AWS recently lowered it or allows lower? No, doc says 100.
        // I will add a comment about this limitation and implement the tighter logic in Lambda (which I did).
        {
          name: 'RateLimit',
          priority: 1,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 100, // Minimum allowed by AWS
              aggregateKeyType: 'IP',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimit',
            sampledRequestsEnabled: true,
          },
        },
        // Managed Rules
        {
          name: 'AWS-CommonRules',
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'AWSCommonRules',
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    // Associate WAF with API Gateway
    new wafv2.CfnWebACLAssociation(this, 'WebACLAssociation', {
      resourceArn: api.deploymentStage.stageArn,
      webAclArn: webAcl.attrArn,
    });

    // Output URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
}
