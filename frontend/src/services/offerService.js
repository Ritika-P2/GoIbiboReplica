import api from './api'
import { API } from '../constants/apiEndpoints'

export const offerService = {
  list:        (params) => api.get(API.OFFERS.LIST, { params }),
  getById:     (id)     => api.get(API.OFFERS.DETAIL(id)),
  getByCategory: (cat) => api.get(API.OFFERS.CATEGORY(cat)),
}
