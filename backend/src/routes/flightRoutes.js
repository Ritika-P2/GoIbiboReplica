const router = require('express').Router()
const { searchFlights, getFlightById, listFlights, createFlight, updateFlight, deleteFlight, approveFlight, rejectFlight } = require('../controllers/flightController')
const { authMiddleware, adminMiddleware, moduleMiddleware, approverMiddleware } = require('../middleware/authMiddleware')
const { searchValidator } = require('../validators/searchValidator')
const { validateRequest } = require('../middleware/validateRequest')

const flightModule = moduleMiddleware('FLIGHTS')

router.get('/search', searchValidator, validateRequest, searchFlights)
router.get('/',       authMiddleware, adminMiddleware, flightModule, listFlights)
router.post('/',      authMiddleware, adminMiddleware, flightModule, createFlight)
router.put('/:id',    authMiddleware, adminMiddleware, flightModule, updateFlight)
router.delete('/:id', authMiddleware, adminMiddleware, flightModule, deleteFlight)
router.get('/:id',         getFlightById)
router.post('/:id/approve', authMiddleware, approverMiddleware, approveFlight)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectFlight)

module.exports = router
