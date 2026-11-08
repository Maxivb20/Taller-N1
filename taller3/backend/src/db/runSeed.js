import { connectMongo } from '../config/mongo.js'
import { seedDatabases } from './seed.js'
import { pool } from '../config/postgres.js'
import mongoose from 'mongoose'

async function main() {
  try {
    await connectMongo()
    await seedDatabases({ force: true })
  } finally {
    await pool.end()
    await mongoose.disconnect()
  }
}

main()
