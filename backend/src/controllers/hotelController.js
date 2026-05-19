const hotelService = require('../services/hotelService')
const { successResponse } = require('../utils/apiResponse')

async function searchHotels(req, res, next) {
  try {
    const { hotels, meta } = await hotelService.searchHotels(req.query)
    res.json(successResponse('Hotels fetched.', { hotels }, meta))
  } catch (err) { next(err) }
}

async function getHotelById(req, res, next) {
  try {
    const hotel = await hotelService.getHotelById(req.params.id)
    res.json(successResponse('Hotel fetched.', { hotel }))
  } catch (err) { next(err) }
}

async function getHotelRooms(req, res, next) {
  try {
    const rooms = await hotelService.getHotelRooms(req.params.id, req.query)
    res.json(successResponse('Rooms fetched.', { rooms }))
  } catch (err) { next(err) }
}

async function listHotels(req, res, next) {
  try {
    const { hotels, meta } = await hotelService.listHotels(req.query)
    res.json(successResponse('Hotels listed.', { hotels }, meta))
  } catch (err) { next(err) }
}

async function createHotel(req, res, next) {
  try {
    const hotel = await hotelService.createHotel(req.body)
    res.status(201).json(successResponse('Hotel created.', { hotel }))
  } catch (err) { next(err) }
}

async function updateHotel(req, res, next) {
  try {
    const hotel = await hotelService.updateHotel(req.params.id, req.body)
    res.json(successResponse('Hotel updated.', { hotel }))
  } catch (err) { next(err) }
}

async function deleteHotel(req, res, next) {
  try {
    await hotelService.deleteHotel(req.params.id)
    res.json(successResponse('Hotel deleted.'))
  } catch (err) { next(err) }
}

async function approveHotel(req, res, next) {
  try {
    const hotel = await hotelService.approveHotel(req.params.id)
    res.json(successResponse('Hotel approved.', { hotel }))
  } catch (err) { next(err) }
}

async function rejectHotel(req, res, next) {
  try {
    const hotel = await hotelService.rejectHotel(req.params.id, req.body.reason)
    res.json(successResponse('Hotel rejected.', { hotel }))
  } catch (err) { next(err) }
}

module.exports = { searchHotels, getHotelById, getHotelRooms, listHotels, createHotel, updateHotel, deleteHotel, approveHotel, rejectHotel }
