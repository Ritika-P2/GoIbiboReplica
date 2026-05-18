import { createSlice } from '@reduxjs/toolkit'

const flightSlice = createSlice({
  name: 'flights',
  initialState: {
    searchParams: {},
    results: [],
    selectedFlight: null,
    filters: { stops: [], airlines: [], priceRange: [0, 100000] },
    loading: false,
    error: null,
  },
  reducers: {
    setSearchParams(state, action) { state.searchParams = action.payload },
    fetchFlightsStart(state) { state.loading = true; state.error = null },
    fetchFlightsSuccess(state, action) { state.loading = false; state.results = action.payload },
    fetchFlightsFailure(state, action) { state.loading = false; state.error = action.payload },
    selectFlight(state, action) { state.selectedFlight = action.payload },
    setFilters(state, action) { state.filters = { ...state.filters, ...action.payload } },
    clearFlights(state) { state.results = []; state.selectedFlight = null },
  },
})

export const { setSearchParams, fetchFlightsStart, fetchFlightsSuccess, fetchFlightsFailure, selectFlight, setFilters, clearFlights } = flightSlice.actions
export default flightSlice.reducer
