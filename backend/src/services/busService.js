const prisma = require('../config/database')
const { getPagination, getPaginationMeta } = require('../utils/pagination')

async function searchBuses(query) {
  const { origin, destination, date, busType, operator, minPrice, maxPrice } = query
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

  if (busType)  where.busType  = { contains: busType,  mode: 'insensitive' }
  if (operator) where.operator = { contains: operator, mode: 'insensitive' }
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = Number(minPrice)
    if (maxPrice) where.price.lte = Number(maxPrice)
  }

  const [total, buses] = await Promise.all([
    prisma.bus.count({ where }),
    prisma.bus.findMany({ where, skip, take: limit, orderBy: { price: 'asc' } }),
  ])

  return { buses, meta: getPaginationMeta(total, page, limit) }
}

async function getBusById(id) {
  const bus = await prisma.bus.findUnique({ where: { id } })
  if (!bus) {
    const err = new Error('Bus not found.')
    err.status = 404
    throw err
  }
  return bus
}

module.exports = { searchBuses, getBusById }
