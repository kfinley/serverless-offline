import execa from 'execa'
import { platform } from 'os'

export default async function detectDotNetCore(version) {
  try {
    const isWindows = platform() === 'win32'
    const dotnet = isWindows ? 'dotnet.exe' : 'dotnet'

    const { stdout: output } = await execa(dotnet, ['--list-sdks'])

    const versions = output.split('\n')
    for (let i = 0; i < versions.length; i += 1) {
      if (versions[i].startsWith(version)) {
        return true
      }
    }

    return false
  } catch (err) {
    console.log(err)
    return false
  }
}
