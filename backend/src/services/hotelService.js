const prisma = require('../config/database')
const { getPagination, getPaginationMeta } = require('../utils/pagination')

async function searchHotels(query) {
  const { city, checkIn, checkOut, guests, minPrice, maxPrice, starRating } = query
  const { page, limit, skip } = getPagination(query)

  const where = {
    city: { contains: city, mode: 'insensitive' },
    rooms: {
      some: {
        availableRooms: { gt: 0 },
        capacity: { gte: Number(guests) || 1 },
        ...(minPrice || maxPrice ? {
          pricePerNight: {
            ...(minPrice ? { gte: Number(minPrice) } : {}),
            ...(maxPrice ? { lte: Number(maxPrice) } : {}),
          },
        } : {}),
      },
    },
  }

  if (starRating) where.starRating = { gte: Number(starRating) }

  const [total, hotels] = await Promise.all([
    prisma.hotel.count({ where }),
    prisma.hotel.findMany({
      where,
      skip,
      take: limit,
      orderBy: { starRating: 'desc' },
      include: {
        rooms: {
          where: { availableRooms: { gt: 0 } },
          orderBy: { pricePerNight: 'asc' },
          take: 1,
        },
        reviews: { select: { rating: true } },
      },
    }),
  ])

  const hotelsWithRating = hotels.map((h) => {
    const avgRating = h.reviews.length
      ? (h.reviews.reduce((s, r) => s + r.rating, 0) / h.reviews.length).toFixed(1)
      : null
    const { reviews, ...rest } = h
    return { ...rest, avgRating: avgRating ? Number(avgRating) : null, reviewCount: reviews.length }
  })

  return { hotels: hotelsWithRating, meta: getPaginationMeta(total, page, limit) }
}

async function getHotelById(id) {
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: {
      rooms: { orderBy: { pricePerNight: 'asc' } },
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
  if (!hotel) {
    const err = new Error('Hotel not found.')
    err.status = 404
    throw err
  }

  const avgRating = hotel.reviews.length
    ? (hotel.reviews.reduce((s, r) => s + r.rating, 0) / hotel.reviews.length).toFixed(1)
    : null

  return { ...hotel, avgRating: avgRating ? Number(avgRating) : null }
}

async function getHotelRooms(hotelId, query) {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } })
  if (!hotel) {
    const err = new Error('Hotel not found.')
    err.status = 404
    throw err
  }

  const where = { hotelId, availableRooms: { gt: 0 } }
  if (query.capacity) where.capacity = { gte: Number(query.capacity) }

  const rooms = await prisma.room.findMany({ where, orderBy: { pricePerNight: 'asc' } })
  return rooms
}

async function listHotels(query) {
  const { page, limit, skip } = getPagination(query)
  const [total, hotels] = await Promise.all([
    prisma.hotel.count(),
    prisma.hotel.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { rooms: true } }),
  ])
  return { hotels, meta: getPaginationMeta(total, page, limit) }
}

async function createHotel(data) {
  const { rooms = [], ...hotelData } = data
  const splitCSV = (v) => Array.isArray(v) ? v : (v || '').split(',').map(s => s.trim()).filter(Boolean)
  return prisma.hotel.create({
    data: {
      name:        hotelData.name,
      description: hotelData.description || null,
      city:        hotelData.city,
      address:     hotelData.address,
      starRating:  Number(hotelData.starRating),
      amenities:   splitCSV(hotelData.amenities),
      images:      splitCSV(hotelData.images),
      rooms: {
        create: rooms.map(r => ({
          type:           r.type,
          description:    r.description || null,
          pricePerNight:  Number(r.pricePerNight),
          capacity:       Number(r.capacity),
          totalRooms:     Number(r.totalRooms),
          availableRooms: Number(r.totalRooms),
          amenities:      splitCSV(r.amenities),
          images:         splitCSV(r.images),
        })),
      },
    },
    include: { rooms: true },
  })
}

async function updateHotel(id, data) {
  const hotel = await prisma.hotel.findUnique({ where: { id } })
  if (!hotel) { const err = new Error('Hotel not found.'); err.status = 404; throw err }
  const splitCSV = (v) => Array.isArray(v) ? v : v.split(',').map(s => s.trim()).filter(Boolean)
  const update = {}
  if (data.name !== undefined)        update.name        = data.name
  if (data.description !== undefined) update.description = data.description
  if (data.city !== undefined)        update.city        = data.city
  if (data.address !== undefined)     update.address     = data.address
  if (data.starRating !== undefined)  update.starRating  = Number(data.starRating)
  if (data.amenities !== undefined)   update.amenities   = splitCSV(data.amenities)
  if (data.images !== undefined)      update.images      = splitCSV(data.images)
  return prisma.hotel.update({ where: { id }, data: update })
}

async function deleteHotel(id) {
  const hotel = await prisma.hotel.findUnique({ where: { id } })
  if (!hotel) { const err = new Error('Hotel not found.'); err.status = 404; throw err }
  await prisma.hotel.delete({ where: { id } })
}

module.exports = { searchHotels, getHotelById, getHotelRooms, listHotels, createHotel, updateHotel, deleteHotel }
