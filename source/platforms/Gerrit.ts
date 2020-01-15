import { Platform, Comment } from "./platform"
import { GerritAPI, GerritPRDSL } from "./gerrit/GerritAPI"
import { GitJSONDSL } from "../dsl/GitDSL"
import { DangerResults } from "../dsl/DangerResults"
import { ExecutorOptions } from "../runner/Executor"

export class Gerrit implements Platform {
  name: string

  constructor(public readonly api: GerritAPI) {
    this.name = "Gerrit"
  }

  getReviewInfo = (): Promise<any> => {
    return Promise.resolve({})
  }

  getPlatformReviewDSLRepresentation = (): Promise<any> => {
    return Promise.resolve({})
  }

  getPlatformReviewSimpleRepresentation?: (() => Promise<any>) | undefined

  getPlatformGitRepresentation = (): Promise<GitJSONDSL> => {
    const gitInfo = {} as GitJSONDSL

    return Promise.resolve(gitInfo)
  }

  getFileContents = (path: string, slug?: string | undefined, ref?: string | undefined): Promise<string> => {
    return Promise.resolve("")
  }

  // executeRuntimeEnvironment?: ((start: (filenames: string[], originalContents: string[] | undefined[] | undefined, environment: any, injectedObjectToExport?: any) => Promise<DangerResults>, dangerfilePath: string, environment: any) => Promise<...>) | undefined;

  // platformResultsPreMapper?: ((results: DangerResults, options: ExecutorOptions, ciCommitHash?: string | undefined) => Promise<DangerResults>) | undefined;

  supportsCommenting() {
    return true
  }

  supportsInlineComments() {
    return true
  }

  handlePostingResults?: ((results: DangerResults, options: ExecutorOptions) => void) | undefined

  getInlineComments = (dangerID: string): Promise<Comment[]> => {
    return Promise.resolve([])
  }

  createComment = (dangerID: string, body: string): Promise<any> => {
    return Promise.resolve(null)
  }

  createInlineComment = (
    git: import("../dsl/GitDSL").GitDSL,
    comment: string,
    path: string,
    line: number
  ): Promise<any> => {
    return Promise.resolve(null)
  }

  updateInlineComment = (comment: string, commentId: string): Promise<any> => {
    return Promise.resolve(null)
  }

  deleteInlineComment = (commentId: string): Promise<boolean> => {
    return Promise.resolve(true)
  }

  deleteMainComment = (dangerID: string): Promise<boolean> => {
    return Promise.resolve(true)
  }

  updateOrCreateComment = (dangerID: string, newComment: string): Promise<string | undefined> => {
    return Promise.resolve("commentID?")
  }

  updateStatus = (
    passed: boolean | "pending",
    message: string,
    url?: string | undefined,
    dangerID?: string | undefined,
    commitHash?: string | undefined
  ): Promise<boolean> => {
    return Promise.resolve(true)
  }
}
