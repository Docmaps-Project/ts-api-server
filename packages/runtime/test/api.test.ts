import test from 'ava'
import { ApiInstance } from '../src/api'

test('info: default values', (t) => {
  const res = new ApiInstance(new URL('https://example.com')).get_info()

  t.is(res.api_url, 'https://example.com/')
  t.deepEqual(res.ephemeral_document_expiry, {
    max_seconds: 60,
    max_retrievals: 1,
  })
  t.deepEqual(res.peers, [])
})

test('info: configured values', (t) => {
  const res = new ApiInstance(
    new URL('https://example.com'),
    [new URL('https://other.com')],
    30,
    10,
  ).get_info()

  t.is(res.api_url, 'https://example.com/')
  t.deepEqual(res.ephemeral_document_expiry, {
    max_seconds: 30,
    max_retrievals: 10,
  })
  t.deepEqual(res.peers, [{ api_url: 'https://other.com/' }])
})
