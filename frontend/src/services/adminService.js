import api from './api'

// ── Flights ──────────────────────────────────────────────────────────────────
export const adminFlightAPI = {
  list:   (params) => api.get('/flights', { params }),
  create: (data)   => api.post('/flights', data),
  update: (id, data) => api.put(`/flights/${id}`, data),
  remove: (id)     => api.delete(`/flights/${id}`),
}

// ── Hotels ────────────────────────────────────────────────────────────────────
export const adminHotelAPI = {
  list:   (params) => api.get('/hotels', { params }),
  create: (data)   => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  remove: (id)     => api.delete(`/hotels/${id}`),
}

// ── Trains ────────────────────────────────────────────────────────────────────
export const adminTrainAPI = {
  list:   (params) => api.get('/trains', { params }),
  create: (data)   => api.post('/trains', data),
  update: (id, data) => api.put(`/trains/${id}`, data),
  remove: (id)     => api.delete(`/trains/${id}`),
}

// ── Buses ─────────────────────────────────────────────────────────────────────
export const adminBusAPI = {
  list:   (params) => api.get('/buses', { params }),
  create: (data)   => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  remove: (id)     => api.delete(`/buses/${id}`),
}

// ── Holiday Packages ──────────────────────────────────────────────────────────
export const adminHolidayAPI = {
  list:   (params) => api.get('/holidays', { params: { ...params, all: true } }),
  create: (data)   => api.post('/holidays', data),
  update: (id, data) => api.put(`/holidays/${id}`, data),
  remove: (id)     => api.delete(`/holidays/${id}`),
}
