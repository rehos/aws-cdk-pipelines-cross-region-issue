#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MyApplicationStack } from '../lib/my-application-stack';

const app = new cdk.App();
new MyApplicationStack(app, 'MyApplicationStack', {
  env: { account: '000000000000', region: 'eu-central-1' },
});