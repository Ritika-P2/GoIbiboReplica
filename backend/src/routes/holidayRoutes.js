const router = require('express').Router()
const { listPackages, getPackageById, createPackage, updatePackage, deletePackage, approvePackage, rejectPackage } = require('../controllers/holidayController')
const { authMiddleware, adminMiddleware, approverMiddleware } = require('../middleware/authMiddleware')

router.get('/',       listPackages)
router.get('/:id',    getPackageById)
router.post('/',      authMiddleware, adminMiddleware, createPackage)
router.put('/:id',    authMiddleware, adminMiddleware, updatePackage)
router.delete('/:id',      authMiddleware, adminMiddleware, deletePackage)
router.post('/:id/approve', authMiddleware, approverMiddleware, approvePackage)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectPackage)

module.exports = router
