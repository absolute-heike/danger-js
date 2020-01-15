import * as url from "url"
import includes from "lodash.includes"
import { BitBucketServer } from "./BitBucketServer"
import { GitHub } from "./GitHub"
import GitLab from "./GitLab"
import { BitBucketCloud } from "./BitBucketCloud"
import { Gerrit } from "./Gerrit"

export interface PullRequestParts {
  pullRequestNumber: string
  repo: string
  platform: string
}

export function pullRequestParser(address: string): PullRequestParts | null {
  const components = url.parse(address, false)

  if (components && components.path) {
    // shape: http://localhost:7990/projects/PROJ/repos/repo/pull-requests/1/overview
    const parts = components.path.match(/(projects\/\w+\/repos\/[\w-_.]+)\/pull-requests\/(\d+)/)
    if (parts) {
      return {
        platform: BitBucketServer.name,
        repo: parts[1],
        pullRequestNumber: parts[2],
      }
    }

    // shape: https://bitbucket.org/proj/repo/pull-requests/1
    if (includes(components.path, "pull-requests")) {
      return {
        platform: BitBucketCloud.name,
        repo: components.path.split("/pull-requests")[0].slice(1),
        pullRequestNumber: components.path.split("/pull-requests/")[1].split("/")[0],
      }
    }

    // shape: http://github.com/proj/repo/pull/1
    if (includes(components.path, "pull")) {
      return {
        platform: GitHub.name,
        repo: components.path.split("/pull")[0].slice(1),
        pullRequestNumber: components.path.split("/pull/")[1],
      }
    }

    // shape: https://gitlab.com/GROUP[/SUBGROUP]/PROJ/merge_requests/123
    if (includes(components.path, "merge_requests")) {
      const regex = /\/(.+)\/merge_requests\/(\d+)/
      const parts = components.path.match(regex)
      if (parts) {
        return {
          platform: GitLab.name,
          repo: parts[1],
          pullRequestNumber: parts[2],
        }
      }
    }

    // shape: http://localhost:8080/changes/Test~master~Ib34169f453fee034ca06550065de99b439b167e0
    if (includes(components.path, "changes")) {
      const prInfo = components.path.split("/changes/")[1]

      if (prInfo) {
        const repo = prInfo.split("~")[0]
        const branch = prInfo.split("~")[1]
        const changeID = prInfo.split("~")[2]

        return {
          platform: Gerrit.name,
          repo: repo,
          pullRequestNumber: branch + "~" + changeID,
        }
      }
    }
  }

  return null
}
