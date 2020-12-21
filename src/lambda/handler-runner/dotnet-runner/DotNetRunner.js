import { EOL, platform } from 'os'
import execa from 'execa'
import { resolve } from 'path'

const { parse, stringify } = JSON
const { has } = Reflect

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

  _parsePayload(value) {
    for (const item of value.split(EOL)) {
      let json

      // first check if it's JSON
      try {
        json = parse(item)
        // nope, it's not JSON
      } catch (err) {
        // no-op
      }

      // now let's see if we have a property __offline_payload__
      if (
        json &&
        typeof json === 'object' &&
        has(json, '__offline_payload__')
      ) {
        return json.__offline_payload__
      }
    }

    return value
  }

  async run(event, context) {
    const invoke = resolve(__dirname, 'invoke.ps1')
    const assembly = `${this.#codeDir}/${this.#handlerPath.split('.')[0]}.dll`
    const isWindows = platform() === 'win32'
    const pwsh = isWindows ? 'powershell.exe' : 'pwsh'
    const { stdout: output } = await execa(pwsh, [
      invoke,
      assembly,
      this.#handlerPath,
      this.#handler.split('::')[2],
      stringify(event),
      stringify(context),
    ])
    const result = output
    console.log(result)

    try {
      return this._parsePayload(result)
    } catch (err) {
      console.log(result)
      return err
    }
  }
}
