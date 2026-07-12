import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { CONFIG } from './constants/config'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import routes from './routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(CONFIG.app.port, () => {
  console.log(`Clinzor video backend listening on port ${CONFIG.app.port}`)
})

export default app
