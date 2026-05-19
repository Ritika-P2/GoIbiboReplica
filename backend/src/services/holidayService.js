const prisma = require('../config/database')
const { getPagination, getPaginationMeta } = require('../utils/pagination')

async function listPackages(query) {
  const { page, limit, skip } = getPagination(query)
  let where
  if (query.status) {
    where = { status: query.status }
  } else if (query.all) {
    where = {}
  } else {
    where = { isActive: true, status: 'APPROVED' }
  }
  const [total, packages] = await Promise.all([
    prisma.holidayPackage.count({ where }),
    prisma.holidayPackage.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  ])
  return { packages, meta: getPaginationMeta(total, page, limit) }
}

async function getPackageById(id) {
  const pkg = await prisma.holidayPackage.findUnique({ where: { id } })
  if (!pkg) { const err = new Error('Package not found.'); err.status = 404; throw err }
  return pkg
}

async function createPackage(data) {
  const splitCSV = (v) => Array.isArray(v) ? v : (v || '').split(',').map(s => s.trim()).filter(Boolean)
  return prisma.holidayPackage.create({
    data: {
      title:         data.title,
      description:   data.description || null,
      duration:      Number(data.duration),
      price:         Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      city:          data.city,
      images:        splitCSV(data.images),
      tags:          splitCSV(data.tags),
      highlights:    splitCSV(data.highlights),
      isActive:      data.isActive !== false,
      status:        'PENDING',
    },
  })
}

async function updatePackage(id, data) {
  const pkg = await prisma.holidayPackage.findUnique({ where: { id } })
  if (!pkg) { const err = new Error('Package not found.'); err.status = 404; throw err }
  const splitCSV = (v) => Array.isArray(v) ? v : v.split(',').map(s => s.trim()).filter(Boolean)
  const update = {}
  if (data.title !== undefined)         update.title         = data.title
  if (data.description !== undefined)   update.description   = data.description
  if (data.duration !== undefined)      update.duration      = Number(data.duration)
  if (data.price !== undefined)         update.price         = Number(data.price)
  if (data.originalPrice !== undefined) update.originalPrice = data.originalPrice ? Number(data.originalPrice) : null
  if (data.city !== undefined)          update.city          = data.city
  if (data.images !== undefined)        update.images        = splitCSV(data.images)
  if (data.tags !== undefined)          update.tags          = splitCSV(data.tags)
  if (data.highlights !== undefined)    update.highlights    = splitCSV(data.highlights)
  if (data.isActive !== undefined)      update.isActive      = Boolean(data.isActive)
  return prisma.holidayPackage.update({ where: { id }, data: update })
}

async function deletePackage(id) {
  const pkg = await prisma.holidayPackage.findUnique({ where: { id } })
  if (!pkg) { const err = new Error('Package not found.'); err.status = 404; throw err }
  await prisma.holidayPackage.delete({ where: { id } })
}

async function approvePackage(id) {
  const pkg = await prisma.holidayPackage.findUnique({ where: { id } })
  if (!pkg) { const err = new Error('Package not found.'); err.status = 404; throw err }
  return prisma.holidayPackage.update({ where: { id }, data: { status: 'APPROVED', rejectionReason: null } })
}

async function rejectPackage(id, reason) {
  const pkg = await prisma.holidayPackage.findUnique({ where: { id } })
  if (!pkg) { const err = new Error('Package not found.'); err.status = 404; throw err }
  return prisma.holidayPackage.update({ where: { id }, data: { status: 'REJECTED', rejectionReason: reason || null } })
}

module.exports = { listPackages, getPackageById, createPackage, updatePackage, deletePackage, approvePackage, rejectPackage }
