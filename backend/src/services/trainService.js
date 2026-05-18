const prisma = require('../config/database')
const { getPagination, getPaginationMeta } = require('../utils/pagination')

async function searchTrains(query) {
  const { origin, destination, date, trainClass } = query
  const { page, limit, skip } = getPagination(query)

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const where = {
    origin:        { contains: origin,      mode: 'insensitive' },
    destination:   { contains: destination, mode: 'insensitive' },
    departureTime: { gte: startOfDay, lte: endOfDay },
    availableSeats: { gt: 0 },
  }

  const [total, trains] = await Promise.all([
    prisma.train.count({ where }),
    prisma.train.findMany({ where, skip, take: limit, orderBy: { departureTime: 'asc' } }),
  ])

  // If a class filter is requested, filter in-memory (classes stored as JSON)
  const filtered = trainClass
    ? trains.filter((t) => t.classes && t.classes[trainClass])
    : trains

  return { trains: filtered, meta: getPaginationMeta(total, page, limit) }
}

async function getTrainById(id) {
  const train = await prisma.train.findUnique({ where: { id } })
  if (!train) {
    const err = new Error('Train not found.')
    err.status = 404
    throw err
  }
  return train
}

module.exports = { searchTrains, getTrainById }
