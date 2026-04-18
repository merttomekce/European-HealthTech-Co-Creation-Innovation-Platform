const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function testConnection(urlStr) {
  const client = new Client({
    connectionString: urlStr,
    connect_timeout: 5000,
  });
  console.log('Testing: ', urlStr.replace(/:[^:@]+@/, ':***@'));
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Success! Time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function run() {
  await testConnection(process.env.DATABASE_URL);
  await testConnection(process.env.DIRECT_URL);
}
run();
