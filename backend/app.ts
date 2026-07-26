import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import path from 'path'
import { CONFIG } from './constants/config'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import routes from './routes'
import { checkDueAppointments } from './services/scheduler.service'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

const SCHEDULER_INTERVAL_MS = 60_000

app.listen(CONFIG.app.port, () => {
  console.log(`Clinzor video backend listening on port ${CONFIG.app.port}`)
  if (process.env.JAAS_PRIVATE_KEY) {
    const key = CONFIG.jaas.privateKey
    const looksValid = key.startsWith('-----BEGIN PRIVATE KEY-----') && key.trimEnd().endsWith('-----END PRIVATE KEY-----')
    console.log(`JAAS_PRIVATE_KEY loaded: length=${key.length}, looksValidPem=${looksValid}`)
  }
  void checkDueAppointments()
  setInterval(() => void checkDueAppointments(), SCHEDULER_INTERVAL_MS)
})

export default app
