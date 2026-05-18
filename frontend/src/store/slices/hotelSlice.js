import { createSlice } from '@reduxjs/toolkit'

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    searchParams: {},
    results: [],
    selectedHotel: null,
    filters: { starRating: [], priceRange: [0, 50000], amenities: [] },
    loading: false,
    error: null,
  },
  reducers: {
    setSearchParams(state, action) { state.searchParams = action.payload },
    fetchHotelsStart(state) { state.loading = true; state.error = null },
    fetchHotelsSuccess(state, action) { state.loading = false; state.results = action.payload },
    fetchHotelsFailure(state, action) { state.loading = false; state.error = action.payload },
    selectHotel(state, action) { state.selectedHotel = action.payload },
    setFilters(state, action) { state.filters = { ...state.filters, ...action.payload } },
    clearHotels(state) { state.results = []; state.selectedHotel = null },
  },
})

export const { setSearchParams, fetchHotelsStart, fetchHotelsSuccess, fetchHotelsFailure, selectHotel, setFilters, clearHotels } = hotelSlice.actions
export default hotelSlice.reducer
