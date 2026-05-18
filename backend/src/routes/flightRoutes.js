const router = require('express').Router()
const { searchFlights, getFlightById } = require('../controllers/flightController')
const { searchValidator } = require('../validators/searchValidator')
const { validateRequest } = require('../middleware/validateRequest')

router.get('/search', searchValidator, validateRequest, searchFlights)
router.get('/:id',    getFlightById)

module.exports = router
