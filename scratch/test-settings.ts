import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function test() {
  const connectionString = process.env.DIRECT_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const settings = await prisma.platformSettings.upsert({
      where: { id: 1 },
      update: { maintenanceMode: false },
      create: { 
        id: 1, 
        maintenanceMode: false,
        allowedDomains: '.edu, .ac.uk',
        sessionTimeout: 24,
        postExpiry: 90,
        requireNDA: true,
        emailNotifications: true
      }
    });
    console.log('SUCCESS:', settings);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
