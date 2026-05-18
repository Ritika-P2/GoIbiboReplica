import api from './api'
import { API } from '../constants/apiEndpoints'

export const busService = {
  search:  (params) => api.get(API.BUSES.SEARCH, { params }),
  getById: (id)     => api.get(API.BUSES.DETAIL(id)),
}