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
    status:        'APPROVED',
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

async function listBuses(query) {
  const { page, limit, skip } = getPagination(query)
  const where = query.status ? { status: query.status } : {}
  const [total, buses] = await Promise.all([
    prisma.bus.count({ where }),
    prisma.bus.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  ])
  return { buses, meta: getPaginationMeta(total, page, limit) }
}

async function createBus(data) {
  const splitCSV = (v) => Array.isArray(v) ? v : (v || '').split(',').map(s => s.trim()).filter(Boolean)
  return prisma.bus.create({
    data: {
      operator:       data.operator,
      busType:        data.busType,
      origin:         data.origin,
      destination:    data.destination,
      departureTime:  new Date(data.departureTime),
      arrivalTime:    new Date(data.arrivalTime),
      duration:       Number(data.duration),
      price:          Number(data.price),
      totalSeats:     Number(data.totalSeats),
      availableSeats: Number(data.availableSeats),
      amenities:      splitCSV(data.amenities),
      status:         'PENDING',
    },
  })
}

async function updateBus(id, data) {
  const bus = await prisma.bus.findUnique({ where: { id } })
  if (!bus) { const err = new Error('Bus not found.'); err.status = 404; throw err }
  const splitCSV = (v) => Array.isArray(v) ? v : v.split(',').map(s => s.trim()).filter(Boolean)
  const update = {}
  if (data.operator !== undefined)       update.operator       = data.operator
  if (data.busType !== undefined)        update.busType        = data.busType
  if (data.origin !== undefined)         update.origin         = data.origin
  if (data.destination !== undefined)    update.destination    = data.destination
  if (data.departureTime !== undefined)  update.departureTime  = new Date(data.departureTime)
  if (data.arrivalTime !== undefined)    update.arrivalTime    = new Date(data.arrivalTime)
  if (data.duration !== undefined)       update.duration       = Number(data.duration)
  if (data.price !== undefined)          update.price          = Number(data.price)
  if (data.totalSeats !== undefined)     update.totalSeats     = Number(data.totalSeats)
  if (data.availableSeats !== undefined) update.availableSeats = Number(data.availableSeats)
  if (data.amenities !== undefined)      update.amenities      = splitCSV(data.amenities)
  return prisma.bus.update({ where: { id }, data: update })
}

async function deleteBus(id) {
  const bus = await prisma.bus.findUnique({ where: { id } })
  if (!bus) { const err = new Error('Bus not found.'); err.status = 404; throw err }
  await prisma.bus.delete({ where: { id } })
}

async function approveBus(id) {
  const bus = await prisma.bus.findUnique({ where: { id } })
  if (!bus) { const err = new Error('Bus not found.'); err.status = 404; throw err }
  return prisma.bus.update({ where: { id }, data: { status: 'APPROVED', rejectionReason: null } })
}

async function rejectBus(id, reason) {
  const bus = await prisma.bus.findUnique({ where: { id } })
  if (!bus) { const err = new Error('Bus not found.'); err.status = 404; throw err }
  return prisma.bus.update({ where: { id }, data: { status: 'REJECTED', rejectionReason: reason || null } })
}

module.exports = { searchBuses, getBusById, listBuses, createBus, updateBus, deleteBus, approveBus, rejectBus }
