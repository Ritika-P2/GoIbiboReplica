import api from './api'
import { API } from '../constants/apiEndpoints'

export const hotelService = {
  search:   (params) => api.get(API.HOTELS.SEARCH, { params }),
  getById:  (id)     => api.get(API.HOTELS.DETAIL(id)),
  getRooms: (id, params) => api.get(API.HOTELS.ROOMS(id), { params }),
}