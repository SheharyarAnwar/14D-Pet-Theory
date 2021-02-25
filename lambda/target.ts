import { Context, AppSyncResolverEvent } from "aws-lambda";
import * as aws from "aws-sdk";

export async function handler(event: any, context: Context): Promise<any> {
  console.log(event, context);
  var ses = new aws.SES({ region: "ap-south-1" });
  var params = {
    Destination: {
      ToAddresses: [event.detail.arguments.email],
    },
    Message: {
      Body: {
        Text: { Data: event.detail.arguments.result },
      },

      Subject: { Data: "Test Email" },
    },
    Source: "sheharyar28@hotmail.com",
  };

  return ses
    .sendEmail(params)
    .promise()
    .then(() => {
      const sns = new aws.SNS({ region: "ap-south-1" });
      return sns
        .publish({
          Message: event.detail.arguments.result,
          PhoneNumber: event.detail.arguments.phoneNumber,
        })
        .promise();
    });
  //   return context;
}
