import type * as RDF from '@rdfjs/types'
import { CONSTRUCT, Construct, Describe } from '@tpluscode/sparql-builder'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import * as D from 'docmaps-sdk'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import n3 from 'n3'
import { collect } from 'streaming-iterables'
import { pipe } from 'fp-ts/lib/pipeable'
import factory from '@rdfjs/data-model'
import { Set } from 'immutable'
import { BackendAdapter, ThingSpec } from '../types'
import util from 'util'

/** Inteface for an in-memory or over-the-web mechanism that accepts
 * SPARQL queries and returns triples.
 * @since 0.1.0
 */
export interface SparqlProcessor {
  // truthy(query: string): Promise<boolean>
  triples(query: Construct | Describe): TE.TaskEither<Error, AsyncIterable<RDF.Quad>>
  // bindings(query: string): Promise<AsyncIterable<{ [key: string]: RDF.Term }>>
}

function FindDocmapQuery(iri: string): Construct {
  const subj = factory.namedNode(iri)

  const values = [{ map: subj }]

  // FIXME: use sparql builder more idiomatically
  const q = CONSTRUCT`
    ?s ?p ?o .
    ?map ?p0 ?o0 .
  `.WHERE`
    {
      SELECT DISTINCT ?s ?p ?o WHERE {
        ${VALUES(...values)}
        ?map (!<>)+ ?s .
        ?s ?p ?o .
      }
    }
    UNION
    {
      SELECT DISTINCT ?map ?p0 ?o0 WHERE {
        ${VALUES(...values)}
        ?map ?p0 ?o0 .
      }
    }
  `

  return q
}

function DocmapForThingIriQuery(iri: string): Construct {
  const subj = factory.namedNode(iri)

  const values = [{ thing: subj }]

  // FIXME: use sparql builder more idiomatically
  const q = CONSTRUCT`
    ?s ?p ?o .
  `.WHERE`
    {
      SELECT DISTINCT ?map ?s ?p WHERE {
        ${VALUES(...values)}
        ?map (!<>)+ ?s .
        ?s ?p ?thing .
      }
    }
    UNION
    {
      SELECT DISTINCT ?s ?p ?o WHERE {
        ?map (!<>)+ ?s .
        ?s ?p ?o .
      }
    }
  `

  return q
}

function DocmapForThingDoiQuery(doi: string): Construct {
  const values = [{ doi: doi }]

  // FIXME: use UNION to minimize the quads retrieved
  const q = CONSTRUCT`
    ?s ?p ?o .
  `.WHERE`
    {
      SELECT DISTINCT ?map ?s0 ?s ?p ?o WHERE {
        ${VALUES(...values)}
        ?map (!<>)+ ?s0 .
        ?s0 <http://prismstandard.org/namespaces/basic/2.0/doi> ?doi .
        ?map (!<>)* ?s .
        ?s ?p ?o .
      }
    }
  `

  return q
}

export class SparqlAdapter implements BackendAdapter {
  q: SparqlProcessor

  constructor(q: SparqlProcessor) {
    this.q = q
  }

  docmapWithIri(iri: string): TE.TaskEither<Error, D.DocmapT> {
    const query = FindDocmapQuery(iri)

    const g = new D.TypedGraph()

    const program = pipe(
      this.q.triples(query),
      TE.chain((iter) =>
        TE.tryCatch(
          () => collect(iter),
          (reason) => new Error(`failed to create quads from iterator: ${reason}`),
        ),
      ),
      TE.chainEitherK((quads) => {
        return quads.length > 0
          ? E.right(quads)
          : E.left(new Error('content not found for queried DOI'))
      }),
      TE.map((quads: Array<RDF.Quad>) => {
        const deduped = [...Set(quads)] //TODO: ineffective, because WASM implements this structure as just `{__wbg_ptr}` which is always unique
        return new n3.Store(deduped).match()
      }),
      TE.chain((stream: RDF.Stream) =>
        g.pickStreamWithCodec(D.DocmapNormalizedFrame, D.Docmap, stream),
      ),
    )

    return program
  }

  docmapForThing(thing: ThingSpec): TE.TaskEither<Error, D.DocmapT> {
    let query: Construct
    switch (thing.kind) {
      case 'iri':
        query = DocmapForThingIriQuery(thing.identifier)
        throw 'not implemented'
      case 'doi':
        query = DocmapForThingDoiQuery(thing.identifier)
    }

    const g = new D.TypedGraph()

    const program = pipe(
      this.q.triples(query),
      TE.chain((iter) =>
        TE.tryCatch(
          () => collect(iter),
          (reason) => new Error(`failed to create quads from iterator: ${reason}`),
        ),
      ),
      TE.chainEitherK((quads) => {
        return quads.length > 0
          ? E.right(quads)
          : E.left(new Error('content not found for queried DOI'))
      }),
      TE.map((quads: Array<RDF.Quad>) => {
        const deduped = [...Set(quads)] //TODO: ineffective, because WASM implements this structure as just `{__wbg_ptr}` which is always unique
        const copy = new n3.Store(deduped)
        return new n3.Store(deduped).match()
      }),
      TE.chain((stream: RDF.Stream) =>
        g.pickStreamWithCodec(D.DocmapNormalizedFrame, D.Docmap, stream),
      ),
    )

    return program
  }
}
