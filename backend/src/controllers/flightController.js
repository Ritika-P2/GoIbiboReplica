const flightService = require('../services/flightService')
const { successResponse } = require('../utils/apiResponse')

async function searchFlights(req, res, next) {
  try {
    const { flights, meta } = await flightService.searchFlights(req.query)
    res.json(successResponse('Flights fetched.', { flights }, meta))
  } catch (err) { next(err) }
}

async function getFlightById(req, res, next) {
  try {
    const flight = await flightService.getFlightById(req.params.id)
    res.json(successResponse('Flight fetched.', { flight }))
  } catch (err) { next(err) }
}

module.exports = { searchFlights, getFlightById }
