import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env.js'
import { testPostgresConnection } from './config/postgres.js'
import { connectMongo } from './config/mongo.js'
import { swaggerSpec } from './config/swagger.js'
import { seedDatabases } from './db/seed.js'
import apiRouter from './routes/api.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }))
app.use(express.json())

// Documentación Swagger en /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api/openapi.json', (req, res) => res.json(swaggerSpec))

app.use('/api', apiRouter)

app.get('/', (req, res) => {
  res.redirect('/api/docs')
})

app.use(notFoundHandler)
app.use(errorHandler)

async function start() {
  try {
    await testPostgresConnection()
    console.log('PostgreSQL conectado')

    await connectMongo()
    await seedDatabases({ force: false })

    app.listen(env.port, () => {
      console.log(`Servidor corriendo en http://localhost:${env.port}`)
      console.log(`Swagger disponible en http://localhost:${env.port}/api/docs`)
    })
  } catch (err) {
    console.error('Error al iniciar el servidor:', err.message)
    process.exit(1)
  }
}

start()
