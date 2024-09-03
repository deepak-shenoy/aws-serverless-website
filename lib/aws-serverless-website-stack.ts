/*
 * Serverless Website Script
 * Deepak Shenoy
 * September 2nd, 2024
 *
 * Certificate and DNS entries are manually created
 * For security and privacy, manual artifacts are specified as
 * environmental variables to be used in the script.
 */
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3_content_deployment from "aws-cdk-lib/aws-s3-deployment";

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
    // Deploy static web content
    //
    const staticDestinationBucket = new s3.Bucket(this, staticWebContentBucketName);
    const staticWebContentDeployment = new s3_content_deployment.BucketDeployment(this, 'Deployment', {
      sources: [s3_content_deployment.Source.asset('./artifacts/static-web/index.html')],
      destinationBucket: staticDestinationBucket,
    });

    //
    // Cloudfront distribution
    //
    const certificateID = process.env["STATIC_WEB_CERT_ID"]|| 'not-defined';
    const certAliasName = process.env["STATIC_WEB_ALIAS"]|| 'not-defined';
    const certificateARN = process.env["STATIC_WEB_CERT_ARN"]|| 'not-defined';

    const staticWebDistribution = new cloudfront.CloudFrontWebDistribution(this, 'StaticDist', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: staticWebContentBucket,
          },
          behaviors : [ {isDefaultBehavior: true}],
        },
      ],
      // For now, manually creating certificate (specified ARN)
      viewerCertificate: {
        aliases: [certAliasName],
        props: {
          acmCertificateArn: certificateARN,
          sslSupportMethod: 'sni-only',
          minimumProtocolVersion: 'TLSv1.2_2021',
        }
      },
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
    });
  }
}
