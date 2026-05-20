const router = require('express').Router()
const { searchBuses, getBusById, listBuses, createBus, updateBus, deleteBus, approveBus, rejectBus } = require('../controllers/busController')
const { authMiddleware, adminMiddleware, moduleMiddleware, approverMiddleware } = require('../middleware/authMiddleware')

const busModule = moduleMiddleware('BUSES')

router.get('/search', searchBuses)
router.get('/',       authMiddleware, adminMiddleware, busModule, listBuses)
router.post('/',      authMiddleware, adminMiddleware, busModule, createBus)
router.put('/:id',    authMiddleware, adminMiddleware, busModule, updateBus)
router.delete('/:id', authMiddleware, adminMiddleware, busModule, deleteBus)
router.get('/:id',         getBusById)
router.post('/:id/approve', authMiddleware, approverMiddleware, approveBus)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectBus)

module.exports = router
