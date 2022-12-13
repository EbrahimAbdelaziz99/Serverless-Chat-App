import { 
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
    PostToConnectionCommandInput
} from "@aws-sdk/client-apigatewaymanagementapi"


export const websocket = {
    createUser:({
        domainName,
        stage
    }: {
        domainName:string,
        stage:string
    }) => {

        const client = new ApiGatewayManagementApiClient({
            endpoint:`https://${domainName}/${stage}`
        });

        return client;
    },
    send: ({
        data,
        connectionId,
        domainName,
        stage,
        client
    }:{
        data:{
            message?:string,
            type?:string,
            from?:string
        },
        connectionId:string,
        domainName?:string,
        stage?:string,
        client?:ApiGatewayManagementApiClient
    }) => {
        if(!client) {
            if(!domainName || !stage){
                throw Error('domain name or stage is required when no client is passed in!')
            }
            client = websocket.createUser({domainName,stage});
        }

        const params:PostToConnectionCommandInput = {
            Data: JSON.stringify(data) as any,
            ConnectionId:connectionId
        } 

        const command = new PostToConnectionCommand(params);

        return client.send(command)
    }
}