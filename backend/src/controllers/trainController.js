const trainService = require('../services/trainService')
const { successResponse } = require('../utils/apiResponse')

async function searchTrains(req, res, next) {
  try {
    const { trains, meta } = await trainService.searchTrains(req.query)
    res.json(successResponse('Trains fetched.', { trains }, meta))
  } catch (err) { next(err) }
}

async function getTrainById(req, res, next) {
  try {
    const train = await trainService.getTrainById(req.params.id)
    res.json(successResponse('Train fetched.', { train }))
  } catch (err) { next(err) }
}

module.exports = { searchTrains, getTrainById }
