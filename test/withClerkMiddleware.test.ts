import { createApp, eventHandler, setResponseStatus, toNodeListener } from 'h3'
import supertest from 'supertest'
import { withClerkMiddleware } from '../src'

const authenticateRequestMock = vi.fn()
const localInterstitialMock = vi.fn()

vi.mock('@clerk/backend', async () => {
  const mod = await vi.importActual<typeof import('@clerk/backend')>('@clerk/backend')

  return {
    ...mod,
    // constants: {},
    Clerk: () => {
      return {
        authenticateRequest: (...args: any) => authenticateRequestMock(...args),
        localInterstitial: (...args: any) => localInterstitialMock(...args),
      }
    },
  }
})

describe('withClerkMiddleware(options)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  test.todo('handles signin with Authorization Bearer')
  test.todo('handles signin with cookie')
  test('handles unknown case by terminating the request with empty response and 401 http code', async () => {
    const app = createApp({ debug: false })
    const request = supertest(toNodeListener(app))

    authenticateRequestMock.mockResolvedValue({
      isUnknown: true,
      isInterstitial: false,
      isSignedIn: false,
      reason: 'auth-reason',
      message: 'auth-message',
      toAuth: () => 'mockedAuth',
    })

    app.use('/', eventHandler((event) => {
      if (!event.context.auth) {
        setResponseStatus(event, 401)
        return ''
      }

      return event.context.auth
    }))

    app.use(withClerkMiddleware({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
    }))

    const resp = request.get('/').set('Cookie', '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233')
    const response = await resp
    expect(response.status).toEqual(401)
    expect(response.headers['x-clerk-auth-reason']).toEqual('auth-reason')
    // expect(response.headers['x-clerk-auth-message']).toEqual('auth-message');
    // expect(response.body).toEqual('')
  })
  test.todo('handles interstitial case by terminating the request with interstitial html page and 401 http code')
  test.todo('handles signout case by populating the req.auth')
})
