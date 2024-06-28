import type { H3Event } from 'h3'
import { getAuth } from '../getAuth'

describe('getAuth(event)', () => {
  it('event.context.auth is defined', () => {
    const context = { key1: 'asa', auth: 'authObj' }
    const event = {
      context,
    } as unknown as H3Event

    expect(getAuth(event)).toEqual('authObj')
  })
})
