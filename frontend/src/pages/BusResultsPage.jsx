import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { busService } from '../services/busService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'

const AMENITY_ICONS = {
  'AC': '❄️', 'WiFi': '📶', 'Charging Port': '🔌',
  'Blanket': '🛏️', 'Water Bottle': '💧', 'Snacks': '🍪',
}

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDur(mins) {
  const h = Math.floor(mins / 60), m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function BusResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const origin      = searchParams.get('origin')      || ''
  const destination = searchParams.get('destination') || ''
  const date        = searchParams.get('date')        || ''
  const busType     = searchParams.get('busType')     || ''

  const [buses,   setBuses]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [sortBy,  setSortBy]  = useState('departure')

  const fetchBuses = useCallback(async () => {
    if (!origin || !destination || !date) return
    setLoading(true)
    setError(null)
    try {
      const params = { origin, destination, date, ...(busType ? { busType } : {}) }
      const res = await busService.search(params)
      setBuses(res.data.buses || [])
    } catch {
      setError('Failed to fetch buses. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [origin, destination, date, busType])

  useEffect(() => { fetchBuses() }, [fetchBuses])

  const sorted = [...buses].sort((a, b) => {
    if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime)
    if (sortBy === 'duration')  return a.duration - b.duration
    if (sortBy === 'price')     return Number(a.price) - Number(b.price)
    if (sortBy === 'seats')     return b.availableSeats - a.availableSeats
    return 0
  })

  const fmtDate = date
    ? new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  if (!origin || !destination || !date) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">🚌</div>
        <h2 className="text-xl font-semibold text-gray-700">No search criteria</h2>
        <p className="text-gray-400 mt-2 mb-6">Please go back and enter your journey details.</p>
        <Button onClick={() => navigate(ROUTES.BUSES)}>Search Buses</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{origin} → {destination}</h1>
        <p className="text-gray-500 mt-1">
          {fmtDate}
          {busType ? ` · ${busType}` : ' · All Bus Types'}
        </p>
      </div>

      {/* Sort bar */}
      {!loading && buses.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{buses.length} bus{buses.length !== 1 ? 'es' : ''} found</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            {[
              { k: 'departure', l: 'Departure' },
              { k: 'price',     l: 'Price' },
              { k: 'duration',  l: 'Duration' },
              { k: 'seats',     l: 'Availability' },
            ].map(s => (
              <button key={s.k} onClick={() => setSortBy(s.k)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${sortBy === s.k ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <Loader text="Searching buses..." />}

      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={fetchBuses} className="mt-4 text-orange-600 hover:underline text-sm">Try again</button>
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🚌</div>
          <h2 className="text-xl font-semibold text-gray-700">No buses found</h2>
          <p className="text-gray-400 mt-2 mb-6">Try a different date or route.</p>
          <Button onClick={() => navigate(ROUTES.BUSES)}>Modify Search</Button>
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="space-y-4">
          {sorted.map(bus => (
            <div key={bus.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">

                {/* Operator + type */}
                <div className="sm:w-52 shrink-0">
                  <p className="font-bold text-gray-900">{bus.operator}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{bus.busType}</p>
                  <span className={`inline-flex mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium
                    ${bus.availableSeats > 20 ? 'bg-green-100 text-green-700'
                    : bus.availableSeats > 5  ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'}`}>
                    {bus.availableSeats} seats left
                  </span>
                </div>

                {/* Route + timing */}
                <div className="flex flex-1 items-center gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{fmt(bus.departureTime)}</p>
                    <p className="text-sm font-medium text-gray-600">{bus.origin}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-xs text-gray-400">{fmtDur(bus.duration)}</p>
                    <div className="relative w-full flex items-center">
                      <div className="flex-1 h-px bg-gray-300" />
                      <span className="mx-2 text-lg">🚌</span>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{fmt(bus.arrivalTime)}</p>
                    <p className="text-sm font-medium text-gray-600">{bus.destination}</p>
                  </div>
                </div>

                {/* Price + book */}
                <div className="sm:w-36 text-right shrink-0">
                  <p className="text-2xl font-bold text-orange-600">₹{Number(bus.price).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mb-2">per seat</p>
                  <Button
                    size="sm"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => navigate(ROUTES.BUS_BOOKING, { state: { bus, date } })}
                  >
                    Book Now
                  </Button>
                </div>
              </div>

              {/* Amenities */}
              {bus.amenities && bus.amenities.length > 0 && (
                <div className="border-t border-gray-100 px-5 py-2.5 bg-gray-50 flex flex-wrap gap-2">
                  {bus.amenities.map(a => (
                    <span key={a} className="inline-flex items-center gap-1 text-xs text-gray-600 bg-white border border-gray-200 rounded-full px-2.5 py-1">
                      <span>{AMENITY_ICONS[a] || '•'}</span>
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
