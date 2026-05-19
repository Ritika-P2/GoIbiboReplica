const router = require('express').Router()

router.use('/auth',     require('./authRoutes'))
router.use('/users',    require('./userRoutes'))
router.use('/flights',  require('./flightRoutes'))
router.use('/hotels',   require('./hotelRoutes'))
router.use('/trains',   require('./trainRoutes'))
router.use('/buses',    require('./busRoutes'))
router.use('/cabs',     require('./cabRoutes'))
router.use('/bookings', require('./bookingRoutes'))
router.use('/payments', require('./paymentRoutes'))
router.use('/reviews',  require('./reviewRoutes'))
router.use('/coupons',  require('./couponRoutes'))
router.use('/holidays', require('./holidayRoutes'))

module.exports = router
