export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  FLIGHTS: {
    SEARCH: '/flights/search',
    DETAIL: (id) => `/flights/${id}`,
  },
  HOTELS: {
    SEARCH: '/hotels/search',
    DETAIL: (id) => `/hotels/${id}`,
    ROOMS: (id) => `/hotels/${id}/rooms`,
  },
  TRAINS: {
    SEARCH: '/trains/search',
    DETAIL: (id) => `/trains/${id}`,
  },
  BUSES: {
    SEARCH: '/buses/search',
    DETAIL: (id) => `/buses/${id}`,
  },
  CABS: {
    SEARCH: '/cabs/search',
  },
  BOOKINGS: {
    CREATE: '/bookings',
    LIST: '/bookings/my',
    DETAIL: (id) => `/bookings/${id}`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
  },
  PAYMENTS: {
    INITIATE: '/payments/initiate',
    VERIFY: '/payments/verify',
  },
  COUPONS: {
    VALIDATE: '/coupons/validate',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
  },
}
