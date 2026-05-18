import api from './api'
import { API } from '../constants/apiEndpoints'

export const couponService = {
  validate: (code, amount) => api.post(API.COUPONS.VALIDATE, { code, amount }),
}
