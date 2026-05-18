import { createSlice } from '@reduxjs/toolkit'

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    type: null,
    selectedItem: null,
    passengers: [],
    contactInfo: {},
    paymentInfo: {},
    bookingId: null,
    bookings: [],
    loading: false,
    error: null,
  },
  reducers: {
    initBooking(state, action) {
      state.type = action.payload.type
      state.selectedItem = action.payload.item
      state.passengers = []
      state.contactInfo = {}
      state.paymentInfo = {}
      state.bookingId = null
    },
    setPassengers(state, action) { state.passengers = action.payload },
    setContactInfo(state, action) { state.contactInfo = action.payload },
    setPaymentInfo(state, action) { state.paymentInfo = action.payload },
    bookingStart(state) { state.loading = true; state.error = null },
    bookingSuccess(state, action) {
      state.loading = false
      state.bookingId = action.payload.bookingId
    },
    bookingFailure(state, action) { state.loading = false; state.error = action.payload },
    setBookings(state, action) { state.bookings = action.payload },
    clearBooking(state) {
      state.type = null
      state.selectedItem = null
      state.passengers = []
      state.contactInfo = {}
      state.paymentInfo = {}
    },
  },
})

export const { initBooking, setPassengers, setContactInfo, setPaymentInfo, bookingStart, bookingSuccess, bookingFailure, setBookings, clearBooking } = bookingSlice.actions
export default bookingSlice.reducer
