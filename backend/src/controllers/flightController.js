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

async function listFlights(req, res, next) {
  try {
    const { flights, meta } = await flightService.listFlights(req.query)
    res.json(successResponse('Flights listed.', { flights }, meta))
  } catch (err) { next(err) }
}

async function createFlight(req, res, next) {
  try {
    const flight = await flightService.createFlight(req.body)
    res.status(201).json(successResponse('Flight created.', { flight }))
  } catch (err) { next(err) }
}

async function updateFlight(req, res, next) {
  try {
    const flight = await flightService.updateFlight(req.params.id, req.body)
    res.json(successResponse('Flight updated.', { flight }))
  } catch (err) { next(err) }
}

async function deleteFlight(req, res, next) {
  try {
    await flightService.deleteFlight(req.params.id)
    res.json(successResponse('Flight deleted.'))
  } catch (err) { next(err) }
}

module.exports = { searchFlights, getFlightById, listFlights, createFlight, updateFlight, deleteFlight }
