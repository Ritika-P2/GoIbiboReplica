const router = require('express').Router()
const { listPackages, getPackageById, createPackage, updatePackage, deletePackage } = require('../controllers/holidayController')
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')

router.get('/',       listPackages)
router.get('/:id',    getPackageById)
router.post('/',      authMiddleware, adminMiddleware, createPackage)
router.put('/:id',    authMiddleware, adminMiddleware, updatePackage)
router.delete('/:id', authMiddleware, adminMiddleware, deletePackage)

module.exports = router
