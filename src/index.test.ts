import type { App } from 'h3'
import { createApp, eventHandler, toNodeListener } from 'h3'
import type { SuperTest, Test } from 'supertest'
import supertest from 'supertest'
import { withClerkAuth, withClerkMiddleware } from '.'

describe('withClerkAuth(options)', () => {
  let app: App
  let request: SuperTest<Test>

  beforeEach(() => {
    app = createApp()
    request = supertest(toNodeListener(app))
  })

  it('should add auth context', async () => {
    app.use('/', withClerkAuth((event) => {
      expect(event.context.auth).toBeTypeOf('object')
      return '200'
    }))

    const result = await request.get('/')
    expect(result.text).toBe('200')
  })
})

describe('withClerkMiddleware(options)', () => {
  let app: App
  let request: SuperTest<Test>

  beforeEach(() => {
    app = createApp().use(withClerkMiddleware())
    request = supertest(toNodeListener(app))
  })

  it('should add auth context', async () => {
    app.use('/', eventHandler((event) => {
      expect(event.context.auth).toBeTypeOf('object')
      return '200'
    }))

    const result = await request.get('/')
    expect(result.text).toBe('200')
  })
})
