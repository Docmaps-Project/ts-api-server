import type { ApiInfo } from './types'

export class ApiInstance {
  api_url: URL
  peers: URL[]
  expiry_max_seconds: number
  expiry_max_retrievals: number

  constructor(
    api_url: URL,
    peers: URL[] = [],
    expiry_max_seconds: number = 60,
    expiry_max_retrievals: number = 1,
  ) {
    this.api_url = api_url
    this.peers = peers
    this.expiry_max_seconds = expiry_max_seconds
    this.expiry_max_retrievals = expiry_max_retrievals
  }

  get_info(): ApiInfo {
    return {
      api_version: '0.1.0',
      api_url: this.api_url.toString(),
      ephemeral_document_expiry: {
        max_seconds: this.expiry_max_seconds,
        max_retrievals: this.expiry_max_retrievals,
      },
      peers: this.peers.map((p) => ({ api_url: p.toString() })),
    }
  }
}
