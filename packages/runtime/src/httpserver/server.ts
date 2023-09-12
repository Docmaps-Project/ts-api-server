import express, { Application } from 'express'
import { createServer as createHttpServer, Server as ServerHttp } from 'http'
import { Server as ServerHttps } from 'https'
import { initServer, createExpressEndpoints } from '@ts-rest/express'
import { contract } from '../contract'
import { ApiInstance } from '../api'
import { OxigraphInmemBackend } from '../adapter/oxigraph_inmem'
import { SparqlAdapter } from '../adapter'
import { isLeft } from 'fp-ts/lib/Either'

export type ServerConfig = {
  server: {
    port: number
    apiUrl: string
  }
}

// TODO: rename?
export class HttpServer {
  api: ApiInstance
  app: Application
  server: ServerHttp | ServerHttps // FIXME : support https
  config: ServerConfig

  constructor(config: ServerConfig) {
    this.config = config

    this.api = new ApiInstance(
      //FIXME make this useable
      new SparqlAdapter(new OxigraphInmemBackend(config.server.apiUrl)),
      new URL(config.server.apiUrl),
    )

    this.app = express()

    // app.use(bodyParser.urlencoded({ extended: false }))
    // app.use(bodyParser.json())

    const s = initServer()

    const router = s.router(contract, {
      getInfo: async () => {
        const info = this.api.get_info()

        return {
          status: 200,
          body: info,
        }
      },
      getDocmapById: async (req) => {
        const result = await this.api.get_docmap_by_id(req.params.id)()

        if (isLeft(result)) {
          return {
            status: 501, // FIXME: more expressive errors.
            body: result.left,
          }
        }

        return {
          status: 200,
          body: result.right,
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
    createExpressEndpoints(contract, router, this.app)
    this.server = createHttpServer(this.app)
  }

  listen(): Promise<void> {
    return new Promise((res, _rej) => {
      // TODO : set listen timeout handling
      this.server.listen(this.config.server.port, () => {
        // console.log(`Listening at http://localhost:${config.server.port}`)
        res()
      })
    })
  }

  close(): Promise<void> {
    return new Promise((res, _rej) => {
      // TODO : set close timeout handling
      this.server.close(() => {
        // console.log(`Closing server...`)
        res()
      })
    })
  }
}
