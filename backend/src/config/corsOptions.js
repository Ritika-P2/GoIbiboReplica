const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')

module.exports = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked: ${origin}`))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}
