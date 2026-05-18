const prisma = require('../config/database')
const logger = require('../config/logger')

async function bookingCleanup() {
  try {
    const cutoff = new Date(Date.now() - 15 * 60 * 1000)
    const { count } = await prisma.booking.updateMany({
      where: { status: 'PENDING', createdAt: { lt: cutoff } },
      data: { status: 'CANCELLED' },
    })
    if (count > 0) logger.info(`Booking cleanup: cancelled ${count} stale pending bookings`)
  } catch (err) {
    logger.error('Booking cleanup failed', { error: err.message })
  }
}

module.exports = { bookingCleanup }
