import { debug } from "../../debug"
import * as node_fetch from "node-fetch"
import { Env } from "../../ci_source/ci_source"
import HttpsProxyAgent from "https-proxy-agent"
import { Agent } from "http"
import { api as fetch } from "../../api/fetch"

export interface GerritAccountInfo {
  name: String
  email: String
  username: String
}

export interface GerritPRDSL {
  id: string
  change_id: string

  project: string
  branch: string

  owner: GerritAccountInfo

  work_in_progress: boolean

  /** Title of the pull request. */
  title: string
  /** The text describing the PR */
  subject: string
  /** The pull request's current status. */
  status: "NEW" | "MERGED" | "ABANDONED"
  /** Is the PR open? */
  open: boolean
  /** Is the PR closed? */
  closed: boolean
  /** Date PR created as number of milliseconds since the unix epoch */
  created: number
  /** Date PR updated as number of milliseconds since the unix epoch */
  updated: number
  /** Number of lines added in this PR */
  insertions: number
  /** Number of lines deleted in this PR */
  deletions: number
}

export interface GerritRepoCredentials {
  host: string
  username?: string
  password?: string
}

/** Key details about a repo */
export interface RepoMetaData {
  /** The ID for the pull/merge request "{project}~{branch}~{commit-hash}" */
  changeID: string
}

export function gerritRepoCredentialsFromEnv(env: Env): GerritRepoCredentials {
  if (!env["DANGER_GERRIT_HOST"]) {
    throw new Error(`DANGER_GERRIT_HOST is not set`)
  }
  return {
    host: env["DANGER_GERRIT_HOST"],
    username: env["DANGER_GERRIT_USERNAME"],
    password: env["DANGER_GERRIT_PASSWORD"],
  }
}

export class GerritAPI {
  fetch: typeof fetch
  private readonly d = debug("GerritAPI")

  private pr: GerritPRDSL | undefined

  constructor(public readonly repoMetadata: RepoMetaData, public readonly repoCredentials: GerritRepoCredentials) {
    // This allows Peril to DI in a new Fetch function
    // which can handle unique API edge-cases around integrations
    this.fetch = fetch
  }

  getPullRequestInfo = async (): Promise<GerritPRDSL> => {
    if (this.pr) {
      return this.pr
    }

    const path = `a/changes/${this.repoMetadata.changeID}`
    const res = await this.get(path)
    throwIfNotOk(res)
    const prDSL = (await res.json()) as GerritPRDSL
    this.pr = prDSL
    return prDSL
  }

  // API implementation

  private api = (path: string, headers: any = {}, body: any = {}, method: string, suppressErrors?: boolean) => {
    if (this.repoCredentials.password) {
      headers["Authorization"] = `Basic ${new Buffer(
        this.repoCredentials.username + ":" + this.repoCredentials.password
      ).toString("base64")}`
    }

    const url = `${this.repoCredentials.host}/${path}`
    this.d(`${method} ${url}`)

    // Allow using a proxy configured through environmental variables
    // Remember that to avoid the error "Error: self signed certificate in certificate chain"
    // you should also do: "export NODE_TLS_REJECT_UNAUTHORIZED=0". See: https://github.com/request/request/issues/2061
    let agent: Agent | undefined = undefined
    let proxy = process.env.http_proxy || process.env.https_proxy
    if (proxy) {
      agent = new HttpsProxyAgent(proxy)
    }

    return this.fetch(
      url,
      {
        method,
        body,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        agent,
      },
      suppressErrors
    )
  }

  get = (path: string, headers: any = {}, suppressErrors?: boolean): Promise<node_fetch.Response> =>
    this.api(path, headers, null, "GET", suppressErrors)

  post = (path: string, headers: any = {}, body: any = {}, suppressErrors?: boolean): Promise<node_fetch.Response> =>
    this.api(path, headers, JSON.stringify(body), "POST", suppressErrors)

  put = (path: string, headers: any = {}, body: any = {}): Promise<node_fetch.Response> =>
    this.api(path, headers, JSON.stringify(body), "PUT")

  delete = (path: string, headers: any = {}, body: any = {}): Promise<node_fetch.Response> =>
    this.api(path, headers, JSON.stringify(body), "DELETE")
}

function throwIfNotOk(res: node_fetch.Response) {
  if (!res.ok) {
    let message = `${res.status} - ${res.statusText}`
    if (res.status >= 400 && res.status < 500) {
      message += ` (Have you set DANGER_GERRIT_USERNAME and DANGER_GERRIT_PASSWORD?)`
    }
    throw new Error(message)
  }
}
