import { initContract } from '@ts-rest/core'
import { DocmapT } from 'docmaps-sdk'
import { ApiInfo } from './types'

const c = initContract()

export const contract = c.router({
  getInfo: {
    method: 'GET',
    path: '/info',
    responses: {
      200: c.type<ApiInfo>(),
    },
    summary: 'Get information about this Docmaps API server',
  },

  getDocmapById: {
    method: 'GET',
    path: '/docmap/:id',
    // TODO: id as arg?
    responses: {
      200: c.type<DocmapT>(),
    },
    summary: 'Get information about this Docmaps API server',
  },
})
