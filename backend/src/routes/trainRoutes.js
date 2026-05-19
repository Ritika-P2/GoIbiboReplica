const router = require('express').Router()
const { searchTrains, getTrainById, listTrains, createTrain, updateTrain, deleteTrain } = require('../controllers/trainController')
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')

router.get('/search', searchTrains)
router.get('/',       authMiddleware, adminMiddleware, listTrains)
router.post('/',      authMiddleware, adminMiddleware, createTrain)
router.put('/:id',    authMiddleware, adminMiddleware, updateTrain)
router.delete('/:id', authMiddleware, adminMiddleware, deleteTrain)
router.get('/:id',    getTrainById)

module.exports = router
