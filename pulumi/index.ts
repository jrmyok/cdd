import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Define the IAM role for Lambda execution
const lambdaRole = new aws.iam.Role("lambdaRole", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "lambda.amazonaws.com",
  }),
});

// Attach necessary policies to the IAM role
const lambdaPolicy = new aws.iam.RolePolicyAttachment("lambdaPolicy", {
  role: lambdaRole,
  policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
});

// Define the EC2 instance
const ec2Instance = new aws.ec2.Instance("myEC2Instance", {
  instanceType: "t2.micro",
  ami: "ami-xxxxxxxx",
  keyName: "myKeyPair",
  userData: pulumi.interpolate`#!/bin/bash
    # Install necessary software and configure the instance
    # ...
    # Run any additional setup commands here
  `,
});

// Export the public IP address of the instance
export const ec2InstancePublicIp = ec2Instance.publicIp;

// Define the Lambdas

const addNewCoinsLambda = new aws.lambda.Function("addNewCoinsFunction", {
  runtime: aws.lambda.NodeJS12dXRuntime,
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("../lambdas/add-new-coins"),
  }),
  timeout: 300,
  handler: "index.handler",
  role: lambdaRole.arn,
  environment: {
    variables: {
      EC2_IP: pulumi.interpolate`${ec2Instance.publicIp}`,
      SECRET_KEY: pulumi.secret(""),
    },
  },
});

const openAiAnalysisLambda = new aws.lambda.Function("openAiAnalysisFunction", {
  runtime: aws.lambda.NodeJS12dXRuntime,
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("../lambdas/openai-analysis"),
  }),
  timeout: 300,
  handler: "index.handler",
  role: lambdaRole.arn,
  environment: {
    variables: {
      EC2_IP: pulumi.interpolate`${ec2Instance.publicIp}`,
      SECRET_KEY: pulumi.secret("cronjobSecretKey"),
    },
  },
});

const riskAnalysisLambda = new aws.lambda.Function("riskAnalysisFunction", {
  runtime: aws.lambda.NodeJS12dXRuntime,
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("../lambdas/risk-analysis"),
  }),
  timeout: 300,
  handler: "index.handler",
  role: lambdaRole.arn,
  environment: {
    variables: {
      EC2_IP: pulumi.interpolate`${ec2Instance.publicIp}`,
      SECRET_KEY: pulumi.secret("cronjobSecretKey"),
    },
  },
});

const scrapeWhitePapersLambda = new aws.lambda.Function(
  "scrapeWhitePapersFunction",
  {
    runtime: aws.lambda.NodeJS12dXRuntime,
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("../lambdas/scrape-white-papers"),
    }),
    timeout: 300,
    handler: "index.handler",
    role: lambdaRole.arn,
    environment: {
      variables: {
        EC2_IP: pulumi.interpolate`${ec2Instance.publicIp}`,
        SECRET_KEY: pulumi.secret("cronjobSecretKey"),
      },
    },
  }
);

const updateCoinDataLambda = new aws.lambda.Function("updateCoinDataFunction", {
  runtime: aws.lambda.NodeJS12dXRuntime,
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("../lambdas/update-coin-data"),
  }),
  timeout: 300,
  handler: "index.handler",
  role: lambdaRole.arn,
  environment: {
    variables: {
      EC2_IP: pulumi.interpolate`${ec2Instance.publicIp}`,
      SECRET_KEY: pulumi.secret("cronjobSecretKey"),
    },
  },
});

// Define the CloudWatch Event rules

const ruleAddNewCoins = new aws.cloudwatch.EventRule(
  "scheduled-cronjob-add-new-coins",
  {
    scheduleExpression: "cron(0 12 * * ? *)", // Run once a day at 12:00 PM UTC
  }
);

const ruleOpenAiAnalysis = new aws.cloudwatch.EventRule(
  "scheduled-cronjob-openai-analysis",
  {
    scheduleExpression: "cron(0 13 * * ? *)", // Run once a day at 1:00 PM UTC
  }
);

const ruleRiskAnalysis = new aws.cloudwatch.EventRule(
  "scheduled-cronjob-risk-analysis",
  {
    scheduleExpression: "cron(0 14 * * ? *)", // Run once a day at 2:00 PM UTC
  }
);

const ruleScrapeWhitePapers = new aws.cloudwatch.EventRule(
  "scheduled-cronjob-scrape-white-papers",
  {
    scheduleExpression: "cron(0 15 ? * MON *)", // Run once a week on Mondays at 3:00 PM UTC
  }
);

const ruleUpdateCoinData = new aws.cloudwatch.EventRule(
  "scheduled-cronjob-update-coin-data",
  {
    scheduleExpression: "rate(30 minutes)", // Run every 30 minutes
  }
);

// Create the event targets
const targetAddNewCoins = new aws.cloudwatch.EventTarget(
  "event-target-add-new-coins",
  {
    rule: ruleAddNewCoins.name,
    arn: addNewCoinsLambda.arn,
  }
);

const targetOpenAiAnalysis = new aws.cloudwatch.EventTarget(
  "event-target-openai-analysis",
  {
    rule: ruleOpenAiAnalysis.name,
    arn: openAiAnalysisLambda.arn,
  }
);

const targetRiskAnalysis = new aws.cloudwatch.EventTarget(
  "event-target-risk-analysis",
  {
    rule: ruleRiskAnalysis.name,
    arn: riskAnalysisLambda.arn,
  }
);

const targetScrapeWhitePapers = new aws.cloudwatch.EventTarget(
  "event-target-scrape-white-papers",
  {
    rule: ruleScrapeWhitePapers.name,
    arn: scrapeWhitePapersLambda.arn,
  }
);

const targetUpdateCoinData = new aws.cloudwatch.EventTarget(
  "event-target-update-coin-data",
  {
    rule: ruleUpdateCoinData.name,
    arn: updateCoinDataLambda.arn,
  }
);
