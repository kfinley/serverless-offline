using System.IO;
using System.Text;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Serialization.SystemTextJson;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(DefaultLambdaJsonSerializer))]

namespace Serverless {
    public class Function {

        public APIGatewayProxyResponse HelloHandler(APIGatewayProxyRequest @event, ILambdaContext context) {
            var result = new {
                message = "Hello, dotnetcore!"
            };
            context.Logger.Log('This is a test log. Will not be included in response but will show in Debug console.');
            return new APIGatewayProxyResponse {
                Body = Serialize(result, new DefaultLambdaJsonSerializer()),
                StatusCode = 200,
            };
        }

        public APIGatewayProxyResponse EventHandler(APIGatewayProxyRequest @event, ILambdaContext context) {
            var serializer = new DefaultLambdaJsonSerializer();
            var payload = Deserialize<object>(@event.Body, serializer);
            var type = @event.GetType().ToString();
            return new APIGatewayProxyResponse {
                Body = Serialize(new {
                    payload = payload,
                    type,
                    output = "success!"
                }, serializer),
                StatusCode = 200,
            };
        }

        public APIGatewayProxyResponse ContextHandler(APIGatewayProxyRequest @event, ILambdaContext context) {
            
            return new APIGatewayProxyResponse {
                Body = Serialize(new {
                    context = context,
                    output = "success!"
                }, new DefaultLambdaJsonSerializer()),
                StatusCode = 200,
            };
        }

        private string Serialize<T>(T value, ILambdaSerializer serializer) {
            using var buffer = new MemoryStream();
            serializer.Serialize<T>(value, buffer);
            return Encoding.UTF8.GetString(buffer.ToArray());
        }

        private T Deserialize<T>(string data, ILambdaSerializer serializer) {
            using var stream = new MemoryStream(Encoding.UTF8.GetBytes(data));
            return serializer.Deserialize<T>(stream);
        }

    }
}
