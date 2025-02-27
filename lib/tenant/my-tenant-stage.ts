import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { MyTenantPipelineStack } from './my-tenant-pipeline-stack';

export class MyTenantStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new MyTenantPipelineStack(this, 'MyTenantPipeline');
  }
}