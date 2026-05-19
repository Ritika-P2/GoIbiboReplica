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
    status:         'APPROVED',
    origin:         { contains: origin,      mode: 'insensitive' },
    destination:    { contains: destination, mode: 'insensitive' },
    departureTime:  { gte: startOfDay, lte: endOfDay },
    availableSeats: { gt: 0 },
  }

  const [total, trains] = await Promise.all([
    prisma.train.count({ where }),
    prisma.train.findMany({ where, skip, take: limit, orderBy: { departureTime: 'asc' } }),
  ])

  const filtered = trainClass
    ? trains.filter((t) => t.classes && t.classes[trainClass])
    : trains

  return { trains: filtered, meta: getPaginationMeta(total, page, limit) }
}

async function getTrainById(id) {
  const train = await prisma.train.findUnique({ where: { id } })
  if (!train) { const err = new Error('Train not found.'); err.status = 404; throw err }
  return train
}

async function listTrains(query) {
  const { page, limit, skip } = getPagination(query)
  const where = query.status ? { status: query.status } : {}
  const [total, trains] = await Promise.all([
    prisma.train.count({ where }),
    prisma.train.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  ])
  return { trains, meta: getPaginationMeta(total, page, limit) }
}

async function createTrain(data) {
  return prisma.train.create({
    data: {
      trainNumber:    data.trainNumber,
      trainName:      data.trainName,
      origin:         data.origin,
      destination:    data.destination,
      departureTime:  new Date(data.departureTime),
      arrivalTime:    new Date(data.arrivalTime),
      duration:       Number(data.duration),
      classes:        typeof data.classes === 'string' ? JSON.parse(data.classes) : data.classes,
      totalSeats:     Number(data.totalSeats),
      availableSeats: Number(data.availableSeats),
      status:         'PENDING',
    },
  })
}

async function updateTrain(id, data) {
  const train = await prisma.train.findUnique({ where: { id } })
  if (!train) { const err = new Error('Train not found.'); err.status = 404; throw err }
  const update = {}
  if (data.trainNumber !== undefined)    update.trainNumber    = data.trainNumber
  if (data.trainName !== undefined)      update.trainName      = data.trainName
  if (data.origin !== undefined)         update.origin         = data.origin
  if (data.destination !== undefined)    update.destination    = data.destination
  if (data.departureTime !== undefined)  update.departureTime  = new Date(data.departureTime)
  if (data.arrivalTime !== undefined)    update.arrivalTime    = new Date(data.arrivalTime)
  if (data.duration !== undefined)       update.duration       = Number(data.duration)
  if (data.classes !== undefined)        update.classes        = typeof data.classes === 'string' ? JSON.parse(data.classes) : data.classes
  if (data.totalSeats !== undefined)     update.totalSeats     = Number(data.totalSeats)
  if (data.availableSeats !== undefined) update.availableSeats = Number(data.availableSeats)
  return prisma.train.update({ where: { id }, data: update })
}

async function deleteTrain(id) {
  const train = await prisma.train.findUnique({ where: { id } })
  if (!train) { const err = new Error('Train not found.'); err.status = 404; throw err }
  await prisma.train.delete({ where: { id } })
}

async function approveTrain(id) {
  const train = await prisma.train.findUnique({ where: { id } })
  if (!train) { const err = new Error('Train not found.'); err.status = 404; throw err }
  return prisma.train.update({ where: { id }, data: { status: 'APPROVED', rejectionReason: null } })
}

async function rejectTrain(id, reason) {
  const train = await prisma.train.findUnique({ where: { id } })
  if (!train) { const err = new Error('Train not found.'); err.status = 404; throw err }
  return prisma.train.update({ where: { id }, data: { status: 'REJECTED', rejectionReason: reason || null } })
}

module.exports = { searchTrains, getTrainById, listTrains, createTrain, updateTrain, deleteTrain, approveTrain, rejectTrain }
