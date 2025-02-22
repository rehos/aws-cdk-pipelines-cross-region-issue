import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { MyTenantStage } from './tenant/my-tenant-stage';

export class MyApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'MyApplicationPipeline', {
      crossAccountKeys: true,
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection(
          'my-org/my-app',
          'main',
          {
            connectionArn:
              `arn:aws:codestar-connections:${this.region}:${this.account}:connection/00000000-0000-0000-0000-000000000000`,
          }
        ),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    // Cross-account deployment to tenant account
    pipeline.addStage(new MyTenantStage(this, 'MyTenantStage', {
      env: {
        account: '111111111111',
        region: this.region,
      },  
    }));
  }
}
