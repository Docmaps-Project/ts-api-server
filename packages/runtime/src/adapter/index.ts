import type * as RDF from '@rdfjs/types'
import { CONSTRUCT, Construct, Describe } from '@tpluscode/sparql-builder'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import * as D from 'docmaps-sdk'
import * as TE from 'fp-ts/lib/TaskEither'
import n3 from 'n3'
import { collect } from 'streaming-iterables'
import { pipe } from 'fp-ts/lib/pipeable'
import factory from '@rdfjs/data-model'
import { Set } from 'immutable'
// import util from 'util'

/* Inteface for an in-memory or over-the-web mechanism that accepts
 * SPARQL queries and returns triples.
 * @since 0.1.0
 */
export interface SparqlProcessor {
  // truthy(query: string): Promise<boolean>
  triples(query: Construct | Describe): TE.TaskEither<Error, AsyncIterable<RDF.Quad>>
  // bindings(query: string): Promise<AsyncIterable<{ [key: string]: RDF.Term }>>
}


function FindDocmapQuery(iri: string): Construct | Describe {
  const subj = factory.namedNode(iri)

  const values = [{ map: subj }]

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

export class SparqlAdapter {
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
      TE.map((quads: Array<RDF.Quad>) => {
        const deduped = [...Set(quads)] //TODO: ineffective, because WASM implements this structure as just `{__wbg_ptr}` which is always unique
        // console.log(`${quads.length} quads;`)
        // console.log(util.inspect([deduped[0], deduped[1]], { depth: null }))
        return new n3.Store(deduped).match()
      }),
      TE.chain((stream: RDF.Stream) =>
        g.pickStreamWithCodec(D.DocmapNormalizedFrame, D.Docmap, stream),
      ),
    )

    return program
  }
}
