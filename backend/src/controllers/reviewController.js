const prisma = require('../config/database')
const { successResponse } = require('../utils/apiResponse')

async function createReview(req, res, next) {
  try {
    const { hotelId, rating, comment } = req.body
    if (!hotelId || !rating) {
      return res.status(422).json({ success: false, message: 'hotelId and rating are required.' })
    }
    const review = await prisma.review.create({
      data: { userId: req.user.id, hotelId, rating: Number(rating), comment },
      include: { user: { select: { id: true, name: true } } },
    })
    res.status(201).json(successResponse('Review submitted.', { review }))
  } catch (err) { next(err) }
}

async function getHotelReviews(req, res, next) {
  try {
    const reviews = await prisma.review.findMany({
      where: { hotelId: req.params.hotelId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(successResponse('Reviews fetched.', { reviews }))
  } catch (err) { next(err) }
}

module.exports = { createReview, getHotelReviews }
