const router = require('express').Router()
const { searchTrains, getTrainById, listTrains, createTrain, updateTrain, deleteTrain, approveTrain, rejectTrain } = require('../controllers/trainController')
const { authMiddleware, adminMiddleware, moduleMiddleware, approverMiddleware } = require('../middleware/authMiddleware')

const trainModule = moduleMiddleware('TRAINS')

router.get('/search', searchTrains)
router.get('/',       authMiddleware, adminMiddleware, trainModule, listTrains)
router.post('/',      authMiddleware, adminMiddleware, trainModule, createTrain)
router.put('/:id',    authMiddleware, adminMiddleware, trainModule, updateTrain)
router.delete('/:id', authMiddleware, adminMiddleware, trainModule, deleteTrain)
router.get('/:id',         getTrainById)
router.post('/:id/approve', authMiddleware, approverMiddleware, approveTrain)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectTrain)

module.exports = router
