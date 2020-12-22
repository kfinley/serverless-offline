import { platform } from 'os'
import execa from 'execa'
import { resolve } from 'path'

const { parse, stringify } = JSON

export default class DotNetRunner {
  #env = null
  #functionName = null
  #handler = null
  #deployPackage = null
  #allowCache = false
  #codeDir = null
  #handlerPath = null

  constructor(funOptions, env, allowCache) {
    const {
      functionName,
      handler,
      servicePackage,
      functionPackage,
      codeDir,
      handlerPath,
    } = funOptions

    this.#env = env
    this.#functionName = functionName
    this.#handler = handler
    this.#handlerPath = handlerPath
    this.#deployPackage = functionPackage || servicePackage
    this.#allowCache = allowCache
    this.#codeDir = codeDir
  }

  // no-op
  // () => void
  cleanup() {}

  async run(event, context) {
    const invoke = resolve(__dirname, 'invoke.ps1')
    const assembly = `${this.#codeDir}/${this.#handlerPath.split('.')[0]}.dll`
    const isWindows = platform() === 'win32'
    const pwsh = isWindows ? 'powershell.exe' : 'pwsh'

    try {
      const { stdout: output } = await execa(pwsh, [
        invoke,
        assembly,
        this.#handlerPath,
        this.#handler.split('::')[2],
        stringify(event),
        stringify(context),
      ])

      try {
        console.log(parse(output))
      } catch (err) {
        console.log(output)
      }

      // Returning raw output from assembly
      // This will be a stringified json
      // result with escapes.
      return output
    } catch (err) {
      console.log(err)
      return err
    }
  }
}
