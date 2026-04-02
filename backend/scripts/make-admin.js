require('dotenv').config();
const { getDb } = require('../db');

async function makeAdmin(email) {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'UPDATE users SET role = "admin" WHERE email = ?',
      args: [email]
    });

    if (result.rowsAffected > 0) {
      console.log(`✅ SUCCESS: User ${email} is now an ADMIN.`);
    } else {
      console.log(`❌ FAILED: User ${email} not found.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error updating role:', err);
    process.exit(1);
  }
}

const email = process.argv[2] || 'santod0946919475@gmail.com';
makeAdmin(email);
