/* eslint-disable no-console */
import {CommitsComparison} from './compareCommits'
import * as core from '@actions/core'

export class Coverage {
  constructor(
    public file: string,
    public cover: number,
    public pass: boolean = true
  ) {}
}

export class FilesCoverage {
  constructor(
    public modifiedCover: Coverage[] | undefined,
    public newCover: Coverage[] | undefined
  ) {}
}

export function parseCoverageReport(
  report: string,
  files: CommitsComparison
): FilesCoverage {
  const threshModified = parseFloat(core.getInput('thresholdModified')) ?? 0
  const modifiedCover = getFilesCoverage(
    report,
    files.modifiedFiles,
    threshModified
  )

  const threshNew = parseFloat(core.getInput('thresholdNew')) ?? 0
  const newCover = getFilesCoverage(report, files.newFiles, threshNew)

  console.log(JSON.stringify(modifiedCover))
  console.log(JSON.stringify(newCover))
  return new FilesCoverage(modifiedCover, newCover)
}

function getFilesCoverage(
  report: string,
  files: string[] | undefined,
  threshold: number
): Coverage[] | undefined {
  return files?.map(file => {
    const fileName = file.replace(/\//g, '\\/')
    const regex = new RegExp(
      `.*filename="${fileName}" line-rate="(?<cover>[\\d\\.]+)".*`
    )
    const match = report.match(regex)
    const cover = match?.groups ? parseFloat(match.groups['cover']) : 1

    return new Coverage(file, cover, cover > threshold)
  })
}