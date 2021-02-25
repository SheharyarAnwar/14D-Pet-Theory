import { ContextProvider } from "@aws-cdk/core";
import { Context, AppSyncResolverEvent } from "aws-lambda";
import { EventBridge } from "aws-sdk";

export async function handler(
  event: AppSyncResolverEvent<any>,
  context: any
): Promise<any> {
  // console.log(event, context, "Salvation")
  const eventBridge = new EventBridge({
    region: "ap-south-1",
  });
  const customEvent = await eventBridge
    .putEvents({
      Entries: [
        {
          EventBusName: "default",
          Source: "appsync",
          DetailType: "order",
          Detail: JSON.stringify({
            event: event.info.fieldName,
            arguments: event.arguments,
          }),
        },
      ],
    })
    .promise();
  console.log(
    "Original Event---->",
    event,
    "Context---->",
    context,
    "Custom Event---->",
    customEvent
  );
  const fieldName: any = event.info.fieldName;
  switch (fieldName) {
    case "addReport":
      return event.arguments;

    default:
      throw new Error("Something went wrong with supplied method");
  }
}
