import test from 'ava'
import * as D from 'docmaps-sdk'
import { inspect } from 'util'
import { MakeHttpClient, API_VERSION } from '../../src'
import { withNewServer } from './utils'

//FIXME: the close step is by far the longest in server setup, so
//  these should not shut down express server between tests.
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

test.serial('it serves /docmap endpoint', async (t) => {
  await withNewServer(async (_s) => {
    const client = MakeHttpClient({
      baseUrl: 'http://localhost:33033',
      baseHeaders: {},
    })
    const testIri =
      'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698'

    const resp = await client.getDocmapById({
      params: { id: encodeURI(encodeURIComponent(testIri)) },
    })

    t.is(resp.status, 200, `failed with this response: ${inspect(resp, { depth: null })}`)

    const dm = resp.body as D.DocmapT

    t.deepEqual(dm.id, testIri)
    t.deepEqual(dm.publisher, {
      account: {
        id: 'https://sciety.org/groups/elife',
        service: 'https://sciety.org/',
      },
      homepage: 'https://elifesciences.org/',
      id: 'https://elifesciences.org/',
      logo: 'https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png',
      name: 'eLife',
    })
  }, t.log)
})
