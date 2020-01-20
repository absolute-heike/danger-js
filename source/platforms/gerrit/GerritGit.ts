import { debug } from "../../debug"
import { GerritDSL } from "../../dsl/GerritDSL"
import { GitDSL, GitJSONDSL } from "../../dsl/GitDSL"
import { gitJSONToGitDSL, GitJSONToGitDSLConfig, GitStructuredDiff } from "../git/gitJSONToGitDSL"

const d = debug("GerritGit")

export const gerritGitDSL = (gerrit: GerritDSL, json: GitJSONDSL): GitDSL => {
  const config: GitJSONToGitDSLConfig = {
    repo: gerrit.repo,
    baseSHA: gerrit.baseSHA,
    headSHA: gerrit.headSHA,
    getFileContents: async (): Promise<string> => {
      throw new Error("getFileContents is not yet implemented")
    },
    getFullDiff: async (): Promise<string> => {
      throw new Error("getFullDiff is not yet implemented")
    },
    getStructuredDiffForFile: async (): Promise<GitStructuredDiff> => {
      throw new Error("getStructuredDiffForFile is not yet implemented")
    },
  }

  d("Setting up git DSL with: ", config)
  return gitJSONToGitDSL(json, config)
}
