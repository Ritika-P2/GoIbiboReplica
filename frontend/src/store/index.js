import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import flightReducer from './slices/flightSlice'
import hotelReducer from './slices/hotelSlice'
import trainReducer from './slices/trainSlice'
import busReducer from './slices/busSlice'
import bookingReducer from './slices/bookingSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    flights: flightReducer,
    hotels: hotelReducer,
    trains: trainReducer,
    buses: busReducer,
    booking: bookingReducer,
  },
})
