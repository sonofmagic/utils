import os from 'os'
import COS from 'cos-nodejs-sdk-v5'
import klaw from 'klaw'
import fs from 'fs'
import path from 'path'
import cliProgress from 'cli-progress'
import { directorySize } from './util'
const isWindows = os.type() === 'Windows_NT'

export interface UploadDirOptions {
  Region?: string
  Bucket?: string
  /**
   * @description cwd() is the current working directory of the process.
   */
  root?: string
  targetDir?: string
  CacheControl?: string
}

export class TencentCOSWebsiteDeployer {
  public cos: COS
  constructor (options: COS.COSOptions) {
    this.cos = new COS(options)
  }

  putObject (params: COS.PutObjectParams) {
    const { cos } = this
    return cos.putObject(params)
  }

  getBucketWebsite (params: COS.GetBucketWebsiteParams) {
    const { cos } = this
    return cos.getBucketWebsite(params)
  }

  async uploadDir (options: UploadDirOptions = {}) {
    const {
      Bucket = '',
      Region = '',
      targetDir = 'dist',
      CacheControl = 'public,max-age=31536000',
      root = process.cwd()
    } = options
    if (!Bucket) {
      throw new Error('Bucket is required')
    }
    if (!Region) {
      throw new Error('Region is required')
    }

    const absTargetPath = path.resolve(root, targetDir)
    // create bar
    const totalSize = await directorySize(absTargetPath)
    const bar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    )
    bar.start(100, 0)
    // --------------------------------------------------
    let uploadSize = 0
    const res: COS.PutObjectResult[] = []
    for await (const file of klaw(absTargetPath)) {
      const { path: absPath, stats } = file
      if (stats.isFile()) {
        let Key = absPath.replace(absTargetPath, '')
        if (isWindows) {
          Key = Key.replace(/\\/g, '/')
        }
        const opt: COS.PutObjectParams = {
          Key,
          Body: fs.createReadStream(absPath),
          Bucket,
          Region
        }
        if (!/\.html$/.test(absPath)) {
          opt.CacheControl = CacheControl
        }
        res.push(await this.putObject(opt))

        uploadSize += stats.size
        bar.update(parseFloat(((uploadSize * 100) / totalSize).toFixed(2)))
      }
    }
    bar.stop()
    console.log('Deploy successfully!')
    const website = await this.getBucketWebsite({
      Bucket,
      Region
    })
    if (website.statusCode === 200 && website.WebsiteConfiguration) {
      console.log(`https://${Bucket}.cos-website.${Region}.myqcloud.com`)
    }
    return res
  }
}
