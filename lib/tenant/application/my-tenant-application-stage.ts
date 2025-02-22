import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { MyTenantApplicationStack } from './my-tenant-application-stack';

export class MyTenantApplicationStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new MyTenantApplicationStack(this, 'MyTenantApplicationEUStack');

    // Cross-region deployment to us-east-1
    new MyTenantApplicationStack(this, 'MyTenantApplicationUSStack', {
      env: {
        region: 'us-east-1',
      },
    });
  }
}