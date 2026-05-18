import api from './api'
import { API } from '../constants/apiEndpoints'

export const flightService = {
  search: (params) => api.get(API.FLIGHTS.SEARCH, { params }),
  getById: (id)   => api.get(API.FLIGHTS.DETAIL(id)),
}