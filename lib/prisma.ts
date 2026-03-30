import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  try {
    return new PrismaClient()
  } catch (error) {
    console.warn('PrismaClient failed to initialize. Using mock proxy.')
    return new Proxy({} as any, {
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
}

declare const globalThis: {
  prismaGlobal: any;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
