import type { AuthOptions, GetAuthFn } from '@clerk/backend/internal';
import type { H3Event } from 'h3';

import { middlewareRegistrationRequired } from './errors';

export const getAuth: GetAuthFn<H3Event> = ((event: H3Event, options?: AuthOptions) => {
  if (!event.context.auth) throw new Error(middlewareRegistrationRequired);

  return event.context.auth(options);
}) as GetAuthFn<H3Event>;
