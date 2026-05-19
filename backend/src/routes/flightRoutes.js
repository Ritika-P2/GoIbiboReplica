const router = require('express').Router()
const { searchFlights, getFlightById, listFlights, createFlight, updateFlight, deleteFlight, approveFlight, rejectFlight } = require('../controllers/flightController')
const { authMiddleware, adminMiddleware, approverMiddleware } = require('../middleware/authMiddleware')
const { searchValidator } = require('../validators/searchValidator')
const { validateRequest } = require('../middleware/validateRequest')

router.get('/search', searchValidator, validateRequest, searchFlights)
router.get('/',       authMiddleware, adminMiddleware, listFlights)
router.post('/',      authMiddleware, adminMiddleware, createFlight)
router.put('/:id',    authMiddleware, adminMiddleware, updateFlight)
router.delete('/:id', authMiddleware, adminMiddleware, deleteFlight)
router.get('/:id',         getFlightById)
router.post('/:id/approve', authMiddleware, approverMiddleware, approveFlight)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectFlight)

module.exports = router
