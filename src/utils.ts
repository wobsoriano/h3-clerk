import type { H3Event } from 'h3'
import { getRequestHeaders, getRequestProtocol } from 'h3'

export function toWebRequest(event: H3Event) {
  const headers = getRequestHeaders(event) as HeadersInit
  const protocol = getRequestProtocol(event)
  const dummyOriginReqUrl = new URL(event.node.req.url || '', `${protocol}://clerk-dummy`)
  return new Request(dummyOriginReqUrl, {
    method: event.method,
    headers: new Headers(headers),
  })
}
