const { body } = require('express-validator')

const bookingValidator = [
  body('type').isIn(['FLIGHT', 'HOTEL', 'TRAIN', 'BUS', 'CAB', 'HOLIDAY']).withMessage('Invalid booking type'),
  body('passengers').isArray({ min: 1 }).withMessage('At least one passenger required'),
  body('contactInfo').notEmpty().withMessage('Contact info is required'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
]

module.exports = { bookingValidator }
