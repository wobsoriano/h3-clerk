import type { SessionAuthObject } from '@clerk/backend'
import type { H3Event } from 'h3'
import { middlewareRegistrationRequired } from './errors'

export function getAuth(event: H3Event): SessionAuthObject {
  if (!event.context.auth)
    throw new Error(middlewareRegistrationRequired)

  return event.context.auth
}
