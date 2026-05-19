const holidayService = require('../services/holidayService')
const { successResponse } = require('../utils/apiResponse')

async function listPackages(req, res, next) {
  try {
    const { packages, meta } = await holidayService.listPackages(req.query)
    res.json(successResponse('Packages fetched.', { packages }, meta))
  } catch (err) { next(err) }
}

async function getPackageById(req, res, next) {
  try {
    const pkg = await holidayService.getPackageById(req.params.id)
    res.json(successResponse('Package fetched.', { package: pkg }))
  } catch (err) { next(err) }
}

async function createPackage(req, res, next) {
  try {
    const pkg = await holidayService.createPackage(req.body)
    res.status(201).json(successResponse('Package created.', { package: pkg }))
  } catch (err) { next(err) }
}

async function updatePackage(req, res, next) {
  try {
    const pkg = await holidayService.updatePackage(req.params.id, req.body)
    res.json(successResponse('Package updated.', { package: pkg }))
  } catch (err) { next(err) }
}

async function deletePackage(req, res, next) {
  try {
    await holidayService.deletePackage(req.params.id)
    res.json(successResponse('Package deleted.'))
  } catch (err) { next(err) }
}

async function approvePackage(req, res, next) {
  try {
    const pkg = await holidayService.approvePackage(req.params.id)
    res.json(successResponse('Package approved.', { package: pkg }))
  } catch (err) { next(err) }
}

async function rejectPackage(req, res, next) {
  try {
    const pkg = await holidayService.rejectPackage(req.params.id, req.body.reason)
    res.json(successResponse('Package rejected.', { package: pkg }))
  } catch (err) { next(err) }
}

module.exports = { listPackages, getPackageById, createPackage, updatePackage, deletePackage, approvePackage, rejectPackage }
