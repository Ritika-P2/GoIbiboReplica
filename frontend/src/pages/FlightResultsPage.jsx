import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import FlightCard from '../components/flights/FlightCard'
import Loader from '../components/common/Loader'
import { flightService } from '../services/flightService'
import { ROUTES } from '../constants/routes'
import FlightSearch from '../components/flights/FlightSearch'

const SPECIAL_FARES = {
  REGULAR:        { label: 'Regular',          icon: '✈️',  discount: null },
  STUDENT:        { label: 'Student',           icon: '🎓',  discount: { type: 'PERCENT', value: 10 } },
  ARMED_FORCES:   { label: 'Armed Forces',      icon: '🪖',  discount: { type: 'FLAT',    value: 600 } },
  GST:            { label: 'GST Fares',         icon: '🧾',  discount: null },
  SENIOR_CITIZEN: { label: 'Senior Citizen',    icon: '👴',  discount: { type: 'FLAT',    value: 600 } },
  DOCTOR_NURSE:   { label: 'Doctor & Nurses',   icon: '🩺',  discount: { type: 'FLAT',    value: 600 } },
}

function getDateSlider(centerDate, count = 7) {
  const d = new Date(centerDate)
  const start = new Date(d)
  start.setDate(start.getDate() - Math.floor(count / 2))
  return Array.from({ length: count }, (_, i) => {
    const dt = new Date(start)
    dt.setDate(dt.getDate() + i)
    return dt.toISOString().split('T')[0]
  })
}

function fmtSliderDate(dateStr) {
  const d = new Date(dateStr)
  return {
    day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }
}

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function FlightResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sliderRef = useRef(null)

  const origin      = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date        = searchParams.get('date') || ''
  const passengers  = Number(searchParams.get('passengers') || 1)
  const cabin       = searchParams.get('cabin') || 'ECONOMY'
  const specialFare = searchParams.get('specialFare') || 'REGULAR'

  const [flights,    setFlights]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [sortBy,     setSortBy]     = useState('cheapest')
  const [filters,    setFilters]    = useState({ stops: '', maxPrice: 50000, airlines: [] })
  const [showSearch, setShowSearch] = useState(false)

  // date slider prices (cheapest per date — populated from API results for current date, mock for others)
  const [sliderPrices, setSliderPrices] = useState({})
  const sliderDates = date ? getDateSlider(date, 7) : []

  const fetchFlights = useCallback(async () => {
    if (!origin || !destination || !date) return
    setLoading(true); setError(null)
    try {
      const params = {
        origin, destination, date,
        ...(filters.stops !== '' ? { stops: filters.stops } : {}),
        maxPrice: filters.maxPrice,
        ...(filters.airlines.length === 1 ? { airline: filters.airlines[0] } : {}),
      }
      const res = await flightService.search(params)
      const list = res.data.flights || []
      setFlights(list)
      // compute cheapest for current date
      if (list.length > 0) {
        const cheapest = Math.min(...list.map(f => Number(f.price)))
        // mock nearby prices with slight variance
        const mockPrices = {}
        sliderDates.forEach((d, i) => {
          const variance = (Math.random() - 0.5) * 0.15
          mockPrices[d] = d === date ? cheapest : Math.round(cheapest * (1 + variance / 2 + (Math.abs(i - 3)) * 0.02))
        })
        mockPrices[date] = cheapest
        setSliderPrices(mockPrices)
      }
    } catch {
      setError('Failed to fetch flights. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [origin, destination, date, filters])

  useEffect(() => { fetchFlights() }, [fetchFlights])

  // sort + filter
  const fareInfo = SPECIAL_FARES[specialFare] || SPECIAL_FARES.REGULAR

  function applyDiscount(price) {
    if (!fareInfo.discount) return Number(price)
    if (fareInfo.discount.type === 'PERCENT') return Math.round(Number(price) * (1 - fareInfo.discount.value / 100))
    if (fareInfo.discount.type === 'FLAT')    return Math.max(0, Number(price) - fareInfo.discount.value)
    return Number(price)
  }

  const filtered = flights.filter(f => {
    if (filters.stops !== '' && String(f.stops) !== String(filters.stops)) return false
    if (Number(f.price) > Number(filters.maxPrice)) return false
    if (filters.airlines.length > 0 && !filters.airlines.includes(f.airline)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'cheapest')   return applyDiscount(a.price) - applyDiscount(b.price)
    if (sortBy === 'nonstop')    return a.stops - b.stops
    if (sortBy === 'preferred')  return (a.stops - b.stops) * 0.5 + (applyDiscount(a.price) - applyDiscount(b.price)) * 0.5
    if (sortBy === 'departure')  return new Date(a.departureTime) - new Date(b.departureTime)
    return 0
  })

  // Popular filter data from results
  const cheapestNonstop = flights.filter(f => f.stops === 0).sort((a, b) => Number(a.price) - Number(b.price))[0]
  const airlinePrices = {}
  flights.forEach(f => {
    if (!airlinePrices[f.airline] || Number(f.price) < Number(airlinePrices[f.airline])) {
      airlinePrices[f.airline] = Number(f.price)
    }
  })
  const airlineList = Object.entries(airlinePrices).sort((a, b) => a[1] - b[1])
  const [showAllAirlines, setShowAllAirlines] = useState(false)

  function changeDate(newDate) {
    const params = new URLSearchParams({ origin, destination, date: newDate, passengers, cabin, specialFare })
    navigate(`${ROUTES.FLIGHT_RESULTS}?${params}`)
  }

  function handleSelect(flight) {
    navigate(ROUTES.FLIGHT_BOOKING, { state: { flight, passengers, cabin, specialFare } })
  }

  const fmtDate = date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''

  const sortTabs = [
    { id: 'cheapest',   label: 'CHEAPEST',       icon: '₹' },
    { id: 'nonstop',    label: 'NON STOP FIRST',  icon: '⚡' },
    { id: 'preferred',  label: 'YOU MAY PREFER',  icon: '⭐' },
    { id: 'departure',  label: 'OTHER SORT',      icon: '🔀' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Orange top search bar */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Collapsed summary row */}
          {!showSearch && (
            <button onClick={() => setShowSearch(true)}
              className="w-full bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-white text-left transition-colors">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-bold text-lg">{origin} → {destination}</span>
                <span className="text-orange-100 text-sm">|</span>
                <span className="text-orange-100 text-sm">{fmtDate}</span>
                <span className="text-orange-100 text-sm">|</span>
                <span className="text-orange-100 text-sm">{passengers} Traveller{passengers > 1 ? 's' : ''} · {cabin.replace('_', ' ')}</span>
                {specialFare !== 'REGULAR' && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                    {fareInfo.icon} {fareInfo.label}
                  </span>
                )}
                <span className="ml-auto text-xs underline text-orange-100">Modify Search ▼</span>
              </div>
            </button>
          )}
          {showSearch && (
            <div className="bg-white rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Modify Search</h3>
                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <FlightSearch initialValues={{ origin, destination, date, passengers, cabin, specialFare }} />
            </div>
          )}
        </div>
      </div>

      {/* Date slider */}
      {date && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar" ref={sliderRef}>
              <button onClick={() => changeDate(sliderDates[0] ? new Date(new Date(sliderDates[0]).setDate(new Date(sliderDates[0]).getDate() - 1)).toISOString().split('T')[0] : date)}
                className="shrink-0 p-2 text-gray-400 hover:text-orange-500">‹</button>
              {sliderDates.map(d => {
                const { day, date: dateLabel } = fmtSliderDate(d)
                const price = sliderPrices[d]
                const isSelected = d === date
                return (
                  <button key={d} onClick={() => changeDate(d)}
                    className={`shrink-0 flex flex-col items-center px-4 py-2 rounded-lg text-xs transition-all border ${isSelected ? 'bg-orange-500 text-white border-orange-500 font-bold shadow-md' : 'bg-white text-gray-600 border-transparent hover:border-orange-200 hover:bg-orange-50'}`}>
                    <span className="font-semibold">{day}, {dateLabel}</span>
                    {price
                      ? <span className={`mt-0.5 font-bold ${isSelected ? 'text-white' : 'text-orange-600'}`}>₹{price.toLocaleString('en-IN')}</span>
                      : <span className="mt-0.5 text-gray-300">—</span>}
                  </button>
                )
              })}
              <button onClick={() => changeDate(sliderDates[sliderDates.length - 1] ? new Date(new Date(sliderDates[sliderDates.length - 1]).setDate(new Date(sliderDates[sliderDates.length - 1]).getDate() + 1)).toISOString().split('T')[0] : date)}
                className="shrink-0 p-2 text-gray-400 hover:text-orange-500">›</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-4">

          {/* Left sidebar */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-4">

            {/* Popular Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Popular Filters</h3>
              <div className="space-y-1">
                {/* Non Stop */}
                <label className="flex items-center justify-between py-1.5 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={filters.stops === '0'}
                      onChange={e => setFilters(f => ({ ...f, stops: e.target.checked ? '0' : '' }))}
                      className="accent-orange-500 rounded" />
                    <span className="text-sm text-gray-700 group-hover:text-orange-600">Non Stop</span>
                  </div>
                  {cheapestNonstop && (
                    <span className="text-xs text-gray-400 font-medium">₹{Number(cheapestNonstop.price).toLocaleString('en-IN')}</span>
                  )}
                </label>

                {/* Early Morning */}
                <label className="flex items-center justify-between py-1.5 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="accent-orange-500 rounded" />
                    <span className="text-sm text-gray-700 group-hover:text-orange-600">Early Morning</span>
                  </div>
                  <span className="text-xs text-gray-400">00:00–06:00</span>
                </label>

                {/* Morning */}
                <label className="flex items-center justify-between py-1.5 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="accent-orange-500 rounded" />
                    <span className="text-sm text-gray-700 group-hover:text-orange-600">Morning</span>
                  </div>
                  <span className="text-xs text-gray-400">06:00–12:00</span>
                </label>
              </div>
            </div>

            {/* Airlines */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Airlines</h3>
              <div className="space-y-1">
                {(showAllAirlines ? airlineList : airlineList.slice(0, 5)).map(([airline, price]) => (
                  <label key={airline} className="flex items-center justify-between py-1.5 cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={filters.airlines.includes(airline)}
                        onChange={e => setFilters(f => ({
                          ...f,
                          airlines: e.target.checked ? [...f.airlines, airline] : f.airlines.filter(a => a !== airline)
                        }))}
                        className="accent-orange-500 rounded" />
                      <span className="text-sm text-gray-700 group-hover:text-orange-600">{airline}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">₹{price.toLocaleString('en-IN')}</span>
                  </label>
                ))}
                {airlineList.length > 5 && (
                  <button onClick={() => setShowAllAirlines(s => !s)}
                    className="text-xs text-orange-500 hover:underline mt-1 font-medium">
                    {showAllAirlines ? 'Show less' : `+ ${airlineList.length - 5} more`}
                  </button>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Price Range</h3>
              <p className="text-sm text-gray-600 mb-2">
                Up to <span className="font-bold text-orange-600">₹{Number(filters.maxPrice).toLocaleString('en-IN')}</span>
              </p>
              <input type="range" min={1000} max={50000} step={500} value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="w-full accent-orange-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹1,000</span><span>₹50,000</span>
              </div>
            </div>

            {(filters.stops !== '' || filters.airlines.length > 0 || Number(filters.maxPrice) < 50000) && (
              <button onClick={() => setFilters({ stops: '', maxPrice: 50000, airlines: [] })}
                className="w-full text-sm text-orange-600 hover:underline font-medium">
                Clear all filters
              </button>
            )}
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Header + sort tabs */}
            {!loading && flights.length > 0 && (
              <>
                {/* Sort tabs */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex">
                    {sortTabs.map(tab => {
                      const tabFlights = tab.id === 'nonstop' ? filtered.filter(f => f.stops === 0) : filtered
                      const cheapestPrice = tabFlights.length > 0
                        ? Math.min(...tabFlights.map(f => applyDiscount(f.price)))
                        : null
                      const fastestDur = tab.id === 'nonstop' && tabFlights.length > 0
                        ? Math.min(...tabFlights.map(f => f.duration))
                        : null
                      return (
                        <button key={tab.id} onClick={() => setSortBy(tab.id)}
                          className={`flex-1 flex flex-col items-center py-3 px-2 border-b-2 text-xs transition-colors ${sortBy === tab.id ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                          <span className="font-bold text-xs uppercase tracking-wide">{tab.label}</span>
                          {cheapestPrice != null && (
                            <span className={`text-xs mt-0.5 font-semibold ${sortBy === tab.id ? 'text-orange-500' : 'text-gray-400'}`}>
                              ₹{cheapestPrice.toLocaleString('en-IN')}
                              {fastestDur != null && ` | ${Math.floor(fastestDur / 60)}h ${fastestDur % 60}m`}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Results count + fare notice */}
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{sorted.length}</span> flights found
                    {filtered.length !== flights.length && <span className="text-orange-500 ml-1">(filtered from {flights.length})</span>}
                  </p>
                  {specialFare !== 'REGULAR' && (
                    <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                      {fareInfo.icon} {fareInfo.label} prices shown
                    </span>
                  )}
                </div>

                {specialFare !== 'REGULAR' && (
                  <p className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-4 py-2">
                    ✦ Flights sorted by Lowest fares on this route including both regular and {fareInfo.label.toLowerCase()} fares
                  </p>
                )}
              </>
            )}

            {loading && <Loader text="Searching best flights..." />}

            {!loading && error && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="text-red-500 text-lg">{error}</p>
                <button onClick={fetchFlights} className="mt-4 text-orange-500 hover:underline text-sm">Try again</button>
              </div>
            )}

            {!loading && !error && sorted.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">✈️</div>
                <h2 className="text-xl font-semibold text-gray-700">No flights found</h2>
                <p className="text-gray-400 mt-2">Try adjusting your filters or travel dates.</p>
              </div>
            )}

            {!loading && !error && sorted.map(f => (
              <FlightCard key={f.id} flight={f} onSelect={handleSelect}
                specialFare={specialFare} discountedPrice={applyDiscount(f.price)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
