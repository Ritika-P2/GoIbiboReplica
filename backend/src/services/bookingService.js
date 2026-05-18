const prisma = require('../config/database')
const { getPagination, getPaginationMeta } = require('../utils/pagination')

const TYPE_FIELD = {
  FLIGHT: 'flightId',
  HOTEL:  'hotelId',
  TRAIN:  'trainId',
  BUS:    'busId',
  CAB:    'cabId',
}

const SEAT_MODEL = {
  FLIGHT: 'flight',
  TRAIN:  'train',
  BUS:    'bus',
}

async function createBooking(userId, body) {
  const { type, passengers, contactInfo, totalAmount, checkIn, checkOut, packageData, ...ids } = body

  if (type !== 'HOLIDAY') {
    const foreignKey = TYPE_FIELD[type]
    if (!foreignKey || !ids[foreignKey]) {
      const err = new Error(`${foreignKey} is required for booking type ${type}.`)
      err.status = 400
      throw err
    }

    // Decrement available seats for transport bookings
    const seatModel = SEAT_MODEL[type]
    if (seatModel) {
      const entity = await prisma[seatModel].findUnique({ where: { id: ids[foreignKey] } })
      if (!entity) {
        const err = new Error(`${type} not found.`)
        err.status = 404
        throw err
      }
      const seatsNeeded = Array.isArray(passengers) ? passengers.length : 1
      if (entity.availableSeats < seatsNeeded) {
        const err = new Error('Not enough seats available.')
        err.status = 409
        throw err
      }
      await prisma[seatModel].update({
        where: { id: ids[foreignKey] },
        data:  { availableSeats: { decrement: seatsNeeded } },
      })
    }

    // Decrement available rooms for hotel bookings
    if (type === 'HOTEL' && ids.roomId) {
      const room = await prisma.room.findUnique({ where: { id: ids.roomId } })
      if (!room || room.availableRooms < 1) {
        const err = new Error('Room not available.')
        err.status = 409
        throw err
      }
      await prisma.room.update({
        where: { id: ids.roomId },
        data:  { availableRooms: { decrement: 1 } },
      })
    }
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      type,
      status:      'CONFIRMED',
      totalAmount: Number(totalAmount),
      passengers,
      contactInfo,
      packageData: packageData || null,
      checkIn:  checkIn  ? new Date(checkIn)  : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      ...(ids.flightId ? { flightId: ids.flightId } : {}),
      ...(ids.hotelId  ? { hotelId:  ids.hotelId  } : {}),
      ...(ids.roomId   ? { roomId:   ids.roomId   } : {}),
      ...(ids.trainId  ? { trainId:  ids.trainId  } : {}),
      ...(ids.busId    ? { busId:    ids.busId    } : {}),
      ...(ids.cabId    ? { cabId:    ids.cabId    } : {}),
    },
    include: {
      flight: true, hotel: true, room: true,
      train: true,  bus: true,   cab: true,
    },
  })

  // Mark payment as SUCCESS immediately (demo: card payment confirmed at booking time)
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: Number(totalAmount),
      status: 'SUCCESS',
      method: 'CARD',
      paidAt: new Date(),
    },
  })

  return booking
}

async function getMyBookings(userId, query) {
  const { page, limit, skip } = getPagination(query)
  const where = { userId }
  if (query.type)   where.type   = query.type.toUpperCase()
  if (query.status) where.status = query.status.toUpperCase()

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        flight:  { select: { flightNumber: true, airline: true, origin: true, destination: true, departureTime: true, arrivalTime: true, cabinClass: true } },
        hotel:   { select: { name: true, city: true, address: true, starRating: true } },
        room:    { select: { type: true, pricePerNight: true } },
        train:   { select: { trainName: true, trainNumber: true, origin: true, destination: true, departureTime: true, arrivalTime: true, duration: true } },
        bus:     { select: { operator: true, busType: true, origin: true, destination: true, departureTime: true, arrivalTime: true, duration: true } },
        payment: { select: { status: true, method: true, paidAt: true, amount: true } },
      },
    }),
  ])

  return { bookings, meta: getPaginationMeta(total, page, limit) }
}

async function getBookingById(userId, bookingId) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: {
      flight: true, hotel: true, room: true,
      train: true,  bus: true,   cab: true,
      payment: true,
    },
  })
  if (!booking) {
    const err = new Error('Booking not found.')
    err.status = 404
    throw err
  }
  return booking
}

async function cancelBooking(userId, bookingId) {
  const booking = await prisma.booking.findFirst({ where: { id: bookingId, userId } })
  if (!booking) {
    const err = new Error('Booking not found.')
    err.status = 404
    throw err
  }
  if (booking.status === 'CANCELLED') {
    const err = new Error('Booking is already cancelled.')
    err.status = 409
    throw err
  }
  if (booking.status === 'COMPLETED') {
    const err = new Error('Completed bookings cannot be cancelled.')
    err.status = 409
    throw err
  }

  // Restore seats / rooms
  const seatModel = SEAT_MODEL[booking.type]
  if (seatModel) {
    const foreignKey = TYPE_FIELD[booking.type]
    const entityId = booking[foreignKey]
    if (entityId) {
      const seatsToRestore = Array.isArray(booking.passengers) ? booking.passengers.length : 1
      await prisma[seatModel].update({
        where: { id: entityId },
        data:  { availableSeats: { increment: seatsToRestore } },
      })
    }
  }
  if (booking.type === 'HOTEL' && booking.roomId) {
    await prisma.room.update({
      where: { id: booking.roomId },
      data:  { availableRooms: { increment: 1 } },
    })
  }

  const [updated] = await Promise.all([
    prisma.booking.update({
      where: { id: bookingId },
      data:  { status: 'CANCELLED' },
    }),
    prisma.payment.updateMany({
      where: { bookingId, status: 'SUCCESS' },
      data:  { status: 'REFUNDED' },
    }),
  ])

  return updated
}

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking }
