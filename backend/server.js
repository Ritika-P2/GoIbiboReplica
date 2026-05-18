require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cron = require('node-cron')

const corsOptions = require('./src/config/corsOptions')
const logger = require('./src/config/logger')
const { requestLogger } = require('./src/middleware/requestLogger')
const { errorHandler } = require('./src/middleware/errorHandler')
const { rateLimiter } = require('./src/middleware/rateLimiter')
const routes = require('./src/routes/index')

const app = express()
const PORT = process.env.PORT || 5000

// Security & parsing
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware
app.use(requestLogger)
app.use(rateLimiter)

// Routes
app.use('/api/v1', routes)

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

// Global error handler
app.use(errorHandler)

// Background jobs
if (process.env.NODE_ENV !== 'test') {
  const { bookingCleanup } = require('./src/jobs/bookingCleanup')
  const { priceUpdater } = require('./src/jobs/priceUpdater')
  cron.schedule('*/15 * * * *', bookingCleanup)
  cron.schedule('0 */6 * * *', priceUpdater)
}

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
})

module.exports = app
