import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Runtime queries should use the transaction pooler.
// Keep DIRECT_URL for direct/migration usage if needed, but do not use it for serverless runtime.
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL

// pg sürücüsü ile yeni bir bağlantı havuzu oluşturuyoruz
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const createPrismaClient = () => {
  // Hatanın çözüldüğü nokta: adaptörü PrismaClient'a parametre olarak veriyoruz
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof createPrismaClient>
} & typeof global

const prisma = globalThis.prismaGlobal ?? createPrismaClient()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
