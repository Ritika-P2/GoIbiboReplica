const router = require('express').Router()
const { getProfile, updateProfile } = require('../controllers/userController')
const { authMiddleware } = require('../middleware/authMiddleware')

router.use(authMiddleware)
router.get('/profile',  getProfile)
router.put('/profile',  updateProfile)

module.exports = router
