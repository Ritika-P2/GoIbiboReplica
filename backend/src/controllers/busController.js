const busService = require('../services/busService')
const { successResponse } = require('../utils/apiResponse')

async function searchBuses(req, res, next) {
  try {
    const { buses, meta } = await busService.searchBuses(req.query)
    res.json(successResponse('Buses fetched.', { buses }, meta))
  } catch (err) { next(err) }
}

async function getBusById(req, res, next) {
  try {
    const bus = await busService.getBusById(req.params.id)
    res.json(successResponse('Bus fetched.', { bus }))
  } catch (err) { next(err) }
}

module.exports = { searchBuses, getBusById }
