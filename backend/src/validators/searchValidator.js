const { query } = require('express-validator')

const searchValidator = [
  query('origin').trim().notEmpty().withMessage('Origin is required'),
  query('destination').trim().notEmpty().withMessage('Destination is required'),
  query('date').isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
]

module.exports = { searchValidator }
