const offerService = require('../services/offerService')
const { successResponse } = require('../utils/apiResponse')

async function listOffers(req, res, next) {
  try {
    const { offers, meta } = await offerService.listOffers(req.query)
    res.json(successResponse('Offers fetched.', { offers }, meta))
  } catch (err) { next(err) }
}

async function getOfferById(req, res, next) {
  try {
    const offer = await offerService.getOfferById(req.params.id)
    res.json(successResponse('Offer fetched.', { offer }))
  } catch (err) { next(err) }
}

async function getOffersByCategory(req, res, next) {
  try {
    const offers = await offerService.getOffersByCategory(req.params.category)
    res.json(successResponse('Offers fetched.', { offers }))
  } catch (err) { next(err) }
}

module.exports = { listOffers, getOfferById, getOffersByCategory }
