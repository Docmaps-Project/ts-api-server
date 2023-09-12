import test from 'ava'
import { HttpServer, MakeHttpClient, API_VERSION } from '../../src'

async function setupServer(): Promise<HttpServer> {
  const s = new HttpServer({
    server: {
      port: 33033,
      apiUrl: 'http://localhost:33033/docmaps/v1/',
    },
  })

  await s.listen()
  return s
}

async function withNewServer(work: (s: HttpServer) => Promise<void>) {
  const start = new Date().getTime()
  const server = await setupServer()
  const setup = new Date().getTime()
  await work(server)
  const worked = new Date().getTime()
  await server.close()
  const closed = new Date().getTime()
  console.log(`[stats] Setup test server in\t\t${setup - start}\tms...`)
  console.log(`[stats] Performed test in\t\t${worked - setup}\tms...`)
  console.log(`[stats] Closed server in\t\t${closed - worked}\tms...`)
}

test.serial('it serves info endpoint', async (t) => {
  await withNewServer(async (_s) => {
    const client = MakeHttpClient({
      baseUrl: 'http://localhost:33033',
      baseHeaders: {},
    })

    const info = await client.getInfo()

    t.is(info.status, 200)
    t.deepEqual(info.body, {
      api_url: 'http://localhost:33033/docmaps/v1/',
      api_version: API_VERSION,
      ephemeral_document_expiry: {
        max_retrievals: 1,
        max_seconds: 60,
      },
      peers: [],
    })
  })
})
