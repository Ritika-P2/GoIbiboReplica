const prisma = require('../config/database')
const logger  = require('../config/logger')
const { successResponse, errorResponse } = require('../utils/apiResponse')

// Hardcoded fallback codes shown as suggestions in the UI — valid on all booking types.
// These are never deleted; they act as universal promo codes independent of the offers DB.
const FALLBACK_COUPONS = {
  QUICK20:   { type: 'percent', value: 20,  description: '20% flat discount on your booking',      minAmount: 0 },
  GOIBIBO10: { type: 'percent', value: 10,  description: '10% discount for Goibibo members',       minAmount: 0 },
  FLAT500:   { type: 'flat',    value: 500, description: '₹500 off on bookings above ₹2,000',     minAmount: 2000 },
  FIRSTTRIP: { type: 'percent', value: 15,  description: '15% off on your first booking',          minAmount: 5000 },
  SUMMER30:  { type: 'percent', value: 30,  description: '30% summer special discount',            minAmount: 15000 },
}

// Which offer categories are valid for each booking type.
// BANK offers are cross-type (bank discounts apply everywhere).
const VALID_CATEGORIES_FOR = {
  FLIGHTS:  ['FLIGHTS', 'BANK'],
  HOTELS:   ['HOTELS',  'BANK'],
  TRAINS:   ['TRAINS',  'BANK'],
  BUS:      ['BUS',     'BANK'],
  HOLIDAYS: ['FLIGHTS', 'HOTELS', 'TRAINS', 'BUS', 'BANK'],
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function validateCoupon(req, res, next) {
  try {
    const { code, amount, bookingType } = req.body
    const normalizedCode = (code || '').trim().toUpperCase()
    const bookingAmount  = Number(amount) || 0

    logger.info(`Coupon validation — code: "${normalizedCode}", amount: ${bookingAmount}, bookingType: ${bookingType || 'not specified'}`)

    if (!normalizedCode) {
      return res.status(400).json(errorResponse('Offer code is required.'))
    }

    // ── 1. Query the offers table first (case-insensitive lookup) ─────────────
    const offer = await prisma.offer.findFirst({
      where: { offerCode: { equals: normalizedCode, mode: 'insensitive' } },
    })

    if (offer) {
      // Active check
      if (!offer.isActive) {
        logger.info(`Offer "${normalizedCode}" is inactive`)
        return res.status(400).json(errorResponse('This offer is no longer active.'))
      }

      // Date range checks
      const now = new Date()
      if (now < new Date(offer.validFrom)) {
        logger.info(`Offer "${normalizedCode}" not yet valid (starts ${fmtDate(offer.validFrom)})`)
        return res.status(400).json(errorResponse(
          `This offer is not valid yet. It becomes active on ${fmtDate(offer.validFrom)}.`
        ))
      }
      if (now > new Date(offer.validTo)) {
        logger.info(`Offer "${normalizedCode}" expired on ${fmtDate(offer.validTo)}`)
        return res.status(400).json(errorResponse(
          `This offer expired on ${fmtDate(offer.validTo)}.`
        ))
      }

      // Category / booking-type check
      if (bookingType) {
        const allowedCategories = VALID_CATEGORIES_FOR[bookingType.toUpperCase()] || []
        if (!allowedCategories.includes(offer.category)) {
          const offerType = offer.category.charAt(0) + offer.category.slice(1).toLowerCase()
          const bType     = bookingType.charAt(0) + bookingType.slice(1).toLowerCase()
          logger.info(`Offer "${normalizedCode}" (${offer.category}) not applicable for ${bookingType}`)
          return res.status(400).json(errorResponse(
            `This offer is for ${offerType} bookings and cannot be applied to ${bType} bookings.`
          ))
        }
      }

      // Discount = min(amount × percent, maxDiscountAmount)
      const maxDiscount = Number(offer.maxDiscountAmount)
      const discount    = Math.min(
        Math.round(bookingAmount * offer.discountPercent / 100),
        maxDiscount
      )

      logger.info(`Offer "${normalizedCode}" valid — discount: ₹${discount}`)

      return res.json(successResponse('Offer applied successfully!', {
        code:        normalizedCode,
        discount,
        description: `${offer.discountPercent}% off — up to ₹${maxDiscount.toLocaleString('en-IN')} savings`,
        type:        'percent',
        value:       offer.discountPercent,
        maxDiscount,
        category:    offer.category,
      }))
    }

    // ── 2. Fallback: hardcoded universal promo codes ───────────────────────────
    const fallback = FALLBACK_COUPONS[normalizedCode]
    if (fallback) {
      if (bookingAmount < fallback.minAmount) {
        return res.status(400).json(
          errorResponse(`This coupon requires a minimum booking amount of ₹${fallback.minAmount.toLocaleString('en-IN')}.`)
        )
      }

      const discount = fallback.type === 'percent'
        ? Math.round(bookingAmount * fallback.value / 100)
        : Math.min(fallback.value, bookingAmount)

      logger.info(`Fallback coupon "${normalizedCode}" applied — discount: ₹${discount}`)

      return res.json(successResponse('Coupon applied successfully!', {
        code:        normalizedCode,
        discount,
        description: fallback.description,
        type:        fallback.type,
        value:       fallback.value,
      }))
    }

    // ── 3. Not found anywhere ─────────────────────────────────────────────────
    logger.info(`Offer code "${normalizedCode}" not found in DB or fallback list`)
    return res.status(404).json(errorResponse(
      'Offer code not found. Please check the code and try again.'
    ))

  } catch (err) { next(err) }
}

module.exports = { validateCoupon }
