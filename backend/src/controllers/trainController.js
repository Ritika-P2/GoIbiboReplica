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

async function listTrains(req, res, next) {
  try {
    const { trains, meta } = await trainService.listTrains(req.query)
    res.json(successResponse('Trains listed.', { trains }, meta))
  } catch (err) { next(err) }
}

async function createTrain(req, res, next) {
  try {
    const train = await trainService.createTrain(req.body)
    res.status(201).json(successResponse('Train created.', { train }))
  } catch (err) { next(err) }
}

async function updateTrain(req, res, next) {
  try {
    const train = await trainService.updateTrain(req.params.id, req.body)
    res.json(successResponse('Train updated.', { train }))
  } catch (err) { next(err) }
}

async function deleteTrain(req, res, next) {
  try {
    await trainService.deleteTrain(req.params.id)
    res.json(successResponse('Train deleted.'))
  } catch (err) { next(err) }
}

module.exports = { searchTrains, getTrainById, listTrains, createTrain, updateTrain, deleteTrain }
