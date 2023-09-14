import test from 'ava'
import { MakeHttpClient, API_VERSION } from '../../src'
import { withNewServer } from './utils'

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
  }, t.log)
})
