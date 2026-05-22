import api from './api'
import { API } from '../constants/apiEndpoints'

export const bookingService = {
  create:         (data) => api.post(API.BOOKINGS.CREATE, data),
  getMyList:      (params) => api.get(API.BOOKINGS.LIST, { params }),
  getById:        (id) => api.get(API.BOOKINGS.DETAIL(id)),
  cancel:         (id) => api.patch(API.BOOKINGS.CANCEL(id)),
  confirmPayment: (id, data = {}) => api.post(API.BOOKINGS.CONFIRM_PAYMENT(id), data),
}