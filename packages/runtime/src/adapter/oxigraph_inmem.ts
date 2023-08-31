import type { SparqlProcessor } from '.'
import oxigraph from 'oxigraph'
import type { Quad } from '@rdfjs/types'
import type { Construct, Describe } from '@tpluscode/sparql-builder'
import { arrayToAsyncIterable } from '../utils'

export class OxigraphInmemBackend implements SparqlProcessor {
  // inmem usage allows writes directly to memory, separate from
  // the query interface, if you have a handle to it.
  public store: oxigraph.Store

  constructor() {
    this.store = new oxigraph.Store()
  }

  triples(query: Construct | Describe): Promise<AsyncIterable<Quad>> {
    // oxigraph is not type-safe in its return here, but it guarantees Array of Quad in these two cases
    const filteredStore = this.store.query(query.build()) as Quad[]
    return Promise.resolve(arrayToAsyncIterable(filteredStore))
  }
}
