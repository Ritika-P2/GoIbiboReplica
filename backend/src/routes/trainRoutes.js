const router = require('express').Router()
const { searchTrains, getTrainById, listTrains, createTrain, updateTrain, deleteTrain, approveTrain, rejectTrain } = require('../controllers/trainController')
const { authMiddleware, adminMiddleware, approverMiddleware } = require('../middleware/authMiddleware')

router.get('/search', searchTrains)
router.get('/',       authMiddleware, adminMiddleware, listTrains)
router.post('/',      authMiddleware, adminMiddleware, createTrain)
router.put('/:id',    authMiddleware, adminMiddleware, updateTrain)
router.delete('/:id', authMiddleware, adminMiddleware, deleteTrain)
router.get('/:id',         getTrainById)
router.post('/:id/approve', authMiddleware, approverMiddleware, approveTrain)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectTrain)

module.exports = router
