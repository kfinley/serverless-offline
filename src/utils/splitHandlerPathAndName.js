// some-folder/src.index => some-folder/src
export default function splitHandlerPathAndName(handler) {
  let parts = null
  // dotnet handler paths
  if (handler.indexOf('::') > 0) {
    const fqnParts = handler.split('::')
    // Serverless::Serverless.Function::Handler
    parts = [fqnParts[1], fqnParts[2]]
  } else {
    // Split handler into method name and path i.e. handler.run
    // Support nested paths i.e. ./src/somefolder/.handlers/handler.run
    const delimiter = handler.lastIndexOf('.')
    const path = handler.substr(0, delimiter)
    const name = handler.substr(delimiter + 1)

    parts = [path, name]
  }
  return parts
}
