const router = require('express').Router()
const { listOffers, getOfferById, getOffersByCategory } = require('../controllers/offerController')

// /category/:category must be registered before /:id to avoid Express matching
// "category" as an offer UUID
router.get('/category/:category', getOffersByCategory)
router.get('/:id',                getOfferById)
router.get('/',                   listOffers)

module.exports = router
