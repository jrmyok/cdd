import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { config } from "dotenv";

config();

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
// USING RAILWAY INSTEAD
// const ec2Instance = new aws.ec2.Instance("myEC2Instance", {
//
// });

// Export the public IP address of the instance

// Define the Lambdas

const addNewCoinsLambda = new aws.lambda.Function("addNewCoinsFunction", {
  runtime: "nodejs18.x",
  code: new pulumi.asset.AssetArchive({
    "index.js": new pulumi.asset.FileAsset("../lambdas/add-new-coins.js"),
  }),
  timeout: 300,
  handler: "index.handler",
  role: lambdaRole.arn,
  environment: {
    variables: {
      CRONJOB_BASE_URL: pulumi.secret(process.env.CRONJOB_BASE_URL || ""),
      CRONJOB_SECRET_KEY: pulumi.secret(process.env.CRONJOB_SECRET_KEY || ""),
    },
  },
});

const openAiAnalysisLambda = new aws.lambda.Function("openAiAnalysisFunction", {
  runtime: "nodejs18.x",
  code: new pulumi.asset.AssetArchive({
    "index.js": new pulumi.asset.FileAsset("../lambdas/openai-analysis.js"),
  }),
  timeout: 300,
  handler: "index.handler",
  role: lambdaRole.arn,
  environment: {
    variables: {
      CRONJOB_BASE_URL: pulumi.secret(process.env.CRONJOB_BASE_URL || ""),
      CRONJOB_SECRET_KEY: pulumi.secret(process.env.CRONJOB_SECRET_KEY || ""),
    },
  },
});

const riskAnalysisLambda = new aws.lambda.Function("riskAnalysisFunction", {
  runtime: "nodejs18.x",
  code: new pulumi.asset.AssetArchive({
    "index.js": new pulumi.asset.FileAsset("../lambdas/risk-analysis.js"),
  }),
  timeout: 300,
  handler: "index.handler",
  role: lambdaRole.arn,
  environment: {
    variables: {
      CRONJOB_BASE_URL: pulumi.secret(process.env.CRONJOB_BASE_URL || ""),
      CRONJOB_SECRET_KEY: pulumi.secret(process.env.CRONJOB_SECRET_KEY || ""),
    },
  },
});

const scrapeWhitePapersLambda = new aws.lambda.Function(
  "scrapeWhitePapersFunction",
  {
    runtime: "nodejs18.x",
    code: new pulumi.asset.AssetArchive({
      "index.js": new pulumi.asset.FileAsset(
        "../lambdas/scrape-white-papers.js"
      ),
    }),
    timeout: 300,
    handler: "index.handler",
    role: lambdaRole.arn,
    environment: {
      variables: {
        CRONJOB_BASE_URL: pulumi.secret(process.env.CRONJOB_BASE_URL || ""),
        CRONJOB_SECRET_KEY: pulumi.secret(process.env.CRONJOB_SECRET_KEY || ""),
      },
    },
  }
);

const updateCoinDataLambda = new aws.lambda.Function("updateCoinDataFunction", {
  runtime: "nodejs18.x",
  code: new pulumi.asset.AssetArchive({
    "index.js": new pulumi.asset.FileAsset("../lambdas/update-coin-data.js"),
  }),
  timeout: 300,
  handler: "index.handler",
  role: lambdaRole.arn,
  environment: {
    variables: {
      CRONJOB_BASE_URL: pulumi.secret(process.env.CRONJOB_BASE_URL || ""),
      CRONJOB_SECRET_KEY: pulumi.secret(process.env.CRONJOB_SECRET_KEY || ""),
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

// Permissions for addNewCoinsLambda
const permissionAddNewCoins = new aws.lambda.Permission(
  "PermissionForAddNewCoinsFunction",
  {
    action: "lambda:InvokeFunction",
    function: addNewCoinsLambda.arn,
    principal: "events.amazonaws.com",
    sourceArn: ruleAddNewCoins.arn,
  }
);

// Permissions for openAiAnalysisLambda
const permissionOpenAiAnalysis = new aws.lambda.Permission(
  "PermissionForOpenAiAnalysisFunction",
  {
    action: "lambda:InvokeFunction",
    function: openAiAnalysisLambda.arn,
    principal: "events.amazonaws.com",
    sourceArn: ruleOpenAiAnalysis.arn,
  }
);

// Permissions for riskAnalysisLambda
const permissionRiskAnalysis = new aws.lambda.Permission(
  "PermissionForRiskAnalysisFunction",
  {
    action: "lambda:InvokeFunction",
    function: riskAnalysisLambda.arn,
    principal: "events.amazonaws.com",
    sourceArn: ruleRiskAnalysis.arn,
  }
);

// Permissions for scrapeWhitePapersLambda
const permissionScrapeWhitePapers = new aws.lambda.Permission(
  "PermissionForScrapeWhitePapersFunction",
  {
    action: "lambda:InvokeFunction",
    function: scrapeWhitePapersLambda.arn,
    principal: "events.amazonaws.com",
    sourceArn: ruleScrapeWhitePapers.arn,
  }
);

// Permissions for updateCoinDataLambda
const permissionUpdateCoinData = new aws.lambda.Permission(
  "PermissionForUpdateCoinDataFunction",
  {
    action: "lambda:InvokeFunction",
    function: updateCoinDataLambda.arn,
    principal: "events.amazonaws.com",
    sourceArn: ruleUpdateCoinData.arn,
  }
);
