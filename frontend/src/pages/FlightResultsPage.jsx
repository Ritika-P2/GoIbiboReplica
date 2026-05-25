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

function fmtDur(mins) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

// Mini flight card used for the "selected onward" summary strip
function SelectedFlightStrip({ label, flight, onRemove, discountedPrice }) {
  if (!flight) return null
  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide shrink-0">{label}</span>
        <div className="w-px h-8 bg-blue-200 shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {flight.airline.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{flight.airline} · {flight.flightNumber}</p>
            <p className="text-xs text-gray-500">
              {flight.origin} → {flight.destination} &nbsp;·&nbsp; {fmt(flight.departureTime)} – {fmt(flight.arrivalTime)} &nbsp;·&nbsp; {fmtDur(flight.duration)}
            </p>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-blue-700">₹{Number(discountedPrice || flight.price).toLocaleString('en-IN')}</p>
        {onRemove && (
          <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 mt-0.5">Change</button>
        )}
      </div>
    </div>
  )
}

export default function FlightResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sliderRef = useRef(null)

  const origin      = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date        = searchParams.get('date') || ''
  const returnDate  = searchParams.get('returnDate') || ''
  const passengers  = Number(searchParams.get('passengers') || 1)
  const cabin       = searchParams.get('cabin') || 'ECONOMY'
  const specialFare = searchParams.get('specialFare') || 'REGULAR'

  const isRoundTrip = !!returnDate

  // Round-trip state
  const [selectionStep,    setSelectionStep]    = useState('onward')  // 'onward' | 'return'
  const [selectedOnward,   setSelectedOnward]   = useState(null)
  const [returnFlights,    setReturnFlights]    = useState([])
  const [returnLoading,    setReturnLoading]    = useState(false)
  const [returnError,      setReturnError]      = useState(null)
  const [selectedReturn,   setSelectedReturn]   = useState(null)

  // One-way / onward state
  const [flights,    setFlights]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [sortBy,     setSortBy]     = useState('cheapest')
  const [filters,    setFilters]    = useState({ stops: '', maxPrice: 50000, airlines: [], departureRange: '' })
  const [showSearch, setShowSearch] = useState(false)

  // Return flight filters (independent)
  const [returnSortBy,  setReturnSortBy]  = useState('cheapest')
  const [returnFilters, setReturnFilters] = useState({ stops: '', maxPrice: 50000, airlines: [], departureRange: '' })

  const [sliderPrices, setSliderPrices] = useState({})
  const sliderDates = date ? getDateSlider(date, 7) : []

  const fetchFlights = useCallback(async () => {
    if (!origin || !destination || !date) return
    setLoading(true); setError(null)
    try {
      const params = { origin, destination, date }
      const res = await flightService.search(params)
      const list = res.data?.flights || []
      setFlights(list)
      if (list.length > 0) {
        const cheapest = Math.min(...list.map(f => Number(f.price)))
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
  }, [origin, destination, date])

  useEffect(() => { fetchFlights() }, [fetchFlights])

  // Reset round-trip state when search params change
  useEffect(() => {
    setSelectedOnward(null)
    setSelectedReturn(null)
    setReturnFlights([])
    setSelectionStep('onward')
  }, [origin, destination, date, returnDate])

  const fareInfo = SPECIAL_FARES[specialFare] || SPECIAL_FARES.REGULAR

  function applyDiscount(price) {
    if (!fareInfo.discount) return Number(price)
    if (fareInfo.discount.type === 'PERCENT') return Math.round(Number(price) * (1 - fareInfo.discount.value / 100))
    if (fareInfo.discount.type === 'FLAT')    return Math.max(0, Number(price) - fareInfo.discount.value)
    return Number(price)
  }

  function filterAndSort(list, filt, sort) {
    const filtered = list.filter(f => {
      if (filt.stops !== '' && Number(f.stops) !== Number(filt.stops)) return false
      if (Number(f.price) > Number(filt.maxPrice)) return false
      if (filt.airlines.length > 0 && !filt.airlines.includes(f.airline)) return false
      if (filt.departureRange) {
        const hour = new Date(f.departureTime).getHours()
        if (filt.departureRange === 'early-morning' && !(hour >= 0 && hour < 6)) return false
        if (filt.departureRange === 'morning' && !(hour >= 6 && hour < 12)) return false
      }
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'cheapest')  return applyDiscount(a.price) - applyDiscount(b.price)
      if (sort === 'nonstop')   return a.stops - b.stops
      if (sort === 'preferred') return (a.stops - b.stops) * 0.5 + (applyDiscount(a.price) - applyDiscount(b.price)) * 0.5
      if (sort === 'departure') return new Date(a.departureTime) - new Date(b.departureTime)
      return 0
    })
  }

  const sorted       = filterAndSort(flights, filters, sortBy)
  const sortedReturn = filterAndSort(returnFlights, returnFilters, returnSortBy)

  // Popular filter data
  function buildAirlineList(list) {
    const map = {}
    list.forEach(f => { if (!map[f.airline] || Number(f.price) < map[f.airline]) map[f.airline] = Number(f.price) })
    return Object.entries(map).sort((a, b) => a[1] - b[1])
  }
  const airlineList       = buildAirlineList(flights)
  const returnAirlineList = buildAirlineList(returnFlights)
  const [showAllAirlines,       setShowAllAirlines]       = useState(false)
  const [showAllReturnAirlines, setShowAllReturnAirlines] = useState(false)
  const cheapestNonstop       = flights.filter(f => f.stops === 0).sort((a, b) => Number(a.price) - Number(b.price))[0]
  const cheapestReturnNonstop = returnFlights.filter(f => f.stops === 0).sort((a, b) => Number(a.price) - Number(b.price))[0]

  async function fetchReturnFlights() {
    if (!returnDate) return
    setReturnLoading(true); setReturnError(null)
    try {
      const res = await flightService.search({ origin: destination, destination: origin, date: returnDate })
      setReturnFlights(res.data?.flights || [])
    } catch {
      setReturnError('Failed to fetch return flights. Please try again.')
    } finally {
      setReturnLoading(false)
    }
  }

  function handleSelectOnward(flight) {
    if (!isRoundTrip) {
      navigate(ROUTES.FLIGHT_BOOKING, { state: { flight, passengers, cabin, specialFare } })
      return
    }
    setSelectedOnward(flight)
    setSelectionStep('return')
    if (returnFlights.length === 0) fetchReturnFlights()
    // Scroll to top of return section
    setTimeout(() => {
      document.getElementById('return-flights-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleSelectReturn(flight) {
    setSelectedReturn(flight)
  }

  function handleBookRoundTrip() {
    if (!selectedOnward || !selectedReturn) return
    navigate(ROUTES.FLIGHT_BOOKING, {
      state: {
        flight:       selectedOnward,
        returnFlight: selectedReturn,
        returnDate,
        passengers,
        cabin,
        specialFare,
      },
    })
  }

  function changeDate(newDate) {
    const params = new URLSearchParams({ origin, destination, date: newDate, passengers, cabin, specialFare, ...(returnDate ? { returnDate } : {}) })
    navigate(`${ROUTES.FLIGHT_RESULTS}?${params}`)
  }

  const fmtDate = date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''
  const fmtReturnDate = returnDate ? new Date(returnDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''

  const sortTabs = [
    { id: 'cheapest',  label: 'CHEAPEST',      icon: '₹' },
    { id: 'nonstop',   label: 'NON STOP FIRST', icon: '⚡' },
    { id: 'preferred', label: 'YOU MAY PREFER', icon: '⭐' },
    { id: 'departure', label: 'OTHER SORT',     icon: '🔀' },
  ]

  function SortTabs({ current, onChange, flightList, filt }) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex">
          {sortTabs.map(tab => {
            const tabFlights = tab.id === 'nonstop' ? filterAndSort(flightList, filt, 'cheapest').filter(f => f.stops === 0) : filterAndSort(flightList, filt, 'cheapest')
            const cheapestPrice = tabFlights.length > 0 ? Math.min(...tabFlights.map(f => applyDiscount(f.price))) : null
            return (
              <button key={tab.id} onClick={() => onChange(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-2 border-b-2 text-xs transition-colors ${current === tab.id ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                <span className="font-bold text-xs uppercase tracking-wide">{tab.label}</span>
                {cheapestPrice != null && (
                  <span className={`text-xs mt-0.5 font-semibold ${current === tab.id ? 'text-orange-500' : 'text-gray-400'}`}>
                    ₹{cheapestPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  function FilterSidebar({ flightList, filt, setFilt, nonstopFlight, airList, showAll, setShowAll }) {
    return (
      <aside className="hidden lg:block w-60 shrink-0 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">Popular Filters</h3>
          <div className="space-y-1">
            <label className="flex items-center justify-between py-1.5 cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={filt.stops === '0'}
                  onChange={e => setFilt(f => ({ ...f, stops: e.target.checked ? '0' : '' }))}
                  className="accent-orange-500 rounded" />
                <span className="text-sm text-gray-700 group-hover:text-orange-600">Non Stop</span>
              </div>
              {nonstopFlight && <span className="text-xs text-gray-400 font-medium">₹{Number(nonstopFlight.price).toLocaleString('en-IN')}</span>}
            </label>
            <label className="flex items-center justify-between py-1.5 cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={filt.departureRange === 'early-morning'}
                  onChange={e => setFilt(f => ({ ...f, departureRange: e.target.checked ? 'early-morning' : '' }))}
                  className="accent-orange-500 rounded" />
                <span className="text-sm text-gray-700 group-hover:text-orange-600">Early Morning</span>
              </div>
              <span className="text-xs text-gray-400">00:00–06:00</span>
            </label>
            <label className="flex items-center justify-between py-1.5 cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={filt.departureRange === 'morning'}
                  onChange={e => setFilt(f => ({ ...f, departureRange: e.target.checked ? 'morning' : '' }))}
                  className="accent-orange-500 rounded" />
                <span className="text-sm text-gray-700 group-hover:text-orange-600">Morning</span>
              </div>
              <span className="text-xs text-gray-400">06:00–12:00</span>
            </label>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">Airlines</h3>
          <div className="space-y-1">
            {(showAll ? airList : airList.slice(0, 5)).map(([airline, price]) => (
              <label key={airline} className="flex items-center justify-between py-1.5 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={filt.airlines.includes(airline)}
                    onChange={e => setFilt(f => ({
                      ...f,
                      airlines: e.target.checked ? [...f.airlines, airline] : f.airlines.filter(a => a !== airline)
                    }))}
                    className="accent-orange-500 rounded" />
                  <span className="text-sm text-gray-700 group-hover:text-orange-600">{airline}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">₹{price.toLocaleString('en-IN')}</span>
              </label>
            ))}
            {airList.length > 5 && (
              <button onClick={() => setShowAll(s => !s)} className="text-xs text-orange-500 hover:underline mt-1 font-medium">
                {showAll ? 'Show less' : `+ ${airList.length - 5} more`}
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">Price Range</h3>
          <p className="text-sm text-gray-600 mb-2">Up to <span className="font-bold text-orange-600">₹{Number(filt.maxPrice).toLocaleString('en-IN')}</span></p>
          <input type="range" min={1000} max={50000} step={500} value={filt.maxPrice}
            onChange={e => setFilt(f => ({ ...f, maxPrice: e.target.value }))}
            className="w-full accent-orange-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹1,000</span><span>₹50,000</span></div>
        </div>
        {(filt.stops !== '' || filt.airlines.length > 0 || Number(filt.maxPrice) < 50000 || filt.departureRange !== '') && (
          <button onClick={() => setFilt({ stops: '', maxPrice: 50000, airlines: [], departureRange: '' })}
            className="w-full text-sm text-orange-600 hover:underline font-medium">
            Clear all filters
          </button>
        )}
      </aside>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Orange top search bar */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {!showSearch && (
            <button onClick={() => setShowSearch(true)}
              className="w-full bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-white text-left transition-colors">
              <div className="flex items-center gap-4 flex-wrap">
                {isRoundTrip ? (
                  <>
                    <span className="font-bold text-lg">{origin} ⇌ {destination}</span>
                    <span className="text-orange-100 text-sm">|</span>
                    <span className="text-orange-100 text-sm">{fmtDate} – {fmtReturnDate}</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-lg">{origin} → {destination}</span>
                    <span className="text-orange-100 text-sm">|</span>
                    <span className="text-orange-100 text-sm">{fmtDate}</span>
                  </>
                )}
                <span className="text-orange-100 text-sm">|</span>
                <span className="text-orange-100 text-sm">{passengers} Traveller{passengers > 1 ? 's' : ''} · {cabin.replace('_', ' ')}</span>
                {isRoundTrip && <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full font-semibold">Round Trip</span>}
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
              <FlightSearch initialValues={{ origin, destination, date, returnDate, passengers, cabin, specialFare, tripType: isRoundTrip ? 'round-trip' : 'one-way' }} />
            </div>
          )}
        </div>
      </div>

      {/* Round-trip progress strip */}
      {isRoundTrip && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-6">
            {/* Step 1 */}
            <div className={`flex items-center gap-2 ${selectionStep === 'onward' ? 'text-orange-600' : selectedOnward ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${selectionStep === 'onward' ? 'border-orange-500 bg-orange-500 text-white' : selectedOnward ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                {selectedOnward ? '✓' : '1'}
              </div>
              <div>
                <p className="text-xs font-semibold">Onward Flight</p>
                <p className="text-xs opacity-70">{origin} → {destination} · {fmtDate}</p>
              </div>
            </div>
            <div className={`flex-1 h-px ${selectedOnward ? 'bg-green-300' : 'bg-gray-200'}`} />
            {/* Step 2 */}
            <div className={`flex items-center gap-2 ${selectionStep === 'return' ? 'text-orange-600' : selectedReturn ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${selectionStep === 'return' ? 'border-orange-500 bg-orange-500 text-white' : selectedReturn ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                {selectedReturn ? '✓' : '2'}
              </div>
              <div>
                <p className="text-xs font-semibold">Return Flight</p>
                <p className="text-xs opacity-70">{destination} → {origin} · {fmtReturnDate}</p>
              </div>
            </div>
            <div className={`flex-1 h-px ${selectedReturn ? 'bg-green-300' : 'bg-gray-200'}`} />
            {/* Book button */}
            <button
              disabled={!selectedOnward || !selectedReturn}
              onClick={handleBookRoundTrip}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold rounded-full text-sm transition-colors whitespace-nowrap">
              Book Round Trip
            </button>
          </div>
        </div>
      )}

      {/* Date slider (only for one-way or onward step) */}
      {date && (!isRoundTrip || selectionStep === 'onward') && (
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

        {/* ── ONWARD FLIGHTS ── */}
        <div className={isRoundTrip && selectionStep === 'return' ? 'opacity-60 pointer-events-none mb-8' : 'mb-8'}>
          {isRoundTrip && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">1</div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Select Onward Flight</h2>
                <p className="text-sm text-gray-500">{origin} → {destination} · {fmtDate}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <FilterSidebar
              flightList={flights} filt={filters} setFilt={setFilters}
              nonstopFlight={cheapestNonstop} airList={airlineList}
              showAll={showAllAirlines} setShowAll={setShowAllAirlines}
            />

            <div className="flex-1 min-w-0 space-y-3">
              {!loading && flights.length > 0 && (
                <>
                  <SortTabs current={sortBy} onChange={setSortBy} flightList={flights} filt={filters} />
                  <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-800">{sorted.length}</span> flights found
                      {sorted.length !== flights.length && <span className="text-orange-500 ml-1">(filtered from {flights.length})</span>}
                    </p>
                    {specialFare !== 'REGULAR' && (
                      <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                        {fareInfo.icon} {fareInfo.label} prices shown
                      </span>
                    )}
                  </div>
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
                <FlightCard key={f.id} flight={f} onSelect={handleSelectOnward}
                  specialFare={specialFare} discountedPrice={applyDiscount(f.price)} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RETURN FLIGHTS (round-trip only, visible after onward is selected) ── */}
        {isRoundTrip && selectionStep === 'return' && (
          <div id="return-flights-section">
            {/* Selected onward summary */}
            {selectedOnward && (
              <div className="mb-4">
                <SelectedFlightStrip
                  label="Onward"
                  flight={selectedOnward}
                  discountedPrice={applyDiscount(selectedOnward.price)}
                  onRemove={() => { setSelectedOnward(null); setSelectionStep('onward'); setSelectedReturn(null) }}
                />
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">2</div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Select Return Flight</h2>
                <p className="text-sm text-gray-500">{destination} → {origin} · {fmtReturnDate}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FilterSidebar
                flightList={returnFlights} filt={returnFilters} setFilt={setReturnFilters}
                nonstopFlight={cheapestReturnNonstop} airList={returnAirlineList}
                showAll={showAllReturnAirlines} setShowAll={setShowAllReturnAirlines}
              />

              <div className="flex-1 min-w-0 space-y-3">
                {/* Selected return summary */}
                {selectedReturn && (
                  <SelectedFlightStrip
                    label="Return"
                    flight={selectedReturn}
                    discountedPrice={applyDiscount(selectedReturn.price)}
                    onRemove={() => setSelectedReturn(null)}
                  />
                )}

                {!returnLoading && returnFlights.length > 0 && (
                  <>
                    <SortTabs current={returnSortBy} onChange={setReturnSortBy} flightList={returnFlights} filt={returnFilters} />
                    <div className="flex items-center justify-between px-1">
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-800">{sortedReturn.length}</span> return flights found
                      </p>
                    </div>
                  </>
                )}

                {returnLoading && <Loader text="Searching return flights..." />}
                {!returnLoading && returnError && (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-red-500 text-lg">{returnError}</p>
                    <button onClick={fetchReturnFlights} className="mt-4 text-orange-500 hover:underline text-sm">Try again</button>
                  </div>
                )}
                {!returnLoading && !returnError && sortedReturn.length === 0 && returnFlights.length === 0 && !returnLoading && (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="text-6xl mb-4">✈️</div>
                    <h2 className="text-xl font-semibold text-gray-700">No return flights found</h2>
                    <p className="text-gray-400 mt-2">No flights available on {fmtReturnDate} for {destination} → {origin}.</p>
                  </div>
                )}

                {!returnLoading && !returnError && sortedReturn.map(f => {
                  const isSelected = selectedReturn?.id === f.id
                  return (
                    <div key={f.id} className={`relative ${isSelected ? 'ring-2 ring-orange-500 rounded-xl' : ''}`}>
                      {isSelected && (
                        <div className="absolute -top-2 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full z-10">
                          Selected
                        </div>
                      )}
                      <FlightCard
                        flight={f}
                        onSelect={handleSelectReturn}
                        specialFare={specialFare}
                        discountedPrice={applyDiscount(f.price)}
                        selectLabel={isSelected ? '✓ Selected' : 'Select Return'}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sticky bottom bar: fare summary + Book button */}
            {selectedOnward && selectedReturn && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div>
                      <p className="text-xs text-gray-500">Onward</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedOnward.origin} → {selectedOnward.destination}</p>
                      <p className="text-xs text-gray-500">{selectedOnward.airline} · {fmt(selectedOnward.departureTime)}</p>
                    </div>
                    <div className="text-gray-300">+</div>
                    <div>
                      <p className="text-xs text-gray-500">Return</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedReturn.origin} → {selectedReturn.destination}</p>
                      <p className="text-xs text-gray-500">{selectedReturn.airline} · {fmt(selectedReturn.departureTime)}</p>
                    </div>
                    <div className="text-gray-300 hidden sm:block">|</div>
                    <div>
                      <p className="text-xs text-gray-500">Total fare (per person)</p>
                      <p className="text-xl font-bold text-orange-600">
                        ₹{(applyDiscount(selectedOnward.price) + applyDiscount(selectedReturn.price)).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleBookRoundTrip}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full text-sm transition-colors whitespace-nowrap shadow-md">
                    Book Round Trip →
                  </button>
                </div>
              </div>
            )}

            {/* Bottom padding so sticky bar doesn't overlap last card */}
            {selectedOnward && selectedReturn && <div className="h-20" />}
          </div>
        )}
      </div>
    </div>
  )
}
