import api from './api'
import { API } from '../constants/apiEndpoints'

export const holidayService = {
  list:    (params) => api.get(API.HOLIDAYS.LIST, { params }),
  getById: (id)     => api.get(API.HOLIDAYS.DETAIL(id)),
}
