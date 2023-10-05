// Important comment
export type ApiInfo = {
  api_url: string
  api_version: string
  ephemeral_document_expiry: {
    max_seconds: number
    max_retrievals: number
  }
  peers: {
    api_url: string
  }[]
}
