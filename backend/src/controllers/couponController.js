const { successResponse, errorResponse } = require('../utils/apiResponse')

const COUPONS = {
  QUICK20:   { type: 'percent', value: 20, description: '20% flat discount on your booking', minAmount: 0 },
  GOIBIBO10: { type: 'percent', value: 10, description: '10% discount for Goibibo members',  minAmount: 0 },
  FLAT500:   { type: 'flat',    value: 500, description: '₹500 off on bookings above ₹2,000', minAmount: 2000 },
  FIRSTTRIP: { type: 'percent', value: 15, description: '15% off on your first holiday booking', minAmount: 5000 },
  SUMMER30:  { type: 'percent', value: 30, description: '30% summer special discount', minAmount: 15000 },
}

function validateCoupon(req, res, next) {
  try {
    const { code, amount } = req.body
    if (!code) {
      return res.status(400).json(errorResponse('Coupon code is required.'))
    }

    const coupon = COUPONS[code.toUpperCase().trim()]
    if (!coupon) {
      return res.status(404).json(errorResponse('Invalid coupon code. Please check and try again.'))
    }

    if (Number(amount) < coupon.minAmount) {
      return res.status(400).json(
        errorResponse(`This coupon requires a minimum booking amount of ₹${coupon.minAmount.toLocaleString('en-IN')}.`)
      )
    }

    const discount = coupon.type === 'percent'
      ? Math.round(Number(amount) * coupon.value / 100)
      : Math.min(coupon.value, Number(amount))

    res.json(successResponse('Coupon applied successfully!', {
      code:        code.toUpperCase().trim(),
      discount,
      description: coupon.description,
      type:        coupon.type,
      value:       coupon.value,
    }))
  } catch (err) { next(err) }
}

module.exports = { validateCoupon }
