#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsBackendStack } from '../lib/aws-backend-stack';

const app = new cdk.App();
new AwsBackendStack(app, 'AwsBackendStack', {
  /* Specialize this stack for the AWS Account and Region that are implied by the current CLI configuration. */
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* If you know exactly what Account and Region you want to deploy the stack to, 
   * you can hardcode it here. For optimal compatibility with the referenced billing region: */
  // env: { account: '493643819493', region: 'us-east-1' },
});
