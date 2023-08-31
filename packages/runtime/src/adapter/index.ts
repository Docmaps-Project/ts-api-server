import type * as RDF from '@rdfjs/types'
import { CONSTRUCT, Construct, Describe } from '@tpluscode/sparql-builder'
import { DESCRIBE } from '@tpluscode/sparql-builder'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import * as D from 'docmaps-sdk'
import * as TE from 'fp-ts/lib/TaskEither'
import n3 from 'n3'
import { prefixes } from '@zazuko/rdf-vocabularies'
import namespace from '@rdfjs/namespace'
import { collect } from 'streaming-iterables'
import { pipe } from 'fp-ts/lib/pipeable'
import factory from '@rdfjs/data-model'

/* Inteface for an in-memory or over-the-web mechanism that accepts
 * SPARQL queries and returns triples.
 * @since 0.1.0
 */
export interface SparqlProcessor {
  // truthy(query: string): Promise<boolean>
  triples(query: Construct | Describe): Promise<AsyncIterable<RDF.Quad>>
  // bindings(query: string): Promise<AsyncIterable<{ [key: string]: RDF.Term }>> // TODO: confirm how to handle generics better here
}

function FindDocmapQuery(iri: string): Construct | Describe {
  const subj = factory.namedNode(iri)

  const dcterms = namespace('http://purl.org/dc/terms/')
  const pwo = namespace('http://purl.org/spar/pwo/')
  const fabio = namespace('http://purl.org/spar/fabio/')
  const pso = namespace('http://purl.org/spar/pso/')
  const pro = namespace('http://purl.org/spar/pro/')
  const tx = namespace('http://www.ontologydesignpatterns.org/cp/owl/taskexecution.owl#')

  const values = [{ map: subj }]

  const q = CONSTRUCT`
    ?s ?p ?o
  `.WHERE`
    SELECT DISTINCT ?s ?p ?o
    WHERE {
      ?s ?p ?o .
    }
  `

  // const q = DESCRIBE`
  //   ?map ?pub ?step
  //   ?assertion ?assertion_i ?assertion_s
  //   ?input
  //   ?action ?actor ?rit
  //     ?output ?manifestation
  //   `.WHERE`
  //   ${VALUES(...values)}
  //   ?map ${dcterms['publisher']} ?pub .
  //   ?map ${pwo['hasStep']} ?step .

  //   OPTIONAL {
  //     ?step ${pso['resultsInAcquiring']} ?assertion .

  //     ?assertion ${pso['withStatus']} ?assertion_s .
  //     ?assertion ${pso['isStatusHeldBy']} ?assertion_i .
  //   } .

  //   OPTIONAL {
  //     ?step ${pwo['needs']} ?input .
  //   } .

  //   OPTIONAL {
  //     ?step ${tx['isExecutedIn']} ?action .

  //     OPTIONAL {
  //       ?action ${pro['isDocumentContextFor']} ?rit .
  //       ?rit ${pro['withRole']} ?role .
  //       ?rit ${pro['isHeldBy']} ?actor .
  //     } .

  //     OPTIONAL {
  //       ?action ${pwo['produces']} ?output .

  //       OPTIONAL {
  //         ?output ${fabio['hasManifestation']} ?manifestation .
  //       } .
  //     } .
  //   } .
  // `.LIMIT(100)
  // TODO: LIMIT: this number is a bit weird. It is at most #(map) * #(step) * #(pub) * #(action)...
  // maybe we should make this part of the engine instead.
  return q
}
// ?map ${dcterms['Publisher']} ?pub .
// ?map ${pwo['hasStep']} ?step .
// ?step ${tx['isExecutedIn']} ?action .

export class SparqlAdapter {
  q: SparqlProcessor

  constructor(q: SparqlProcessor) {
    this.q = q
  }

  docmapWithIri(iri: string): TE.TaskEither<Error, D.DocmapT> {
    const query = FindDocmapQuery(iri)

    const g = new D.TypedGraph()

    const program = pipe(
      TE.tryCatch(
        () =>
          new Promise<Array<RDF.Quad>>(async (res, _rej) => {
            const iter = await this.q.triples(query)
            const quads = await collect(iter)
            console.log(`${quads.length} quads;`)
            const deduped = [...new Set(quads)] //TODO: ineffective
            console.log(`${deduped.length} unique.`)
            console.log(deduped.join('\n'))
            res(deduped)
          }),
        (reason) => new Error('failed to create quads from iterator', { cause: reason }),
      ),
      TE.map((quads: Array<RDF.Quad>) => {
        return new n3.Store(quads).match()
      }),
      TE.chain((stream: RDF.Stream) =>
        g.pickStreamWithCodec(D.DocmapNormalizedFrame, D.Docmap, stream),
      ),
    )

    // const triples = await collect(await this.q.triples(query))

    // use typed_graph / the json-ld-serializer to convert triples to a JSON-LD object

    return program
  }
}
