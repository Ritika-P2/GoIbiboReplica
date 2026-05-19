const router = require('express').Router()
const { searchBuses, getBusById, listBuses, createBus, updateBus, deleteBus } = require('../controllers/busController')
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')

router.get('/search', searchBuses)
router.get('/',       authMiddleware, adminMiddleware, listBuses)
router.post('/',      authMiddleware, adminMiddleware, createBus)
router.put('/:id',    authMiddleware, adminMiddleware, updateBus)
router.delete('/:id', authMiddleware, adminMiddleware, deleteBus)
router.get('/:id',    getBusById)

module.exports = router
