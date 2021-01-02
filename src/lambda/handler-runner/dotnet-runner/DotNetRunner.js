import { EOL, platform } from 'os'
import execa from 'execa'
import { resolve } from 'path'

const { parse, stringify } = JSON
const { has } = Reflect
export default class DotnetRunner {
  #env = null
  #functionName = null
  #handler = null
  #deployPackage = null
  #allowCache = false
  #codeDir = null
  #handlerPath = null
  #dotnetOptions = null

  constructor(funOptions, env, allowCache, dotnetOptions) {
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
    this.#dotnetOptions = dotnetOptions
  }

  _parsePayload(value) {
    for (const item of value.split(EOL)) {
      let json
      // first check if it's JSON
      try {
        json = parse(item)
      } catch (err) {
        // nope, it's not JSON
        // no-op
      }

      // now let's see if we have a property __offline_payload__
      if (
        json &&
        typeof json === 'object' &&
        has(json, '__offline_payload__')
      ) {
        return stringify(json.__offline_payload__)
      }
    }

    return undefined
  }
  // no-op
  // () => void
  cleanup() {}

  async run(event, context) {
    let invoke = null

    if (this.#dotnetOptions.script.indexOf('/') > -1) {
      invoke = resolve(this.#dotnetOptions.script)
    } else {
      invoke = resolve(__dirname, this.#dotnetOptions.script)
    }

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
      return this._parsePayload(output)
    } catch (err) {
      console.log(err)
      return err
    }
  }
}
