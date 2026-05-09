import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Supabase'in 5432 portlu doğrudan bağlantı linkini kullanıyoruz
const connectionString = process.env.DIRECT_URL

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
