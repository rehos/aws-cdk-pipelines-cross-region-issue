import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import * as pipelines from "aws-cdk-lib/pipelines";
import { MyTenantApplicationStage } from "./application/my-tenant-application-stage";

export class MyTenantPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, "MyPipeline", {
      synth: new pipelines.ShellStep("Synth", {
        input: pipelines.CodePipelineSource.connection(
          "my-org/my-app",
          "main",
          {
            connectionArn: `arn:aws:codestar-connections:${this.region}:${this.account}:connection/11111111-1111-1111-1111-111111111111`,
          }
        ),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    pipeline.addStage(new MyTenantApplicationStage(this, 'MyTenantApplicationStage'));
  }

}