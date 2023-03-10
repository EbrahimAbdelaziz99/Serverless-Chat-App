import { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { UserConnectionRecord } from "src/types/dynamo";
import { websocket } from "@libs/websocket";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { name, roomCode } = JSON.parse(event.body);

    const tableName: string = process.env.roomConnectionTable;

    const { connectionId, domainName, stage } = event.requestContext;

    if (!name) {
      await websocket.send({
        data: {
          message: "You need 'name' to join a Room",
          type: "err",
        },
        connectionId,
        domainName,
        stage,
      });
      return formatJSONResponse({});
    }

    if (!roomCode) {
      await websocket.send({
        data: {
          message: "You need 'roomCode' to Join a Room",
          type: "err",
        },
        connectionId,
        domainName,
        stage,
      });
      return formatJSONResponse({});
    }

    const roomUsers = await dynamo.query({
      pkValue: roomCode,
      tableName,
      index: "index1",
      limit: 1,
    });

    if (roomUsers.length === 0) {
      await websocket.send({
        data: {
          message: "No Room with That Code , please create your own!",
          type: "err",
        },
        connectionId,
        domainName,
        stage,
      });
      return formatJSONResponse({});
    }

    const data: UserConnectionRecord = {
      id: connectionId,
      pk: roomCode,
      sk: connectionId,
      roomCode,
      name: name,
      domainName,
      stage,
    };

    await dynamo.write(data, tableName);

    await websocket.send({
      data: {
        message: `you are now connected to room ${roomCode}`,
        type: "info",
      },
      connectionId,
      domainName,
      stage,
    });

    return formatJSONResponse({});
  } catch (error) {
    console.log("error", error);
    return formatJSONResponse({
      statusCode: 502,
      data: {
        message: error.message,
      },
    });
  }
};
