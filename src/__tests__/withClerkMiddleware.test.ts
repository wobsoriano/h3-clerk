import type { App } from 'h3'
import type { Test } from 'supertest'
import type TestAgent from 'supertest/lib/agent'
import { createApp, eventHandler, getQuery, readBody, toNodeListener } from 'h3'
import supertest from 'supertest'
import { getAuth, withClerkMiddleware } from '../'

const authenticateRequestMock = vi.fn()

vi.mock('@clerk/backend', async () => {
  const mod = await vi.importActual('@clerk/backend')
  return {
    ...mod,
    createClerkClient: () => {
      return {
        authenticateRequest: (...args: any) => authenticateRequestMock(...args),
      }
    },
  }
})

describe('withClerkMiddleware(options)', () => {
  let app: App
  let request: TestAgent<Test>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    app = createApp().use(withClerkMiddleware({ enableHandshake: true }))
    request = supertest(toNodeListener(app))
  })

  it('handles signin with Authorization Bearer', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => 'mockedAuth',
    })

    app.use('/', eventHandler((event) => {
      const auth = getAuth(event)
      return { auth }
    }))

    const result = await request.get('/').set({
      'Authorization': 'Bearer deadbeef',
      'Origin': 'http://origin.com',
      'Host': 'host.com',
      'X-Forwarded-Port': '1234',
      'X-Forwarded-Host': 'forwarded-host.com',
      'Referer': 'referer.com',
      'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    })

    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual({ auth: 'mockedAuth' })
    expect(authenticateRequestMock).toBeCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: 'TEST_SECRET_KEY',
      }),
    )
  })

  it('handles signin with cookie', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => 'mockedAuth',
    })

    app.use('/', eventHandler((event) => {
      const auth = getAuth(event)
      return { auth }
    }))

    const result = await request.get('/').set({
      'cookie': '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233',
      'Origin': 'http://origin.com',
      'Host': 'host.com',
      'X-Forwarded-Port': '1234',
      'X-Forwarded-Host': 'forwarded-host.com',
      'Referer': 'referer.com',
      'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    })

    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual({ auth: 'mockedAuth' })
    expect(authenticateRequestMock).toBeCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: 'TEST_SECRET_KEY',
      }),
    )
  })

  it('handles handshake case by redirecting the request to fapi', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: 'handshake',
      reason: 'auth-reason',
      message: 'auth-message',
      headers: new Headers({
        'location': 'https://fapi.example.com/v1/clients/handshake',
        'x-clerk-auth-message': 'auth-message',
        'x-clerk-auth-reason': 'auth-reason',
        'x-clerk-auth-status': 'handshake',
      }),
      toAuth: () => 'mockedAuth',
    })

    app.use('/', eventHandler((event) => {
      const auth = getAuth(event)
      return { auth }
    }))

    const result = await request.get('/').set({
      cookie: '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233',
    })

    expect(result.statusCode).toBe(307)
    expect(result.headers).toMatchObject({ 'location': 'https://fapi.example.com/v1/clients/handshake', 'x-clerk-auth-status': 'handshake', 'x-clerk-auth-reason': 'auth-reason', 'x-clerk-auth-message': 'auth-message' })
  })

  it('handles signout case by populating the req.auth', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => 'mockedAuth',
    })

    app.use('/', eventHandler((event) => {
      const auth = getAuth(event)
      return { auth }
    }))

    const result = await request.get('/').set('Authorization', 'Bearer deadbeef')

    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual({ auth: 'mockedAuth' })
    expect(authenticateRequestMock).toBeCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: 'TEST_SECRET_KEY',
      }),
    )
  })

  it('should not have problems with h3 utils', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => 'mockedAuth',
    })

    app.use('/post', eventHandler(async (event) => {
      const body = await readBody(event)
      const query = getQuery(event)
      return { body, query }
    }))

    const result = await request.post('/post').send({ user: 'john' }).query({ id: '123' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual({
      body: {
        user: 'john',
      },
      query: {
        id: '123',
      },
    })
  })
})
