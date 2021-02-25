import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as appsync from "@aws-cdk/aws-appsync";
import {
  ServicePrincipal,
  Role,
  PolicyStatement,
  Effect,
} from "@aws-cdk/aws-iam";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
export class PetTheoryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const sourceHandler = new lambda.Function(
      this,
      "Pet-Theory-Source-Lambda",
      {
        code: new lambda.AssetCode("lambda"),
        handler: "source.handler",
        runtime: lambda.Runtime.NODEJS_12_X,
      }
    );
    events.EventBus.grantPutEvents(sourceHandler);
    const graphEndPoint = new appsync.GraphqlApi(
      this,
      "GraphEndPointPetTheory",
      {
        name: "sherry-pet-theory",
        schema: appsync.Schema.fromAsset("schema/index.gql"),
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: appsync.AuthorizationType.API_KEY,
            apiKeyConfig: {
              expires: cdk.Expiration.after(cdk.Duration.days(365)),
            },
          },
        },
      }
    );
    const appsyncEventBridgeRole = new Role(this, "AppSyncEventBridgeRole", {
      assumedBy: new ServicePrincipal("appsync.amazonaws.com"),
    });

    appsyncEventBridgeRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: ["events:Put*"],
      })
    );
    const dataSource = graphEndPoint.addLambdaDataSource(
      "PetTheoryDatasource",
      sourceHandler
    );
    dataSource.createResolver({
      fieldName: "addReport",
      typeName: "Mutation",
    });
    const emailRole = new Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    emailRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["ses:SendEmail", "ses:SendRawEmail", "sns:Publish", "logs:*"],
        resources: ["*"],
      })
    );
    const targetHandler = new lambda.Function(
      this,
      "PetTheoryBridgTargetHandlerSheharyar",
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "target.handler",
        code: lambda.Code.fromAsset("lambda"),
        role: emailRole,
      }
    );
    const rule = new events.Rule(this, "AppSyncEventBridgeRuleNew2", {
      eventPattern: {
        source: ["appsync"],
      },
      targets: [new targets.LambdaFunction(targetHandler)],
    });
  }
}
