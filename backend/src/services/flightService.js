const prisma = require('../config/database')
const { getPagination, getPaginationMeta } = require('../utils/pagination')

async function searchFlights(query) {
  const { origin, destination, date, cabin, stops, airline, minPrice, maxPrice } = query
  const { page, limit, skip } = getPagination(query)

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const where = {
    origin:      { equals: origin.toUpperCase(),      mode: 'insensitive' },
    destination: { equals: destination.toUpperCase(), mode: 'insensitive' },
    departureTime: { gte: startOfDay, lte: endOfDay },
    availableSeats: { gt: 0 },
  }

  if (cabin)    where.cabinClass = cabin.toUpperCase()
  if (stops !== undefined) where.stops = Number(stops)
  if (airline)  where.airline = { contains: airline, mode: 'insensitive' }
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = Number(minPrice)
    if (maxPrice) where.price.lte = Number(maxPrice)
  }

  const [total, flights] = await Promise.all([
    prisma.flight.count({ where }),
    prisma.flight.findMany({ where, skip, take: limit, orderBy: { price: 'asc' } }),
  ])

  return { flights, meta: getPaginationMeta(total, page, limit) }
}

async function getFlightById(id) {
  const flight = await prisma.flight.findUnique({ where: { id } })
  if (!flight) {
    const err = new Error('Flight not found.')
    err.status = 404
    throw err
  }
  return flight
}

module.exports = { searchFlights, getFlightById }
