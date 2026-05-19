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

async function listBuses(req, res, next) {
  try {
    const { buses, meta } = await busService.listBuses(req.query)
    res.json(successResponse('Buses listed.', { buses }, meta))
  } catch (err) { next(err) }
}

async function createBus(req, res, next) {
  try {
    const bus = await busService.createBus(req.body)
    res.status(201).json(successResponse('Bus created.', { bus }))
  } catch (err) { next(err) }
}

async function updateBus(req, res, next) {
  try {
    const bus = await busService.updateBus(req.params.id, req.body)
    res.json(successResponse('Bus updated.', { bus }))
  } catch (err) { next(err) }
}

async function deleteBus(req, res, next) {
  try {
    await busService.deleteBus(req.params.id)
    res.json(successResponse('Bus deleted.'))
  } catch (err) { next(err) }
}

async function approveBus(req, res, next) {
  try {
    const bus = await busService.approveBus(req.params.id)
    res.json(successResponse('Bus approved.', { bus }))
  } catch (err) { next(err) }
}

async function rejectBus(req, res, next) {
  try {
    const bus = await busService.rejectBus(req.params.id, req.body.reason)
    res.json(successResponse('Bus rejected.', { bus }))
  } catch (err) { next(err) }
}

module.exports = { searchBuses, getBusById, listBuses, createBus, updateBus, deleteBus, approveBus, rejectBus }
