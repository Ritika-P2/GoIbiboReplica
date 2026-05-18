import api from './api'
import { API } from '../constants/apiEndpoints'

export const authService = {
  register: (data) => api.post(API.AUTH.REGISTER, data),
  login:    (data) => api.post(API.AUTH.LOGIN, data),
  getMe:    ()     => api.get(API.AUTH.ME),
  logout:   ()     => api.post(API.AUTH.LOGOUT),
}