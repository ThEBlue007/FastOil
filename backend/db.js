const { createClient } = require('@libsql/client')

let db = null

function getDb() {
  if (!db) {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return db
}

async function initDb() {
  const db = getDb()

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user','admin')),
      email_verified INTEGER DEFAULT 0,
      phone_verified INTEGER DEFAULT 0,
      is_banned INTEGER DEFAULT 0,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('email','phone','reset_password')),
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      fuel_type TEXT NOT NULL,
      liters REAL NOT NULL,
      price_per_liter REAL NOT NULL,
      total_price REAL NOT NULL,
      delivery_address TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','delivering','delivered','cancelled')),
      notes TEXT,
      cancel_reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  console.log('✅ Database initialized')
}

async function logActivity(userId, action, details, ipAddress) {
  try {
    const db = getDb()
    await db.execute({
      sql: `INSERT INTO activity_logs (user_id, action, details, ip_address)
            VALUES (?, ?, ?, ?)`,
      args: [userId || null, action, details || null, ipAddress || null]
    })
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

module.exports = { getDb, initDb, logActivity }
