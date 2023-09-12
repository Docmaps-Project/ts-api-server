import express from 'express'
import { initServer, createExpressEndpoints } from '@ts-rest/express'
import { contract } from '../contract'
import { ApiInstance } from '../api'
import { OxigraphInmemBackend } from '../adapter/oxigraph_inmem'
import { SparqlAdapter } from '../adapter'

function main() {
  const Config = {
    server: {
      port: process.env['DOCMAPS_PORT'] || 3333,
      apiUrl: process.env['DOCMAPS_API_URL'] || 'http://localhost',
    },
  }

  const api = new ApiInstance(
    //FIXME make this useable
    new SparqlAdapter(new OxigraphInmemBackend(Config.server.apiUrl)),
    new URL(Config.server.apiUrl),
  )

  const app = express()

  // app.use(bodyParser.urlencoded({ extended: false }))
  // app.use(bodyParser.json())

  const s = initServer()

  const router = s.router(contract, {
    getInfo: async () => {
      const info = api.get_info()

      return {
        status: 200,
        body: info,
      }
    },
  })

  // FIXME: resolve this awkward use of typescript ignores. The only
  // reason I am willing to do this temporarily:
  // - this function call doesn't affect any types as far as I can tell
  // - it seems related to known issues in Zod, dependency of ts-rest
  // - I have an open issue to track: https://github.com/ts-rest/ts-rest/issues/389

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createExpressEndpoints(contract, router, app)

  app.listen(Config.server.port, () => {
    console.log(`Listening at http://localhost:${Config.server.port}`)
  })
}

main()
