import test from 'ava'
import { SparqlAdapter } from '../src/adapter'
import * as E from 'fp-ts/lib/Either'
import { inspect } from 'util'
import * as fixtures from './__fixtures__/docmaps'

test('constructs and extracts a realistic docmap from a sparql backend', async (t) => {
  const backend = fixtures.CreateDatastore()

  const processor = new SparqlAdapter(backend)

  const docmap = await processor.docmapWithIri(
    'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
  )()

  if (E.isLeft(docmap)) {
    t.fail(`got error instead of docmap: ${inspect(docmap.left, { depth: 4 })}`)
    return
  }

  t.is(
    docmap.right.id,
    'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
  )

  const steps = docmap.right.steps
  if (!steps) {
    t.fail('expected to find steps, but was null')
    return
  }

  t.is(Object.keys(steps).length, 3)
})
