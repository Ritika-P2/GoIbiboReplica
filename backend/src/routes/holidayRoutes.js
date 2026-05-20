const router = require('express').Router()
const { listPackages, getPackageById, createPackage, updatePackage, deletePackage, approvePackage, rejectPackage } = require('../controllers/holidayController')
const { authMiddleware, adminMiddleware, moduleMiddleware, approverMiddleware } = require('../middleware/authMiddleware')

const holidayModule = moduleMiddleware('HOLIDAYS')

router.get('/',       listPackages)
router.get('/:id',    getPackageById)
router.post('/',      authMiddleware, adminMiddleware, holidayModule, createPackage)
router.put('/:id',    authMiddleware, adminMiddleware, holidayModule, updatePackage)
router.delete('/:id',      authMiddleware, adminMiddleware, holidayModule, deletePackage)
router.post('/:id/approve', authMiddleware, approverMiddleware, approvePackage)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectPackage)

module.exports = router
