import type { App } from 'h3'
import { createApp, eventHandler, toNodeListener } from 'h3'
import type { SuperTest, Test } from 'supertest'
import supertest from 'supertest'
import { withClerkAuth } from '../src/withClerkMiddleware'

const authenticateRequestMock = vi.fn()
const localInterstitialMock = vi.fn()

vi.mock('@clerk/backend', async () => {
  const mod = await vi.importActual<typeof import('@clerk/backend')>('@clerk/backend')

  return {
    ...mod,
    Clerk: () => {
      return {
        authenticateRequest: (...args: any) => authenticateRequestMock(...args),
        localInterstitial: (...args: any) => localInterstitialMock(...args),
      }
    },
  }
})

describe('withClerkMiddleware(options)', () => {
  let app: App
  let request: SuperTest<Test>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()

    app = createApp({ debug: false })
    request = supertest(toNodeListener(app))

    // app.use(withClerkMiddleware({
    //   publishableKey: process.env.CLERK_API_KEY,
    //   secretKey: process.env.CLERK_SECRET_KEY,
    // }))

    app.use('/', withClerkAuth(eventHandler(event => ({ auth: event.context.auth }))))
  })

  test('handles signin with Authorization Bearer', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: false,
      isInterstitial: false,
      isSignedIn: true,
      toAuth: () => 'mockedAuth',
    })

    const response = await request.get('/')
      .set('Authorization', 'Bearer deadbeef')
      .set('Origin', 'http://origin.com')
      .set('Host', 'host.com')
      .set('X-Forwarded-Port', '1234')
      .set('X-Forwarded-Host', 'forwarded-host.com')
      .set('Referer', 'referer.com')
      .set('User-Agent', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36')

    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ auth: 'mockedAuth' })
    expect(authenticateRequestMock).toBeCalledWith(
      expect.objectContaining({
        secretKey: 'TEST_API_KEY',
        apiKey: 'TEST_API_KEY',
        request: expect.any(Request),
      }),
    )
  })

  test('handles signin with cookie', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: false,
      isInterstitial: false,
      isSignedIn: true,
      toAuth: () => 'mockedAuth',
    })

    const response = await request.get('/')
      .set('Cookie', '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233')
      .set('Origin', 'http://origin.com')
      .set('Host', 'host.com')
      .set('X-Forwarded-Port', '1234')
      .set('X-Forwarded-Host', 'forwarded-host.com')
      .set('Referer', 'referer.com')
      .set('User-Agent', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36')

    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ auth: 'mockedAuth' })
    expect(authenticateRequestMock).toBeCalledWith(
      expect.objectContaining({
        secretKey: 'TEST_API_KEY',
        apiKey: 'TEST_API_KEY',
        request: expect.any(Request),
      }),
    )
  })

  test('handles unknown case by terminating the request with empty response and 401 http code', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: true,
      isInterstitial: false,
      isSignedIn: false,
      reason: 'auth-reason',
      message: 'auth-message',
      toAuth: () => 'mockedAuth',
    })

    const response = await request.get('/').set('Cookie', '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233')

    expect(response.status).toEqual(401)
    expect(response.headers['x-clerk-auth-reason']).toEqual('auth-reason')
    expect(response.headers['x-clerk-auth-message']).toEqual('auth-message')
    expect(response.text).toEqual('')
  })

  test('handles interstitial case by terminating the request with interstitial html page and 401 http code', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: false,
      isInterstitial: true,
      isSignedIn: false,
      reason: 'auth-reason',
      message: 'auth-message',
      toAuth: () => 'mockedAuth',
    })
    localInterstitialMock.mockReturnValue('<html><body>Interstitial</body></html>')

    const response = await request.get('/').set('Cookie', '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233')

    expect(response.status).toEqual(401)
    expect(response.headers['content-type']).toEqual('text/html')
    expect(response.headers['x-clerk-auth-reason']).toEqual('auth-reason')
    expect(response.headers['x-clerk-auth-message']).toEqual('auth-message')
    expect(response.text).toEqual('<html><body>Interstitial</body></html>')
  })

  test('handles signout case by populating the event.context.auth', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: false,
      isInterstitial: false,
      isSignedIn: false,
      toAuth: () => 'mockedAuth',
    })

    const response = await request.get('/').set('Authorization', 'Bearer deadbeef')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ auth: 'mockedAuth' })
    expect(authenticateRequestMock).toBeCalledWith(
      expect.objectContaining({
        secretKey: 'TEST_API_KEY',
        apiKey: 'TEST_API_KEY',
        request: expect.any(Request),
      }),
    )
  })
})
