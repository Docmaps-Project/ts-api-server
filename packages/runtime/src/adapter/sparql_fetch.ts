import { IBindings, SparqlEndpointFetcher } from 'fetch-sparql-endpoint'
import fetch from 'isomorphic-fetch'
import type * as RDF from '@rdfjs/types'
import type { SparqlProcessor } from '.'
import type { Construct, Describe } from '@tpluscode/sparql-builder'

// This one uses SparqlEndpointFetcher to create a stream of Triples.
// Should be as thin as possible.
//
//
// to test this, we need to inject fetch like this https://github.com/rubensworks/fetch-sparql-endpoint.js/blob/a882427835dcd356eb265ce93a70388cf955c631/test/SparqlEndpointFetcher-test.ts
export class SparqlFetchBackend implements SparqlProcessor {
  endpoint: string
  fetcher: SparqlEndpointFetcher

  constructor(endpoint: string) {
    this.endpoint = endpoint
    this.fetcher = new SparqlEndpointFetcher({
      fetch: fetch,
    })
  }

  triples(query: Construct | Describe): Promise<AsyncIterable<RDF.Quad>> {
    return this.fetcher.fetchTriples(this.endpoint, query.build())
  }

  // bindings(query: string): Promise<AsyncIterable<IBindings>> {
  //   return this.fetcher.fetchBindings(this.endpoint, query).then((rs) => rs.)
  // }
}
