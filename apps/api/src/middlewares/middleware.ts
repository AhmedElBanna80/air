import { Context } from 'hono'
import { Container, Token } from 'di-wise'
import { Type } from 'di-wise'
import type { Hono } from 'hono'
import { ContextToken, AppEnv } from '@/api/context'
// Create tokens for Hono types
export const HonoContext = Type<Context>('HonoContext')
export const HonoApp = Type<Hono<AppEnv>>('HonoApp')

export function honoMiddleware(rootContainer: Container, app: Hono) {
  // Register app instance in root container
  rootContainer.register(HonoApp, { useValue: app as unknown as Hono<AppEnv> })

  return async (c: Context, next: () => Promise<void>) => {
    // Create child container for request context
    const childContainer = rootContainer.createChild()
    const contextService = rootContainer.resolve<Record<string, any>>(ContextToken)
    for (const key in contextService) {
      c.set(key as any, contextService[key])
    }
    // Register current context and app
    childContainer.register(HonoContext, { useValue: c })
    childContainer.register(HonoApp, { useValue: app as unknown as Hono<AppEnv> })

    // Store container in context
    c.set('container', childContainer)
    await next()
  }
}

// Helper to get container from context
export function inject<T extends object>(c: Context, token: Token<T>): T {
  const container = c.get('container') as Container
  return container.resolve<T>(token)
}