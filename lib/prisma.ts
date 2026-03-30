import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.warn('DATABASE_URL is not set. Prisma will use a mock proxy.')
    return new Proxy({} as PrismaClient, {
      get(target, prop) {
        if (prop === '$connect' || prop === '$disconnect') return async () => {}
        return new Proxy({} as any, {
          get(target, p) {
            return async () => {
              console.warn(`Mock Prisma: Call to ${String(p)} on ${String(prop)}`)
              if (String(p).startsWith('findMany')) return []
              return null
            }
          }
        })
      }
    })
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof createPrismaClient>
} & typeof global

const prisma = globalThis.prismaGlobal ?? createPrismaClient()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
