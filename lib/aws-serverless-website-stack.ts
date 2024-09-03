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
    // Cloudfront distribution
    //
    const certificateID = process.env["STATIC_WEB_CERT_ID"]|| 'not-defined';
    const certAliasName = process.env["STATIC_WEB_ALIAS"]|| 'not-defined';

    const staticWebDistribution = new cloudfront.CloudFrontWebDistribution(this, 'MyDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: staticWebContentBucket,
          },
          behaviors : [ {isDefaultBehavior: true}],
        },
      ],
      // For now, manually creating certificate
      viewerCertificate: cloudfront.ViewerCertificate.fromIamCertificate(
          certificateID,
          {
            aliases: [certAliasName],
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021, // default
          },
      ),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
    });
  }
}
