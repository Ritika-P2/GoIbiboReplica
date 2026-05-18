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

module.exports = { searchHotels, getHotelById, getHotelRooms }
