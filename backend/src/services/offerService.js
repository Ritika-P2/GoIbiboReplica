const prisma = require('../config/database')
const { getPagination, getPaginationMeta } = require('../utils/pagination')

async function listOffers(query) {
  const { page, limit, skip } = getPagination(query)
  const where = { isActive: true }
  if (query.category) where.category = query.category.toUpperCase()

  const [total, offers] = await Promise.all([
    prisma.offer.count({ where }),
    prisma.offer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'asc' } }),
  ])
  return { offers, meta: getPaginationMeta(total, page, limit) }
}

async function getOfferById(id) {
  const offer = await prisma.offer.findUnique({ where: { id } })
  if (!offer) { const err = new Error('Offer not found.'); err.status = 404; throw err }
  return offer
}

async function getOffersByCategory(category) {
  const offers = await prisma.offer.findMany({
    where: { isActive: true, category: category.toUpperCase() },
    orderBy: { createdAt: 'asc' },
  })
  return offers
}

module.exports = { listOffers, getOfferById, getOffersByCategory }
