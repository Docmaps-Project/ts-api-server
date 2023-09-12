import { HttpServer, ServerConfig } from './server'

// TODO: use Commander for CLI input and configuration
async function main() {
  const config: ServerConfig = {
    server: {
      port: 3333,
      apiUrl: 'http://localhost',
    },
  }

  await new HttpServer(config).listen()
}

await main()
