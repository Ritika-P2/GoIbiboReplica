const router = require('express').Router()
const { searchCabs } = require('../controllers/cabController')

router.get('/search', searchCabs)

module.exports = router
