import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

export class AwsServerlessWebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //
    // Bucket for static content
    //
    const staticWebContentBucketName = process.env["STATIC_WEB_CONTENT_BUCKET"]|| 'not-defined';
    const staticWebContentBucket = new s3.Bucket(this, staticWebContentBucketName, {
      bucketName: staticWebContentBucketName,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    //
    //
    //
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');

  }
}
