import { createSlice } from '@reduxjs/toolkit'

const trainSlice = createSlice({
  name: 'trains',
  initialState: {
    searchParams: {},
    results: [],
    selectedTrain: null,
    filters: { classes: [], quota: '' },
    loading: false,
    error: null,
  },
  reducers: {
    setSearchParams(state, action) { state.searchParams = action.payload },
    fetchTrainsStart(state) { state.loading = true; state.error = null },
    fetchTrainsSuccess(state, action) { state.loading = false; state.results = action.payload },
    fetchTrainsFailure(state, action) { state.loading = false; state.error = action.payload },
    selectTrain(state, action) { state.selectedTrain = action.payload },
    setFilters(state, action) { state.filters = { ...state.filters, ...action.payload } },
    clearTrains(state) { state.results = []; state.selectedTrain = null },
  },
})

export const { setSearchParams, fetchTrainsStart, fetchTrainsSuccess, fetchTrainsFailure, selectTrain, setFilters, clearTrains } = trainSlice.actions
export default trainSlice.reducer
