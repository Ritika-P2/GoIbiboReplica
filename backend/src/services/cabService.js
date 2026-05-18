const prisma = require('../config/database')

async function searchCabs(query) {
  const { type, capacity } = query
  const where = { available: true }
  if (type)     where.type     = { contains: type,            mode: 'insensitive' }
  if (capacity) where.capacity = { gte: Number(capacity) }

  const cabs = await prisma.cab.findMany({ where, orderBy: { basePrice: 'asc' } })
  return cabs
}

module.exports = { searchCabs }
