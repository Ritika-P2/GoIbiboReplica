import { createSlice } from '@reduxjs/toolkit'

const busSlice = createSlice({
  name: 'buses',
  initialState: {
    searchParams: {},
    results: [],
    selectedBus: null,
    filters: { busType: [], operators: [] },
    loading: false,
    error: null,
  },
  reducers: {
    setSearchParams(state, action) { state.searchParams = action.payload },
    fetchBusesStart(state) { state.loading = true; state.error = null },
    fetchBusesSuccess(state, action) { state.loading = false; state.results = action.payload },
    fetchBusesFailure(state, action) { state.loading = false; state.error = action.payload },
    selectBus(state, action) { state.selectedBus = action.payload },
    setFilters(state, action) { state.filters = { ...state.filters, ...action.payload } },
    clearBuses(state) { state.results = []; state.selectedBus = null },
  },
})

export const { setSearchParams, fetchBusesStart, fetchBusesSuccess, fetchBusesFailure, selectBus, setFilters, clearBuses } = busSlice.actions
export default busSlice.reducer
