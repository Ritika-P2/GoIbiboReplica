const cabService = require('../services/cabService')
const { successResponse } = require('../utils/apiResponse')

async function searchCabs(req, res, next) {
  try {
    const cabs = await cabService.searchCabs(req.query)
    res.json(successResponse('Cabs fetched.', { cabs }))
  } catch (err) { next(err) }
}

module.exports = { searchCabs }
