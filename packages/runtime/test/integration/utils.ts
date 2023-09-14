import { spawnSync } from 'child_process'
import { readdirSync } from 'fs'
import { join as fsjoin } from 'path'
import { HttpServer } from '../../src'

const OXI_SPARQL_BACKEND_CONFIG = {
  url: 'http://localhost:33078',
}

function getProjectRoot(): string {
  const val = process.env['INIT_CWD']
  if (!val) {
    throw 'impossible failure: no initcwd in test script'
  }
  return val
}

function ensureSparqlBackend(log: (s: string) => void) {
  const root = getProjectRoot()
  const spawnOpts = { cwd: root }

  const checkIsUpProcess = spawnSync('curl', ['-k', `${OXI_SPARQL_BACKEND_CONFIG.url}`], spawnOpts)

  if (0 != checkIsUpProcess.status) {
    log(
      `[setup] Didn't find sparql backend locally at ${JSON.stringify(
        OXI_SPARQL_BACKEND_CONFIG,
      )}; response: ${checkIsUpProcess.stdout}`,
    )
    log('[setup] starting it now with docker...')

    const dockerProcess = spawnSync(
      'docker',
      [
        'compose',
        '-f',
        fsjoin('test', 'integration', 'assets', 'docker-compose.yml'),
        'up',
        '--wait',
      ],
      spawnOpts,
    )
    if (0 != dockerProcess.status) {
      log('failed to start docker for integration tests')
      throw dockerProcess
    }
    log('[setup] done starting docker.')
  } else {
    log(
      `[setup] backend already found at ${JSON.stringify(
        OXI_SPARQL_BACKEND_CONFIG,
      )}; skipping docker`,
    )
  }

  //  for all assets files:
  const assetsPath = fsjoin(root, 'test', 'integration', 'assets')
  const filesList = readdirSync(assetsPath, {
    encoding: 'utf-8',
    withFileTypes: true,
  }).filter((n) => n.name.endsWith('.nt'))

  const ulErrs = filesList.reduce<Error[]>((errs, dirent) => {
    const p = spawnSync('curl', [
      '-k',
      '-X',
      'POST',
      '-H',
      'Content-Type:application/n-triples',
      '-T',
      fsjoin(assetsPath, dirent.name),
      `${OXI_SPARQL_BACKEND_CONFIG.url}/store?default`,
    ])
    if (0 != p.status) {
      return [...errs, new Error(`failed to upload ${dirent.name}: "${p.stdout}"`)]
    }
    return errs
  }, [] as Error[])

  if (ulErrs.length > 0) {
    throw ulErrs
  }

  log('[setup] finished uploading all test triples')
}

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

export async function withNewServer(
  work: (s: HttpServer) => Promise<void>,
  log: (s: string) => void,
) {
  const start = new Date().getTime()
  ensureSparqlBackend(log)
  const backend = new Date().getTime()
  const server = await setupServer()
  const setup = new Date().getTime()
  await work(server)
  const worked = new Date().getTime()
  await server.close()
  const closed = new Date().getTime()
  log(`[stats] Setup backend in\t${backend - start}\tms...`)
  log(`[stats] Setup test server in\t${setup - backend}\tms...`)
  log(`[stats] Performed test in\t\t${worked - setup}\tms...`)
  log(`[stats] Closed server in\t\t${closed - worked}\tms...`)
}
