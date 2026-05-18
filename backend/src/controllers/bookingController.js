const bookingService = require('../services/bookingService')
const { successResponse } = require('../utils/apiResponse')

async function createBooking(req, res, next) {
  try {
    const booking = await bookingService.createBooking(req.user.id, req.body)
    res.status(201).json(successResponse('Booking confirmed.', { booking }))
  } catch (err) { next(err) }
}

async function getMyBookings(req, res, next) {
  try {
    const { bookings, meta } = await bookingService.getMyBookings(req.user.id, req.query)
    res.json(successResponse('Bookings fetched.', { bookings }, meta))
  } catch (err) { next(err) }
}

async function getBookingById(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.user.id, req.params.id)
    res.json(successResponse('Booking fetched.', { booking }))
  } catch (err) { next(err) }
}

async function cancelBooking(req, res, next) {
  try {
    const booking = await bookingService.cancelBooking(req.user.id, req.params.id)
    res.json(successResponse('Booking cancelled successfully.', { booking }))
  } catch (err) { next(err) }
}

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking }
