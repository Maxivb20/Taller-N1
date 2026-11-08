import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg

export const pool = new Pool({
  host: env.pg.host,
  port: env.pg.port,
  user: env.pg.user,
  password: env.pg.password,
  database: env.pg.database,
  max: 10,
  idleTimeoutMillis: 30000,
})

// Configurar tipos de fecha de PostgreSQL para devolver strings YYYY-MM-DD directamente
pg.types.setTypeParser(1082, (val) => val) // DATE
pg.types.setTypeParser(1700, (val) => Number(val)) // NUMERIC

export async function testPostgresConnection() {
  const client = await pool.connect()
  try {
    await client.query('SELECT 1')
    return true
  } finally {
    client.release()
  }
}
