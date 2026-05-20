const prisma = require('../config/database')
const { getPagination, getPaginationMeta } = require('../utils/pagination')
const { getScheduleBounds } = require('../utils/scheduleFilter')

async function searchFlights(query) {
  const { origin, destination, date, cabin, stops, airline, minPrice, maxPrice } = query
  const { page, limit, skip } = getPagination(query)

  // Hide flights that departed more than 60 minutes ago
  const { lowerBound, endOfDay } = getScheduleBounds(date, 60)

  const where = {
    status:      'APPROVED',
    origin:      { equals: origin.toUpperCase(),      mode: 'insensitive' },
    destination: { equals: destination.toUpperCase(), mode: 'insensitive' },
    departureTime: { gte: lowerBound, lte: endOfDay },
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
  if (!flight) { const err = new Error('Flight not found.'); err.status = 404; throw err }
  return flight
}

async function listFlights(query) {
  const { page, limit, skip } = getPagination(query)
  const where = query.status ? { status: query.status } : {}
  const [total, flights] = await Promise.all([
    prisma.flight.count({ where }),
    prisma.flight.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  ])
  return { flights, meta: getPaginationMeta(total, page, limit) }
}

async function createFlight(data) {
  return prisma.flight.create({
    data: {
      flightNumber:   data.flightNumber,
      airline:        data.airline,
      origin:         data.origin.toUpperCase(),
      destination:    data.destination.toUpperCase(),
      departureTime:  new Date(data.departureTime),
      arrivalTime:    new Date(data.arrivalTime),
      duration:       Number(data.duration),
      price:          Number(data.price),
      totalSeats:     Number(data.totalSeats),
      availableSeats: Number(data.availableSeats),
      cabinClass:     data.cabinClass || 'ECONOMY',
      stops:          Number(data.stops) || 0,
      status:         'PENDING',
    },
  })
}

async function updateFlight(id, data) {
  const flight = await prisma.flight.findUnique({ where: { id } })
  if (!flight) { const err = new Error('Flight not found.'); err.status = 404; throw err }
  const update = {}
  if (data.flightNumber)  update.flightNumber  = data.flightNumber
  if (data.airline)       update.airline       = data.airline
  if (data.origin)        update.origin        = data.origin.toUpperCase()
  if (data.destination)   update.destination   = data.destination.toUpperCase()
  if (data.departureTime) update.departureTime = new Date(data.departureTime)
  if (data.arrivalTime)   update.arrivalTime   = new Date(data.arrivalTime)
  if (data.duration)      update.duration      = Number(data.duration)
  if (data.price)         update.price         = Number(data.price)
  if (data.totalSeats)    update.totalSeats    = Number(data.totalSeats)
  if (data.availableSeats !== undefined) update.availableSeats = Number(data.availableSeats)
  if (data.cabinClass)    update.cabinClass    = data.cabinClass
  if (data.stops !== undefined) update.stops  = Number(data.stops)
  return prisma.flight.update({ where: { id }, data: update })
}

async function deleteFlight(id) {
  const flight = await prisma.flight.findUnique({ where: { id } })
  if (!flight) { const err = new Error('Flight not found.'); err.status = 404; throw err }
  await prisma.flight.delete({ where: { id } })
}

async function approveFlight(id) {
  const flight = await prisma.flight.findUnique({ where: { id } })
  if (!flight) { const err = new Error('Flight not found.'); err.status = 404; throw err }
  return prisma.flight.update({ where: { id }, data: { status: 'APPROVED', rejectionReason: null } })
}

async function rejectFlight(id, reason) {
  const flight = await prisma.flight.findUnique({ where: { id } })
  if (!flight) { const err = new Error('Flight not found.'); err.status = 404; throw err }
  return prisma.flight.update({ where: { id }, data: { status: 'REJECTED', rejectionReason: reason || null } })
}

module.exports = { searchFlights, getFlightById, listFlights, createFlight, updateFlight, deleteFlight, approveFlight, rejectFlight }
