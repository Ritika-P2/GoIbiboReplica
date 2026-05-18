import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import FlightCard from '../components/flights/FlightCard'
import FlightFilters from '../components/flights/FlightFilters'
import Loader from '../components/common/Loader'
import { flightService } from '../services/flightService'
import { ROUTES } from '../constants/routes'

export default function FlightResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const origin      = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date        = searchParams.get('date') || ''
  const passengers  = searchParams.get('passengers') || 1
  const cabin       = searchParams.get('cabin') || 'ECONOMY'
  const specialFare = searchParams.get('specialFare') || 'REGULAR'

  const [flights,  setFlights]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [sortBy,   setSortBy]   = useState('price')
  const [filters,  setFilters]  = useState({ stops: '', maxPrice: 50000, airline: [] })

  const fetchFlights = useCallback(async () => {
    if (!origin || !destination || !date) return
    setLoading(true)
    setError(null)
    try {
      const params = {
        origin, destination, date,
        ...(filters.stops !== '' ? { stops: filters.stops } : {}),
        maxPrice: filters.maxPrice,
        ...(filters.airline.length === 1 ? { airline: filters.airline[0] } : {}),
      }
      const res = await flightService.search(params)
      setFlights(res.data.flights || [])
    } catch {
      setError('Failed to fetch flights. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [origin, destination, date, filters])

  useEffect(() => { fetchFlights() }, [fetchFlights])

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === 'price')    return Number(a.price) - Number(b.price)
    if (sortBy === 'duration') return a.duration - b.duration
    if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime)
    return 0
  })

  function handleSelect(flight) {
    navigate(ROUTES.FLIGHT_BOOKING, { state: { flight, passengers, cabin, specialFare } })
  }

  const fmtDate = date ? new Date(date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' }) : ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {origin} → {destination}
        </h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
          <span>{fmtDate} · {passengers} traveller{passengers > 1 ? 's' : ''} · {cabin.replace('_',' ')}</span>
          {specialFare !== 'REGULAR' && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              ✦ {specialFare.replace('_', ' ')} fare applied
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FlightFilters filters={filters} onChange={setFilters} />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          {!loading && flights.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{flights.length} flights found</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                {['price', 'duration', 'departure'].map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors capitalize ${sortBy === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && <Loader text="Searching flights..." />}

          {!loading && error && (
            <div className="text-center py-16">
              <p className="text-red-500 text-lg">{error}</p>
              <button onClick={fetchFlights} className="mt-4 text-blue-600 hover:underline text-sm">Try again</button>
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">✈️</div>
              <h2 className="text-xl font-semibold text-gray-700">No flights found</h2>
              <p className="text-gray-400 mt-2">Try changing your filters or travel dates.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {sorted.map(f => (
                <FlightCard key={f.id} flight={f} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}