const router = require('express').Router()
const { searchBuses, getBusById, listBuses, createBus, updateBus, deleteBus, approveBus, rejectBus } = require('../controllers/busController')
const { authMiddleware, adminMiddleware, approverMiddleware } = require('../middleware/authMiddleware')

router.get('/search', searchBuses)
router.get('/',       authMiddleware, adminMiddleware, listBuses)
router.post('/',      authMiddleware, adminMiddleware, createBus)
router.put('/:id',    authMiddleware, adminMiddleware, updateBus)
router.delete('/:id', authMiddleware, adminMiddleware, deleteBus)
router.get('/:id',         getBusById)
router.post('/:id/approve', authMiddleware, approverMiddleware, approveBus)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectBus)

module.exports = router
