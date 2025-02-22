# Issue description

This CDK application deploys a pipeline (call it A) into an account (000000000000) in eu-central-1 which in turn deploys another pipeline in a tenant account (111111111111) in the same region. The pipeline (call it T) in the tenant account has a cross region deployment and requires a cross region support stack. Because of that the application A should also deploy a cross region support stack to deploy the cross region support stack for the tenant account.

After running `npx cdk synth` you can see the problem. Open the file `cdk.out/cross-region-stack-000000000000:us-east-1.template.json`. The KMS Key policy and the bucket resource policy reference roles in `eu-central-1` instead of `us-east-1`. This results in permissions error during deployment.

```json
{
 "Resources": {
  "CrossRegionCodePipelineReplicationBucketEncryptionKey70216490": {
   "Type": "AWS::KMS::Key",
   "Properties": {
    "KeyPolicy": {
     "Statement": [
      {
       "Action": "kms:*",
       "Effect": "Allow",
       "Principal": {
        "AWS": "arn:aws:iam::000000000000:root"
       },
       "Resource": "*"
      },
      {
       "Action": [
        "kms:Decrypt",
        "kms:DescribeKey",
        "kms:Encrypt",
        "kms:GenerateDataKey*",
        "kms:ReEncrypt*"
       ],
       "Effect": "Allow",
       "Principal": {
        "AWS": "arn:aws:iam::000000000000:root"
       },
       "Resource": "*"
      },
      {
       "Action": [
        "kms:Decrypt",
        "kms:DescribeKey"
       ],
       "Effect": "Allow",
       "Principal": {
        "AWS": {
         "Fn::Join": [
          "",
          [
           "arn:",
           {
            "Ref": "AWS::Partition"
           },
           ":iam::111111111111:role/cdk-hnb659fds-deploy-role-111111111111-eu-central"
          ]
         ]
        }
       },
       "Resource": "*"
      }
     ],
     "Version": "2012-10-17"
    }
   },
   "UpdateReplacePolicy": "Delete",
   "DeletionPolicy": "Delete"
  },
  "CrossRegionCodePipelineReplicationBucketEncryptionAliasF1A0F37D": {
   "Type": "AWS::KMS::Alias",
   "Properties": {
    "AliasName": "alias/k-supportencryptionaliasd3a129d0594b69d72c3b",
    "TargetKeyId": {
     "Fn::GetAtt": [
      "CrossRegionCodePipelineReplicationBucketEncryptionKey70216490",
      "Arn"
     ]
    }
   },
   "UpdateReplacePolicy": "Delete",
   "DeletionPolicy": "Delete"
  },
  "CrossRegionCodePipelineReplicationBucketFC3227F2": {
   "Type": "AWS::S3::Bucket",
   "Properties": {
    "BucketEncryption": {
     "ServerSideEncryptionConfiguration": [
      {
       "ServerSideEncryptionByDefault": {
        "KMSMasterKeyID": {
         "Fn::Join": [
          "",
          [
           "arn:aws:kms:us-east-1:000000000000:",
           {
            "Ref": "CrossRegionCodePipelineReplicationBucketEncryptionAliasF1A0F37D"
           }
          ]
         ]
        },
        "SSEAlgorithm": "aws:kms"
       }
      }
     ]
    },
    "BucketName": "myapplicationstack-supporeplicationbucket442401857fad76ecdcca",
    "PublicAccessBlockConfiguration": {
     "BlockPublicAcls": true,
     "BlockPublicPolicy": true,
     "IgnorePublicAcls": true,
     "RestrictPublicBuckets": true
    }
   },
   "UpdateReplacePolicy": "Retain",
   "DeletionPolicy": "Retain"
  },
  "CrossRegionCodePipelineReplicationBucketPolicyB7BA2BCA": {
   "Type": "AWS::S3::BucketPolicy",
   "Properties": {
    "Bucket": {
     "Ref": "CrossRegionCodePipelineReplicationBucketFC3227F2"
    },
    "PolicyDocument": {
     "Statement": [
      {
       "Action": "s3:*",
       "Condition": {
        "Bool": {
         "aws:SecureTransport": "false"
        }
       },
       "Effect": "Deny",
       "Principal": {
        "AWS": "*"
       },
       "Resource": [
        {
         "Fn::GetAtt": [
          "CrossRegionCodePipelineReplicationBucketFC3227F2",
          "Arn"
         ]
        },
        {
         "Fn::Join": [
          "",
          [
           {
            "Fn::GetAtt": [
             "CrossRegionCodePipelineReplicationBucketFC3227F2",
             "Arn"
            ]
           },
           "/*"
          ]
         ]
        }
       ]
      },
      {
       "Action": [
        "s3:GetBucket*",
        "s3:GetObject*",
        "s3:List*"
       ],
       "Effect": "Allow",
       "Principal": {
        "AWS": {
         "Fn::Join": [
          "",
          [
           "arn:",
           {
            "Ref": "AWS::Partition"
           },
           ":iam::111111111111:role/cdk-hnb659fds-deploy-role-111111111111-eu-central"
          ]
         ]
        }
       },
       "Resource": [
        {
         "Fn::GetAtt": [
          "CrossRegionCodePipelineReplicationBucketFC3227F2",
          "Arn"
         ]
        },
        {
         "Fn::Join": [
          "",
          [
           {
            "Fn::GetAtt": [
             "CrossRegionCodePipelineReplicationBucketFC3227F2",
             "Arn"
            ]
           },
           "/*"
          ]
         ]
        }
       ]
      }
     ],
     "Version": "2012-10-17"
    }
   }
  }
 }
}
```

Also the action in the pipeline references the wrong region:

```json
      "Actions": [
       {
        "ActionTypeId": {
         "Category": "Deploy",
         "Owner": "AWS",
         "Provider": "CloudFormation",
         "Version": "1"
        },
        "Configuration": {
         "StackName": "MyTenantStage-MyTenantPipeline-support-us-east-1",
         "Capabilities": "CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND",
         "RoleArn": {
          "Fn::Join": [
           "",
           [
            "arn:",
            {
             "Ref": "AWS::Partition"
            },
            ":iam::111111111111:role/cdk-hnb659fds-cfn-exec-role-111111111111-eu-central"
           ]
          ]
         },
         "ActionMode": "CHANGE_SET_REPLACE",
         "ChangeSetName": "PipelineChange",
         "TemplatePath": "Synth_Output::assembly-MyApplicationStack-MyTenantStage/MyApplicationStackMyTenantStagecrossregionstack111111111111useast18429F301.template.json"
        },
        "InputArtifacts": [
         {
          "Name": "Synth_Output"
         }
        ],
        "Name": "MyTenantPipeline-support-us-east-1.Prepare",
        "Region": "us-east-1",
        "RoleArn": {
         "Fn::Join": [
          "",
          [
           "arn:",
           {
            "Ref": "AWS::Partition"
           },
           ":iam::111111111111:role/cdk-hnb659fds-deploy-role-111111111111-eu-central"
          ]
         ]
        },
        "RunOrder": 1
       },
       {
        "ActionTypeId": {
         "Category": "Deploy",
         "Owner": "AWS",
         "Provider": "CloudFormation",
         "Version": "1"
        },
        "Configuration": {
         "StackName": "MyTenantStage-MyTenantPipeline-support-us-east-1",
         "ActionMode": "CHANGE_SET_EXECUTE",
         "ChangeSetName": "PipelineChange"
        },
        "Name": "MyTenantPipeline-support-us-east-1.Deploy",
        "Region": "us-east-1",
        "RoleArn": {
         "Fn::Join": [
          "",
          [
           "arn:",
           {
            "Ref": "AWS::Partition"
           },
           ":iam::111111111111:role/cdk-hnb659fds-deploy-role-111111111111-eu-central"
          ]
         ]
        },
        "RunOrder": 2
       }
      ]
```