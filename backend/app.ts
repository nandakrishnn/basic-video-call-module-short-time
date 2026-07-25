import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { CONFIG } from './constants/config'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { transporter } from './lib/nodemailer'
import routes from './routes'
import { checkDueAppointments } from './services/scheduler.service'

const app = express()

app.use(cors())
app.use(express.json())

// TEMP: remove after diagnosing production email issue.
app.get('/api/_debug/email-check', async (req, res) => {
  if (req.query.key !== process.env.JWT_SECRET) {
    res.status(404).end()
    return
  }
  try {
    await transporter.verify()
    res.json({ ok: true })
  } catch (err) {
    const e = err as { code?: string; message?: string }
    res.json({ ok: false, code: e.code, message: e.message })
  }
})

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

const SCHEDULER_INTERVAL_MS = 60_000

app.listen(CONFIG.app.port, () => {
  console.log(`Clinzor video backend listening on port ${CONFIG.app.port}`)
  void checkDueAppointments()
  setInterval(() => void checkDueAppointments(), SCHEDULER_INTERVAL_MS)
})

export default app
