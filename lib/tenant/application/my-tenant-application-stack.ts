import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class MyTenantApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Just a dummy resource
    new ssm.StringParameter(this, "MyTenantApplicationParameter", {
      parameterName: "/my-tenant/region",
      stringValue: this.region,
    });
  }
}