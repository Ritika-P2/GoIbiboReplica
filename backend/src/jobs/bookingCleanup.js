const prisma = require('../config/database')
const logger = require('../config/logger')

const SEAT_MODEL  = { FLIGHT: 'flight', TRAIN: 'train', BUS: 'bus' }
const FOREIGN_KEY = { FLIGHT: 'flightId', TRAIN: 'trainId', BUS: 'busId' }

async function bookingCleanup() {
  try {
    const now    = new Date()
    // Pending payment window: 30 minutes before a booking expires
    const cutoff = new Date(Date.now() - 30 * 60 * 1000)

    // --- 1. Expire stale PENDING bookings and restore held seats ---
    const expiredPending = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoff },
        type: { in: ['FLIGHT', 'TRAIN', 'BUS'] },
      },
      select: { id: true, type: true, flightId: true, returnFlightId: true, trainId: true, busId: true, passengers: true, packageData: true },
    })

    for (const b of expiredPending) {
      const model = SEAT_MODEL[b.type]
      const fk    = FOREIGN_KEY[b.type]
      const entityId = b[fk]
      if (model && entityId) {
        const seatsToRestore = Array.isArray(b.passengers) ? b.passengers.length : 1
        await prisma[model].update({
          where: { id: entityId },
          data:  { availableSeats: { increment: seatsToRestore } },
        })
        // Restore return flight seats too (round-trip)
        if (b.type === 'FLIGHT' && b.returnFlightId) {
          await prisma.flight.update({
            where: { id: b.returnFlightId },
            data:  { availableSeats: { increment: seatsToRestore } },
          })
        }
        // Restore seats for additional multi-city segments (segment 0 restored above)
        if (b.type === 'FLIGHT' && b.packageData?.tripType === 'MULTI_CITY' && b.packageData.segments?.length > 1) {
          for (const seg of b.packageData.segments.slice(1)) {
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

    // Cancel all expired PENDING bookings (transport + hotel/holiday)
    const { count: cancelled } = await prisma.booking.updateMany({
      where: { status: 'PENDING', createdAt: { lt: cutoff } },
      data:  { status: 'CANCELLED' },
    })
    if (cancelled > 0) {
      logger.info(`Booking cleanup: cancelled ${cancelled} expired pending bookings (seats restored for ${expiredPending.length} transport bookings)`)
    }

    // --- 2. Auto-complete CONFIRMED bookings whose journey has passed ---
    const pastFlights = await prisma.booking.findMany({
      where: { status: 'CONFIRMED', type: 'FLIGHT' },
      select: { id: true, flight: { select: { departureTime: true } } },
    })
    const pastTrains = await prisma.booking.findMany({
      where: { status: 'CONFIRMED', type: 'TRAIN' },
      select: { id: true, train: { select: { departureTime: true } } },
    })
    const pastBuses = await prisma.booking.findMany({
      where: { status: 'CONFIRMED', type: 'BUS' },
      select: { id: true, bus: { select: { departureTime: true } } },
    })
    const pastHotels = await prisma.booking.findMany({
      where: { status: 'CONFIRMED', type: { in: ['HOTEL', 'HOLIDAY'] }, checkOut: { lt: now } },
      select: { id: true },
    })

    const toComplete = [
      ...pastFlights.filter(b => b.flight?.departureTime && new Date(b.flight.departureTime) < now).map(b => b.id),
      ...pastTrains.filter(b => b.train?.departureTime   && new Date(b.train.departureTime)  < now).map(b => b.id),
      ...pastBuses.filter(b  => b.bus?.departureTime     && new Date(b.bus.departureTime)    < now).map(b => b.id),
      ...pastHotels.map(b => b.id),
    ]

    if (toComplete.length > 0) {
      await prisma.booking.updateMany({
        where: { id: { in: toComplete } },
        data:  { status: 'COMPLETED' },
      })
      logger.info(`Booking cleanup: completed ${toComplete.length} past bookings`)
    }
  } catch (err) {
    logger.error('Booking cleanup failed', { error: err.message })
  }
}

module.exports = { bookingCleanup }
