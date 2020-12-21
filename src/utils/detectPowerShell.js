import execa from 'execa'
import { platform } from 'os'

export default async function detechPowerShell() {
  // TODO: detect specific versions?
  try {
    const isWindows = platform() === 'win32'
    const pwsh = isWindows ? 'powershell.exe' : 'pwsh'
    const { stdout: output } = await execa(pwsh, ['-v'])

    if (output.startsWith('PowerShell')) {
      return true
    }
    return false
  } catch (err) {
    console.log(err)
    return false
  }
}
