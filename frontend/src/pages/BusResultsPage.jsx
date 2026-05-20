import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { busService } from '../services/busService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'
import BusSearch from '../components/buses/BusSearch'
import BusCard from '../components/buses/BusCard'
import BusFilters from '../components/buses/BusFilters'

const SORT_TABS = [
  { id: 'departure', label: 'DEPARTURE', icon: '🕐' },
  { id: 'duration',  label: 'DURATION',  icon: '⏱️' },
  { id: 'price',     label: 'PRICE',     icon: '💰' },
  { id: 'seats',     label: 'SEATS',     icon: '💺' },
]

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function BusResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()

  const origin      = searchParams.get('origin')      || ''
  const destination = searchParams.get('destination') || ''
  const date        = searchParams.get('date')        || ''
  const busType     = searchParams.get('busType')     || ''

  const [buses,      setBuses]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [sortBy,     setSortBy]     = useState('departure')
  const [filters,    setFilters]    = useState({ departureRange: '', busTypes: [], operators: [], amenities: [], availability: '' })
  const [showSearch, setShowSearch] = useState(false)

  const fetchBuses = useCallback(async () => {
    if (!origin || !destination || !date) return
    setLoading(true)
    setError(null)
    try {
      const params = { origin, destination, date, ...(busType ? { busType } : {}) }
      const res = await busService.search(params)
      setBuses(res.data?.buses || [])
    } catch {
      setError('Failed to fetch buses. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [origin, destination, date, busType])

  useEffect(() => { fetchBuses() }, [fetchBuses])

  // Extract unique operators from results for filter
  const allOperators = useMemo(() => [...new Set(buses.map(b => b.operator))].sort(), [buses])

  // Client-side filtering
  const filtered = buses.filter(b => {
    if (filters.departureRange) {
      const h = new Date(b.departureTime).getHours()
      if (filters.departureRange === 'early'     && !(h >= 0  && h < 6))  return false
      if (filters.departureRange === 'morning'   && !(h >= 6  && h < 12)) return false
      if (filters.departureRange === 'afternoon' && !(h >= 12 && h < 18)) return false
      if (filters.departureRange === 'evening'   && !(h >= 18))           return false
    }
    if (filters.busTypes?.length > 0) {
      const bt = b.busType?.toLowerCase() || ''
      const match = filters.busTypes.some(type => {
        if (type === 'ac_sleeper')     return bt.includes('ac') && bt.includes('sleeper')
        if (type === 'non_ac_sleeper') return !bt.includes('ac') && bt.includes('sleeper')
        if (type === 'ac_seater')      return bt.includes('ac') && bt.includes('seater')
        if (type === 'volvo')          return bt.includes('volvo')
        if (type === 'sleeper')        return bt.includes('sleeper')
        if (type === 'seater')         return bt.includes('seater')
        return false
      })
      if (!match) return false
    }
    if (filters.operators?.length > 0) {
      if (!filters.operators.includes(b.operator)) return false
    }
    if (filters.amenities?.length > 0) {
      const hasAll = filters.amenities.every(a => b.amenities?.includes(a))
      if (!hasAll) return false
    }
    if (filters.availability) {
      if (filters.availability === 'available' && b.availableSeats <= 0) return false
      if (filters.availability === 'limited'   && !(b.availableSeats > 0 && b.availableSeats <= 10)) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime)
    if (sortBy === 'duration')  return a.duration - b.duration
    if (sortBy === 'price')     return Number(a.price) - Number(b.price)
    if (sortBy === 'seats')     return b.availableSeats - a.availableSeats
    return 0
  })

  if (!origin || !destination || !date) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🚌</div>
        <h2 className="text-xl font-semibold text-gray-700">No search criteria</h2>
        <p className="text-gray-400 mt-2 mb-6">Please enter your journey details.</p>
        <button onClick={() => navigate(ROUTES.BUSES)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full">
          Search Buses
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
                <span className="font-bold text-lg">🚌 {origin} → {destination}</span>
                <span className="text-orange-100 text-sm">|</span>
                <span className="text-orange-100 text-sm">{fmtDate(date)}</span>
                {busType && (
                  <>
                    <span className="text-orange-100 text-sm">|</span>
                    <span className="text-orange-100 text-sm">{busType}</span>
                  </>
                )}
                <span className="ml-auto text-xs underline text-orange-100">Modify Search ▼</span>
              </div>
            </button>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Modify Search</h3>
                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <BusSearch
                initialValues={{ origin, destination, date, busType }}
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
            <BusFilters filters={filters} onChange={setFilters} operators={allOperators} />
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Sort tabs */}
            {!loading && buses.length > 0 && (
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
                    <span className="font-semibold text-gray-800">{sorted.length}</span> buses found
                    {filtered.length !== buses.length && (
                      <span className="text-orange-500 ml-1">(filtered from {buses.length})</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{fmtDate(date)}</p>
                </div>
              </>
            )}

            {loading && <Loader text="Searching buses..." />}

            {!loading && error && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="text-red-500 text-lg">{error}</p>
                <button onClick={fetchBuses} className="mt-4 text-orange-500 hover:underline text-sm">Try again</button>
              </div>
            )}

            {!loading && !error && sorted.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">🚌</div>
                <h2 className="text-xl font-semibold text-gray-700">No buses found</h2>
                <p className="text-gray-400 mt-2">Try a different date or adjust your filters.</p>
              </div>
            )}

            {!loading && !error && sorted.map(bus => (
              <BusCard key={bus.id} bus={bus} date={date} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
