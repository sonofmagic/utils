import readline from 'readline'

import {
  defaultCustomConfigFilePath,
  defaultPath,
  operatingSystemName
} from './defaults'
import { createCustomConfig, getConfig } from './config'

import { exist, execute, createAlias, createPathCompat } from './utils'
import { compose } from './compose'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const isSupported = Boolean(defaultPath)
const argv = process.argv.slice(2)

// https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
// https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html

function rlSetConfig() {
  console.log('请设置微信web开发者工具 cli 的路径')
  console.log('> 提示：命令行工具默认所在位置：')
  console.log('- MacOS: <安装路径>/Contents/MacOS/cli')
  console.log('- Windows: <安装路径>/cli.bat')
  return new Promise((resolve, reject) => {
    rl.question('请输入微信web开发者工具cli路径：', async (cliPath) => {
      await createCustomConfig({
        cliPath
      })
      console.log(`全局配置存储位置：${defaultCustomConfigFilePath}`)
      resolve(cliPath)
    })
  })
}

const parseArgv = compose(
  createAlias({ find: '-p', replacement: '--project' }),
  createPathCompat('--result-output'),
  createPathCompat('-r'),
  createPathCompat('--qr-output'),
  createPathCompat('-o'),
  createPathCompat('--info-output'),
  createPathCompat('-i')
)

async function main() {
  if (isSupported) {
    const { cliPath } = await getConfig()
    const isExisted = await exist(cliPath)
    if (isExisted) {
      if (argv[0] === 'config') {
        await rlSetConfig()
        return
      }

      const formattedArgv = parseArgv(argv)

      await execute(cliPath, formattedArgv)
    } else {
      console.log(
        '在当前自定义路径中,未找到微信web开发者命令行工具，请重新指定路径'
      )
      await rlSetConfig()
    }
  } else {
    console.log(`微信web开发者工具不支持当前平台：${operatingSystemName} !`)
  }
}
main().finally(() => {
  process.exit()
})
