$dll=$args[0]
$handlerPath=$args[1]
$handler=$args[2]
$eventInput=$args[3]
$context=$args[4]

$dllFileName = Split-Path $dll -leaf
$lambdaCorePath = $dll.Replace($dllFileName, 'Amazon.Lambda.Core.dll')

# Define a FakeLambdaContext to use for deserializing context
# Include required references. 
# netstandard must be included for System
$lambdaCore = (
    "netstandard, Version=2.0.0.0, Culture=neutral, PublicKeyToken=cc7b13ffcd2ddd51",    
    $lambdaCorePath
)

$fakeLambdaContextSource = @"
using Amazon.Lambda.Core;
using System;
public class FakeLambdaContext : ILambdaContext {
    public string AwsRequestId { get; set; }
    public IClientContext ClientContext { get; set; }
    public string FunctionName { get; set; }
    public string FunctionVersion { get; set; }
    public ICognitoIdentity Identity { get; set; }
    public string InvokedFunctionArn { get; set; }
    public ILambdaLogger Logger { get; set; }
    public string LogGroupName { get; set; }
    public string LogStreamName { get; set; }
    public int MemoryLimitInMB { get; set; }
    public TimeSpan RemainingTime { get; set; }    
}
"@

# Add FakeLambdaContext and Handler assembly
Add-Type -ReferencedAssemblies $lambdaCore -TypeDefinition $fakeLambdaContextSource
Add-Type -AssemblyName $dll

$instance = New-Object $handlerPath
# Get the Handler method we can determine the correct EventRequest type to use for deserializing event
$handlerMethod = $instance.GetType().GetMethod($handler, [Reflection.BindingFlags] "Public,Instance")
$handlerParams = $handlerMethod.GetParameters()

# Create a fake to use for passing Type to DeserializeObject
$fake = New-Object FakeLambdaContext

# Deserialize param data
$eventObj = [Newtonsoft.Json.JsonConvert]::DeserializeObject($eventInput, $handlerParams[0].ParameterType)
$contextObj = [Newtonsoft.Json.JsonConvert]::DeserializeObject($context, $fake.GetType())

# Call the method on the Handler class instance
$response = $instance.$handler($eventObj, $contextObj)

# Return the result Body
Write-Host $response.Body -NoNewline
