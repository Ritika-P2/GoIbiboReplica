import api from './api'
import { API } from '../constants/apiEndpoints'

export const trainService = {
  search:  (params) => api.get(API.TRAINS.SEARCH, { params }),
  getById: (id)     => api.get(API.TRAINS.DETAIL(id)),
}