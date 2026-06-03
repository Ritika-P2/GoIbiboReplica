import api from './api'
import { API } from '../constants/apiEndpoints'

export const couponService = {
  validate: (code, amount, bookingType) =>
    api.post(API.COUPONS.VALIDATE, { code, amount, bookingType }),
}
