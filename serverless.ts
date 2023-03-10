import type { AWS } from '@serverless/typescript';

import functions from './serverless/functions';
import dynamoResources from './serverless/dynamoResources';

const serverlessConfiguration: AWS = {
  service: 'chatApp',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild','serverless-iam-roles-per-function'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile:"EbrahimSLS",
    // iamRoleStatements, deprecated statment 
    iam:{
      role: {
        statements: [
          {
            Effect:'Allow',
            Action:'dynamodb:*',
            Resource:'*'
          }
        ]
      }
    },
    region:"me-south-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      
      roomConnectionTable:'${self:custom.roomConnectionTable}',

      baseUrl:{
        'Fn::Join':[
          "",
          [
            "https://",
            ".execute-api.${self:provider.region}.amazonaws.com"
          ]
        ]
      }
    },
  },
  // import the function via paths

  functions,
  
  package: { individually: true },

  resources:{
    Resources: {
      ...dynamoResources,
    }
  },

  custom: {

    roomConnectionTable:'${sls:stage}-roomConnection-Table',

    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
