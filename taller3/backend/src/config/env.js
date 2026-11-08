import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  pg: {
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT || 5432),
    user: process.env.PG_USER || 'clubtrack',
    password: process.env.PG_PASSWORD || 'clubtrack_pass',
    database: process.env.PG_DATABASE || 'clubtrack_db',
  },
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/clubtrack_nosql',
}
