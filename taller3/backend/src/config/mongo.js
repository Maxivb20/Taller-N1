import mongoose from 'mongoose'
import { env } from './env.js'

let isConnected = false

export async function connectMongo() {
  if (isConnected) return
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    isConnected = true
    console.log('[MongoDB] Conectado correctamente a:', env.mongoUri)
  } catch (err) {
    console.error('[MongoDB] Error al conectar:', err.message)
    throw err
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1
}
