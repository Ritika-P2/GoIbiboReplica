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
  const { type, passengers, contactInfo, totalAmount, checkIn, checkOut, packageData, returnFlightId, ...ids } = body

  if (type !== 'HOLIDAY') {
    const foreignKey = TYPE_FIELD[type]
    if (!foreignKey || !ids[foreignKey]) {
      const err = new Error(`${foreignKey} is required for booking type ${type}.`)
      err.status = 400
      throw err
    }

    // Prevent duplicate pending bookings: return existing one for same user+flight within 30 min
    if (type === 'FLIGHT' && ids.flightId) {
      const existing = await prisma.booking.findFirst({
        where: {
          userId,
          type: 'FLIGHT',
          flightId: ids.flightId,
          returnFlightId: returnFlightId || null,
          status: 'PENDING',
          createdAt: { gt: new Date(Date.now() - 30 * 60 * 1000) },
        },
        include: {
          flight:       true,
          returnFlight: true,
          payment:      { select: { status: true, method: true, paidAt: true, amount: true } },
        },
      })
      if (existing) return existing
    }

    // Hold seats immediately to prevent overbooking during payment window
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

      // Hold seats on return flight too (round-trip flight bookings)
      if (type === 'FLIGHT' && returnFlightId) {
        const returnEntity = await prisma.flight.findUnique({ where: { id: returnFlightId } })
        if (!returnEntity) {
          await prisma.flight.update({
            where: { id: ids[foreignKey] },
            data:  { availableSeats: { increment: seatsNeeded } },
          })
          const err = new Error('Return flight not found.')
          err.status = 404
          throw err
        }
        if (returnEntity.availableSeats < seatsNeeded) {
          await prisma.flight.update({
            where: { id: ids[foreignKey] },
            data:  { availableSeats: { increment: seatsNeeded } },
          })
          const err = new Error('Not enough seats available on the return flight.')
          err.status = 409
          throw err
        }
        await prisma.flight.update({
          where: { id: returnFlightId },
          data:  { availableSeats: { decrement: seatsNeeded } },
        })
      }

      // Hold seats for additional multi-city segments (segment 0 already held via flightId above)
      if (type === 'FLIGHT' && packageData?.tripType === 'MULTI_CITY' && packageData.segments?.length > 1) {
        const heldIds = [ids[foreignKey]]
        for (const seg of packageData.segments.slice(1)) {
          if (!seg.flightId) continue
          const segFlight = await prisma.flight.findUnique({ where: { id: seg.flightId } })
          if (!segFlight) {
            for (const heldId of heldIds) {
              await prisma.flight.update({ where: { id: heldId }, data: { availableSeats: { increment: seatsNeeded } } })
            }
            const err = new Error('Flight not found for one of the multi-city segments.')
            err.status = 404
            throw err
          }
          if (segFlight.availableSeats < seatsNeeded) {
            for (const heldId of heldIds) {
              await prisma.flight.update({ where: { id: heldId }, data: { availableSeats: { increment: seatsNeeded } } })
            }
            const err = new Error('Not enough seats available on one of the multi-city segments.')
            err.status = 409
            throw err
          }
          await prisma.flight.update({ where: { id: seg.flightId }, data: { availableSeats: { decrement: seatsNeeded } } })
          heldIds.push(seg.flightId)
        }
      }
    }

    // Hold rooms for hotel bookings
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

  // For FLIGHT type: create as PENDING (awaiting payment confirmation)
  // For all other types: create as CONFIRMED directly (existing behaviour)
  const initialStatus = type === 'FLIGHT' ? 'PENDING' : 'CONFIRMED'

  const booking = await prisma.booking.create({
    data: {
      userId,
      type,
      status:      initialStatus,
      totalAmount: Number(totalAmount),
      passengers,
      contactInfo,
      packageData: packageData || null,
      checkIn:  checkIn  ? new Date(checkIn)  : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      ...(ids.flightId      ? { flightId:       ids.flightId       } : {}),
      ...(returnFlightId    ? { returnFlightId                      } : {}),
      ...(ids.hotelId       ? { hotelId:        ids.hotelId        } : {}),
      ...(ids.roomId        ? { roomId:         ids.roomId         } : {}),
      ...(ids.trainId       ? { trainId:        ids.trainId        } : {}),
      ...(ids.busId         ? { busId:          ids.busId          } : {}),
      ...(ids.cabId         ? { cabId:          ids.cabId          } : {}),
    },
    include: {
      flight: true, returnFlight: true,
      hotel: true, room: true,
      train: true,  bus: true, cab: true,
    },
  })

  // Create payment record: PENDING for flights, SUCCESS for all others
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount:    Number(totalAmount),
      status:    type === 'FLIGHT' ? 'PENDING' : 'SUCCESS',
      method:    type === 'FLIGHT' ? null : 'CARD',
      paidAt:    type === 'FLIGHT' ? null : new Date(),
    },
  })

  return booking
}

async function confirmPayment(userId, bookingId, { totalAmount, packageData } = {}) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  })
  if (!booking) {
    const err = new Error('Booking not found.')
    err.status = 404
    throw err
  }
  if (booking.status !== 'PENDING') {
    const err = new Error('Booking is not in a pending state.')
    err.status = 409
    throw err
  }

  // Build booking update — apply final coupon-adjusted amount + packageData if supplied
  const bookingUpdate = { status: 'CONFIRMED' }
  if (totalAmount  !== undefined) bookingUpdate.totalAmount = Number(totalAmount)
  if (packageData  !== undefined) bookingUpdate.packageData = packageData

  // Build payment update — also correct the stored amount to the final paid value
  const paymentUpdate = { status: 'SUCCESS', method: 'CARD', paidAt: new Date() }
  if (totalAmount !== undefined) paymentUpdate.amount = Number(totalAmount)

  const [updated] = await Promise.all([
    prisma.booking.update({
      where: { id: bookingId },
      data:  bookingUpdate,
      include: {
        flight:       { select: { flightNumber: true, airline: true, origin: true, destination: true, departureTime: true, arrivalTime: true, cabinClass: true } },
        returnFlight: { select: { flightNumber: true, airline: true, origin: true, destination: true, departureTime: true, arrivalTime: true, cabinClass: true } },
        payment:      { select: { status: true, method: true, paidAt: true, amount: true } },
      },
    }),
    prisma.payment.updateMany({
      where: { bookingId, status: 'PENDING' },
      data:  paymentUpdate,
    }),
  ])

  return updated
}

function getJourneyDate(booking) {
  if (booking.type === 'FLIGHT' && booking.flight?.departureTime) return new Date(booking.flight.departureTime)
  if (booking.type === 'TRAIN'  && booking.train?.departureTime)  return new Date(booking.train.departureTime)
  if (booking.type === 'BUS'    && booking.bus?.departureTime)    return new Date(booking.bus.departureTime)
  if (booking.type === 'HOTEL'  && booking.checkOut)              return new Date(booking.checkOut)
  if (booking.type === 'HOLIDAY' && booking.checkOut)             return new Date(booking.checkOut)
  return null
}

async function getMyBookings(userId, query) {
  const { page, limit, skip } = getPagination(query)
  const where = { userId }
  if (query.type)   where.type   = query.type.toUpperCase()
  if (query.status) where.status = query.status.toUpperCase()

  const flightSelect = { select: { flightNumber: true, airline: true, origin: true, destination: true, departureTime: true, arrivalTime: true, cabinClass: true } }

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        flight:       flightSelect,
        returnFlight: flightSelect,
        hotel:        { select: { name: true, city: true, address: true, starRating: true } },
        room:         { select: { type: true, pricePerNight: true } },
        train:        { select: { trainName: true, trainNumber: true, origin: true, destination: true, departureTime: true, arrivalTime: true, duration: true } },
        bus:          { select: { operator: true, busType: true, origin: true, destination: true, departureTime: true, arrivalTime: true, duration: true } },
        payment:      { select: { status: true, method: true, paidAt: true, amount: true } },
      },
    }),
  ])

  // Auto-complete any CONFIRMED bookings whose journey date has passed
  const now = new Date()
  const toComplete = bookings
    .filter(b => b.status === 'CONFIRMED')
    .filter(b => { const jd = getJourneyDate(b); return jd && jd < now })
    .map(b => b.id)

  if (toComplete.length > 0) {
    await prisma.booking.updateMany({
      where: { id: { in: toComplete } },
      data:  { status: 'COMPLETED' },
    })
    bookings.forEach(b => { if (toComplete.includes(b.id)) b.status = 'COMPLETED' })
  }

  return { bookings, meta: getPaginationMeta(total, page, limit) }
}

async function getBookingById(userId, bookingId) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: {
      flight: true, returnFlight: true,
      hotel: true, room: true,
      train: true,  bus: true, cab: true,
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

      // Restore return flight seats too (round-trip)
      if (booking.type === 'FLIGHT' && booking.returnFlightId) {
        await prisma.flight.update({
          where: { id: booking.returnFlightId },
          data:  { availableSeats: { increment: seatsToRestore } },
        })
      }

      // Restore seats for additional multi-city segments (segment 0 restored above via flightId)
      if (booking.type === 'FLIGHT' && booking.packageData?.tripType === 'MULTI_CITY' && booking.packageData.segments?.length > 1) {
        for (const seg of booking.packageData.segments.slice(1)) {
          if (seg.flightId) {
            await prisma.flight.update({
              where: { id: seg.flightId },
              data:  { availableSeats: { increment: seatsToRestore } },
            })
          }
        }
      }
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

module.exports = { createBooking, confirmPayment, getMyBookings, getBookingById, cancelBooking }
