const { install, eachDir, run, currentDir, raw, remove } = require('../')
const path = require('path')
const fs = require('fs')

function getPkgJson (p) {
  return JSON.parse(
    fs.readFileSync(p, {
      encoding: 'utf-8'
    })
  )
}
jest.setTimeout(120000)
describe('default', () => {
  const fixtures = []
  const fixturesPaths = []
  const fixturesPath = path.resolve(__dirname, 'fixtures')

  beforeAll(async () => {
    await eachDir(fixturesPath, (f, p) => {
      fixtures.push(f)
      fixturesPaths.push(p)
    })
  })
  test('eachDir', async () => {
    expect(fixtures).toEqual(['npm-case', 'pnpm-case', 'yarn-case'])
  })

  test('currentDir', async () => {
    const res = []
    const name = 'npm-case'
    const t = path.resolve(__dirname, 'fixtures/' + name)
    await currentDir(t, (p) => {
      res.push(p)
    })
    expect(res).toEqual([name])
  })

  test('install & remove', async () => {
    const installPkgs = [
      'weapp-tailwindcss-webpack-plugin',
      'tailwindcss-rem2px-preset',
      'postcss-rem-to-responsive-pixel'
    ]
    await raw(path.resolve(__dirname, 'fixtures/pnpm-case'), 'install')
    await install(path.resolve(__dirname, 'fixtures'), true)
    await install(
      path.resolve(__dirname, 'fixtures'),
      '-D ' + installPkgs.map((x) => x + '@latest').join(' '),
      true
    )
    fixturesPaths.forEach((p) => {
      const pkg = path.resolve(p, 'package.json')
      const devDependencies = getPkgJson(pkg).devDependencies
      installPkgs.forEach((x) => {
        expect(Boolean(devDependencies[x])).toBe(true)
      })
    })
    const removePkgs = installPkgs.slice(1)
    await remove(
      path.resolve(__dirname, 'fixtures'),
      removePkgs.join(' '),
      true
    )

    fixturesPaths.forEach((p) => {
      const pkg = path.resolve(p, 'package.json')
      // delete require.cache[pkg]
      const devDependencies = getPkgJson(pkg).devDependencies
      removePkgs.forEach((x) => {
        expect(Boolean(devDependencies[x])).toBe(false)
      })
    })

    expect(true).toBe(true)
  })

  test('run', async () => {
    await run(path.resolve(__dirname, 'fixtures'), 'test', true)
    expect(true).toBe(true)
  })

  test('raw', async () => {
    await raw(path.resolve(__dirname, 'fixtures'), 'run test', true)
    expect(true).toBe(true)
  })
})
