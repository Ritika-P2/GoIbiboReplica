import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { trainService } from '../services/trainService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'
import TrainSearch from '../components/trains/TrainSearch'
import TrainCard from '../components/trains/TrainCard'
import TrainFilters from '../components/trains/TrainFilters'

const SORT_TABS = [
  { id: 'departure',   label: 'DEPARTURE',   icon: '🕐' },
  { id: 'arrival',     label: 'ARRIVAL',     icon: '🕔' },
  { id: 'duration',    label: 'DURATION',    icon: '⏱️' },
  { id: 'availability',label: 'AVAILABILITY',icon: '💺' },
]

const QUOTA_LABELS = {
  GN: 'General', LD: 'Ladies', TQ: 'Tatkal', PT: 'Premium Tatkal', SS: 'Senior Citizen', HH: 'Divyaang'
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function TrainResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()

  const origin      = searchParams.get('origin')      || ''
  const destination = searchParams.get('destination') || ''
  const date        = searchParams.get('date')        || ''
  const trainClass  = searchParams.get('trainClass')  || ''
  const quota       = searchParams.get('quota')       || 'GN'

  const [trains,     setTrains]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [sortBy,     setSortBy]     = useState('departure')
  const [filters,    setFilters]    = useState({ departureRange: '', trainTypes: [], availability: '' })
  const [showSearch, setShowSearch] = useState(false)

  const fetchTrains = useCallback(async () => {
    if (!origin || !destination || !date) return
    setLoading(true)
    setError(null)
    try {
      const res = await trainService.search({ origin, destination, date, ...(trainClass ? { trainClass } : {}) })
      setTrains(res.data.trains || [])
    } catch {
      setError('Failed to fetch trains. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [origin, destination, date, trainClass])

  useEffect(() => { fetchTrains() }, [fetchTrains])

  // Client-side filtering
  const filtered = trains.filter(t => {
    if (filters.departureRange) {
      const h = new Date(t.departureTime).getHours()
      if (filters.departureRange === 'early'     && !(h >= 0  && h < 6))  return false
      if (filters.departureRange === 'morning'   && !(h >= 6  && h < 12)) return false
      if (filters.departureRange === 'afternoon' && !(h >= 12 && h < 18)) return false
      if (filters.departureRange === 'evening'   && !(h >= 18))           return false
    }
    if (filters.trainTypes?.length > 0) {
      const name = t.trainName?.toLowerCase() || ''
      const match = filters.trainTypes.some(type => {
        if (type === 'rajdhani')  return name.includes('rajdhani')
        if (type === 'shatabdi')  return name.includes('shatabdi')
        if (type === 'express')   return name.includes('express')
        if (type === 'superfast') return name.includes('superfast') || name.includes('sf')
        return false
      })
      if (!match) return false
    }
    if (filters.availability) {
      const seats = t.availableSeats || 0
      if (filters.availability === 'available' && seats <= 0) return false
      if (filters.availability === 'rac'       && seats > 0)  return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'departure')    return new Date(a.departureTime) - new Date(b.departureTime)
    if (sortBy === 'arrival')      return new Date(a.arrivalTime)   - new Date(b.arrivalTime)
    if (sortBy === 'duration')     return a.duration - b.duration
    if (sortBy === 'availability') return (b.availableSeats || 0) - (a.availableSeats || 0)
    return 0
  })

  if (!origin || !destination || !date) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🚆</div>
        <h2 className="text-xl font-semibold text-gray-700">No search criteria</h2>
        <p className="text-gray-400 mt-2 mb-6">Please enter your journey details.</p>
        <button onClick={() => navigate(ROUTES.TRAINS)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full">
          Search Trains
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sticky orange header */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {!showSearch ? (
            <button onClick={() => setShowSearch(true)}
              className="w-full bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-white text-left transition-colors">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-lg">🚆 {origin} → {destination}</span>
                <span className="text-orange-100 text-sm">|</span>
                <span className="text-orange-100 text-sm">{fmtDate(date)}</span>
                {trainClass && (
                  <>
                    <span className="text-orange-100 text-sm">|</span>
                    <span className="text-orange-100 text-sm">{trainClass}</span>
                  </>
                )}
                <span className="text-orange-100 text-sm">|</span>
                <span className="text-orange-100 text-sm">{QUOTA_LABELS[quota] || quota}</span>
                <span className="ml-auto text-xs underline text-orange-100">Modify Search ▼</span>
              </div>
            </button>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Modify Search</h3>
                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <TrainSearch
                initialValues={{ origin, destination, date, trainClass, quota }}
                onSearch={() => setShowSearch(false)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-4">

          {/* Sidebar filters */}
          <aside className="hidden lg:block w-56 shrink-0">
            <TrainFilters filters={filters} onChange={setFilters} />
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Sort tabs */}
            {!loading && trains.length > 0 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex">
                    {SORT_TABS.map(tab => (
                      <button key={tab.id} onClick={() => setSortBy(tab.id)}
                        className={`flex-1 flex flex-col items-center py-3 px-2 border-b-2 text-xs transition-colors ${
                          sortBy === tab.id
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-transparent text-gray-500 hover:bg-gray-50'
                        }`}>
                        <span className="font-bold text-xs uppercase tracking-wide">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{sorted.length}</span> trains found
                    {filtered.length !== trains.length && (
                      <span className="text-orange-500 ml-1">(filtered from {trains.length})</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{fmtDate(date)}</p>
                </div>
              </>
            )}

            {loading && <Loader text="Searching trains..." />}

            {!loading && error && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="text-red-500 text-lg">{error}</p>
                <button onClick={fetchTrains} className="mt-4 text-orange-500 hover:underline text-sm">Try again</button>
              </div>
            )}

            {!loading && !error && sorted.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">🚆</div>
                <h2 className="text-xl font-semibold text-gray-700">No trains found</h2>
                <p className="text-gray-400 mt-2">Try a different date or adjust your filters.</p>
              </div>
            )}

            {!loading && !error && sorted.map(train => (
              <TrainCard key={train.id} train={train} date={date} quota={quota} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
