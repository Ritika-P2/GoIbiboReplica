import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import FlightCard from '../components/flights/FlightCard'
import Loader from '../components/common/Loader'
import { flightService } from '../services/flightService'
import { ROUTES } from '../constants/routes'
import FlightSearch from '../components/flights/FlightSearch'

const SPECIAL_FARES = {
  REGULAR:        { label: 'Regular',        icon: '✈️',  discount: null },
  STUDENT:        { label: 'Student',         icon: '🎓',  discount: { type: 'PERCENT', value: 10 } },
  ARMED_FORCES:   { label: 'Armed Forces',    icon: '🪖',  discount: { type: 'FLAT',    value: 600 } },
  SENIOR_CITIZEN: { label: 'Senior Citizen',  icon: '👴',  discount: { type: 'FLAT',    value: 600 } },
  DOCTOR_NURSE:   { label: 'Doctor & Nurses', icon: '🩺',  discount: { type: 'FLAT',    value: 600 } },
}

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtDur(mins) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

// Mini strip showing a confirmed segment selection
function SelectedStrip({ idx, seg, flight, discountedPrice, onRemove }) {
  return (
    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded shrink-0">S{idx + 1} ✓</span>
        <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
          {flight.airline.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{seg.origin} → {seg.destination}</p>
          <p className="text-xs text-gray-500">{flight.airline} · {flight.flightNumber} · {fmt(flight.departureTime)} – {fmt(flight.arrivalTime)}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-green-700">₹{Number(discountedPrice).toLocaleString('en-IN')}</p>
        {onRemove && <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">Change</button>}
      </div>
    </div>
  )
}

function FilterSidebar({ flights, filters, setFilters }) {
  const [showAllAirlines, setShowAllAirlines] = useState(false)
  const cheapestNonstop = flights.filter(f => f.stops === 0).sort((a, b) => Number(a.price) - Number(b.price))[0]
  const airlineMap = {}
  flights.forEach(f => { if (!airlineMap[f.airline] || Number(f.price) < airlineMap[f.airline]) airlineMap[f.airline] = Number(f.price) })
  const airlineList = Object.entries(airlineMap).sort((a, b) => a[1] - b[1])

  return (
    <aside className="hidden lg:block w-56 shrink-0 space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-3 text-sm">Popular Filters</h3>
        <div className="space-y-1">
          <label className="flex items-center justify-between py-1.5 cursor-pointer">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={filters.stops === '0'}
                onChange={e => setFilters(f => ({ ...f, stops: e.target.checked ? '0' : '' }))}
                className="accent-orange-500" />
              <span className="text-sm text-gray-700">Non Stop</span>
            </div>
            {cheapestNonstop && <span className="text-xs text-gray-400">₹{Number(cheapestNonstop.price).toLocaleString('en-IN')}</span>}
          </label>
          <label className="flex items-center justify-between py-1.5 cursor-pointer">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={filters.departureRange === 'morning'}
                onChange={e => setFilters(f => ({ ...f, departureRange: e.target.checked ? 'morning' : '' }))}
                className="accent-orange-500" />
              <span className="text-sm text-gray-700">Morning</span>
            </div>
            <span className="text-xs text-gray-400">06–12</span>
          </label>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-3 text-sm">Airlines</h3>
        <div className="space-y-1">
          {(showAllAirlines ? airlineList : airlineList.slice(0, 5)).map(([airline, price]) => (
            <label key={airline} className="flex items-center justify-between py-1.5 cursor-pointer">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={filters.airlines.includes(airline)}
                  onChange={e => setFilters(f => ({
                    ...f, airlines: e.target.checked ? [...f.airlines, airline] : f.airlines.filter(a => a !== airline)
                  }))} className="accent-orange-500" />
                <span className="text-sm text-gray-700">{airline}</span>
              </div>
              <span className="text-xs text-gray-400">₹{price.toLocaleString('en-IN')}</span>
            </label>
          ))}
          {airlineList.length > 5 && (
            <button onClick={() => setShowAllAirlines(s => !s)} className="text-xs text-orange-500 hover:underline mt-1">
              {showAllAirlines ? 'Show less' : `+ ${airlineList.length - 5} more`}
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-3 text-sm">Price</h3>
        <p className="text-sm text-gray-600 mb-2">Up to <span className="font-bold text-orange-600">₹{Number(filters.maxPrice).toLocaleString('en-IN')}</span></p>
        <input type="range" min={1000} max={50000} step={500} value={filters.maxPrice}
          onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
          className="w-full accent-orange-500" />
        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹1k</span><span>₹50k</span></div>
      </div>
      {(filters.stops !== '' || filters.airlines.length > 0 || Number(filters.maxPrice) < 50000 || filters.departureRange) && (
        <button onClick={() => setFilters({ stops: '', maxPrice: 50000, airlines: [], departureRange: '' })}
          className="w-full text-sm text-orange-600 hover:underline font-medium">Clear filters</button>
      )}
    </aside>
  )
}

export default function MultiCityResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const passengers  = Number(searchParams.get('passengers') || 1)
  const cabin       = searchParams.get('cabin') || 'ECONOMY'
  const specialFare = searchParams.get('specialFare') || 'REGULAR'
  const fareInfo    = SPECIAL_FARES[specialFare] || SPECIAL_FARES.REGULAR

  // Parse segments from URL
  const [segments, setSegments] = useState(() => {
    try { return JSON.parse(decodeURIComponent(searchParams.get('segments') || '[]')) }
    catch { return [] }
  })

  // Per-segment state
  const [flightsBySegment,  setFlightsBySegment]  = useState({})  // { idx: Flight[] }
  const [loadingBySegment,  setLoadingBySegment]  = useState({})
  const [errorBySegment,    setErrorBySegment]    = useState({})
  const [filtersBySegment,  setFiltersBySegment]  = useState({})
  const [sortBySegment,     setSortBySegment]     = useState({})
  const [selectedFlights,   setSelectedFlights]   = useState({})  // { idx: Flight }

  const [activeSegment,  setActiveSegment]  = useState(0)
  const [showSearch,     setShowSearch]     = useState(false)

  function applyDiscount(price) {
    if (!fareInfo.discount) return Number(price)
    if (fareInfo.discount.type === 'PERCENT') return Math.round(Number(price) * (1 - fareInfo.discount.value / 100))
    if (fareInfo.discount.type === 'FLAT')    return Math.max(0, Number(price) - fareInfo.discount.value)
    return Number(price)
  }

  // Fetch flights for a given segment index
  const fetchSegmentFlights = useCallback(async (idx) => {
    const seg = segments[idx]
    if (!seg?.origin || !seg?.destination || !seg?.date) return
    setLoadingBySegment(p => ({ ...p, [idx]: true }))
    setErrorBySegment(p => ({ ...p, [idx]: null }))
    try {
      const res = await flightService.search({ origin: seg.origin, destination: seg.destination, date: seg.date })
      setFlightsBySegment(p => ({ ...p, [idx]: res.data?.flights || [] }))
    } catch {
      setErrorBySegment(p => ({ ...p, [idx]: 'Failed to fetch flights. Please try again.' }))
    } finally {
      setLoadingBySegment(p => ({ ...p, [idx]: false }))
    }
  }, [segments])

  // Fetch active segment on mount / when active segment changes
  useEffect(() => {
    if (!flightsBySegment[activeSegment]) fetchSegmentFlights(activeSegment)
  }, [activeSegment, fetchSegmentFlights])

  function getFilters(idx) {
    return filtersBySegment[idx] || { stops: '', maxPrice: 50000, airlines: [], departureRange: '' }
  }
  function setFilters(idx, val) {
    setFiltersBySegment(p => ({ ...p, [idx]: typeof val === 'function' ? val(getFilters(idx)) : val }))
  }
  function getSort(idx) { return sortBySegment[idx] || 'cheapest' }
  function setSort(idx, v) { setSortBySegment(p => ({ ...p, [idx]: v })) }

  function filterAndSort(list, filt, sort) {
    const filtered = list.filter(f => {
      if (filt.stops !== '' && Number(f.stops) !== Number(filt.stops)) return false
      if (Number(f.price) > Number(filt.maxPrice)) return false
      if (filt.airlines.length > 0 && !filt.airlines.includes(f.airline)) return false
      if (filt.departureRange === 'morning') {
        const h = new Date(f.departureTime).getHours()
        if (!(h >= 6 && h < 12)) return false
      }
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'cheapest')  return applyDiscount(a.price) - applyDiscount(b.price)
      if (sort === 'nonstop')   return a.stops - b.stops
      if (sort === 'departure') return new Date(a.departureTime) - new Date(b.departureTime)
      return 0
    })
  }

  function handleSelectFlight(idx, flight) {
    setSelectedFlights(p => ({ ...p, [idx]: flight }))
    // Auto-advance to next unselected segment
    const nextUnselected = segments.findIndex((_, i) => i > idx && !selectedFlights[i] && i !== idx)
    if (nextUnselected !== -1) setActiveSegment(nextUnselected)
    else if (idx < segments.length - 1) setActiveSegment(idx + 1)
  }

  const allSelected      = segments.length > 0 && segments.every((_, i) => selectedFlights[i])
  const totalFare        = Object.values(selectedFlights).reduce((sum, f) => sum + applyDiscount(f.price) * passengers, 0)
  const totalFareDisplay = Object.values(selectedFlights).reduce((sum, f) => sum + applyDiscount(f.price), 0)

  function handleBookMultiCity() {
    if (!allSelected) return
    const segmentPayload = segments.map((seg, i) => ({
      order:         i + 1,
      origin:        seg.origin,
      destination:   seg.destination,
      date:          seg.date,
      flightId:      selectedFlights[i].id,
      flight:        selectedFlights[i],
      fare:          applyDiscount(selectedFlights[i].price),
    }))
    navigate(ROUTES.FLIGHT_BOOKING, {
      state: {
        isMultiCity:  true,
        mcSegments:   segmentPayload,
        passengers,
        cabin,
        specialFare,
      },
    })
  }

  if (segments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">No multi-city segments found.</p>
        <button onClick={() => navigate(ROUTES.FLIGHTS)} className="mt-4 text-orange-500 hover:underline text-sm">Search Again</button>
      </div>
    )
  }

  const sortTabs = [
    { id: 'cheapest',  label: 'CHEAPEST' },
    { id: 'nonstop',   label: 'NON STOP' },
    { id: 'departure', label: 'DEPARTURE' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Orange top bar */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {!showSearch && (
            <button onClick={() => setShowSearch(true)}
              className="w-full bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-white text-left transition-colors">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full font-bold">Multi City</span>
                {segments.map((s, i) => (
                  <span key={i} className="text-sm text-orange-100">
                    {i > 0 && <span className="text-orange-300 mx-1">·</span>}
                    {s.origin} → {s.destination}
                  </span>
                ))}
                <span className="text-orange-100 text-sm">| {passengers} Traveller{passengers > 1 ? 's' : ''} · {cabin.replace('_', ' ')}</span>
                <span className="ml-auto text-xs underline text-orange-100">Modify ▼</span>
              </div>
            </button>
          )}
          {showSearch && (
            <div className="bg-white rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Modify Search</h3>
                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <FlightSearch
                initialValues={{
                  tripType: 'multi-city',
                  segments,
                  passengers,
                  cabin,
                  specialFare,
                }}
                onSearch={() => setShowSearch(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Segment progress strip */}
      <div className="bg-white border-b border-gray-200 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 min-w-max">
          {segments.map((seg, i) => {
            const done = !!selectedFlights[i]
            const active = activeSegment === i
            return (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSegment(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium ${
                    active   ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' :
                    done     ? 'border-green-300 bg-green-50 text-green-700' :
                    'border-gray-200 bg-white text-gray-500 hover:border-orange-300'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-orange-500 text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span>{seg.origin} → {seg.destination}</span>
                  {done && selectedFlights[i] && (
                    <span className="text-xs font-normal text-green-600 ml-1">
                      ₹{applyDiscount(selectedFlights[i].price).toLocaleString('en-IN')}
                    </span>
                  )}
                </button>
                {i < segments.length - 1 && <div className="w-4 h-px bg-gray-300" />}
              </div>
            )
          })}
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            disabled={!allSelected}
            onClick={handleBookMultiCity}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold rounded-full text-sm transition-colors whitespace-nowrap">
            Book Multi-City
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        {/* Confirmed segment summaries (above active segment) */}
        {segments.some((_, i) => i !== activeSegment && selectedFlights[i]) && (
          <div className="space-y-2">
            {segments.map((seg, i) => {
              if (i === activeSegment || !selectedFlights[i]) return null
              return (
                <SelectedStrip
                  key={i}
                  idx={i}
                  seg={seg}
                  flight={selectedFlights[i]}
                  discountedPrice={applyDiscount(selectedFlights[i].price)}
                  onRemove={() => { setSelectedFlights(p => { const n = { ...p }; delete n[i]; return n }); setActiveSegment(i) }}
                />
              )
            })}
          </div>
        )}

        {/* Active segment */}
        {segments.map((seg, idx) => {
          if (idx !== activeSegment) return null
          const rawFlights = flightsBySegment[idx] || []
          const filt       = getFilters(idx)
          const sort       = getSort(idx)
          const sorted     = filterAndSort(rawFlights, filt, sort)
          const isLoading  = loadingBySegment[idx]
          const segError   = errorBySegment[idx]

          return (
            <div key={idx}>
              {/* Segment header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">
                    Select Flight — {seg.origin} → {seg.destination}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(seg.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{passengers} Traveller{passengers > 1 ? 's' : ''}
                  </p>
                </div>
                {selectedFlights[idx] && (
                  <button
                    onClick={() => { setSelectedFlights(p => { const n = { ...p }; delete n[idx]; return n }) }}
                    className="ml-auto text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-lg">
                    Change selection
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <FilterSidebar flights={rawFlights} filters={filt} setFilters={v => setFilters(idx, v)} />

                <div className="flex-1 min-w-0 space-y-3">
                  {/* Sort tabs */}
                  {!isLoading && rawFlights.length > 0 && (
                    <>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex">
                          {sortTabs.map(tab => {
                            const tabList = tab.id === 'nonstop' ? sorted.filter(f => f.stops === 0) : sorted
                            const cheapest = tabList.length > 0 ? Math.min(...tabList.map(f => applyDiscount(f.price))) : null
                            return (
                              <button key={tab.id} onClick={() => setSort(idx, tab.id)}
                                className={`flex-1 flex flex-col items-center py-3 border-b-2 text-xs transition-colors ${sort === tab.id ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                                <span className="font-bold uppercase">{tab.label}</span>
                                {cheapest != null && <span className={`mt-0.5 font-semibold ${sort === tab.id ? 'text-orange-500' : 'text-gray-400'}`}>₹{cheapest.toLocaleString('en-IN')}</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-gray-800">{sorted.length}</span> flights
                          {sorted.length !== rawFlights.length && <span className="text-orange-500 ml-1">(filtered from {rawFlights.length})</span>}
                        </p>
                        {specialFare !== 'REGULAR' && (
                          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                            {fareInfo.icon} {fareInfo.label}
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {isLoading && <Loader text={`Searching flights for ${seg.origin} → ${seg.destination}…`} />}

                  {!isLoading && segError && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                      <p className="text-red-500">{segError}</p>
                      <button onClick={() => fetchSegmentFlights(idx)} className="mt-3 text-orange-500 hover:underline text-sm">Try again</button>
                    </div>
                  )}

                  {!isLoading && !segError && sorted.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                      <div className="text-5xl mb-3">✈️</div>
                      <h3 className="text-lg font-semibold text-gray-700">No flights found</h3>
                      <p className="text-gray-400 mt-1 text-sm">No flights on this route for the selected date.</p>
                    </div>
                  )}

                  {!isLoading && !segError && sorted.map(f => {
                    const isSelected = selectedFlights[idx]?.id === f.id
                    return (
                      <div key={f.id} className={`relative ${isSelected ? 'ring-2 ring-orange-500 rounded-xl' : ''}`}>
                        {isSelected && (
                          <div className="absolute -top-2 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full z-10">
                            Selected for S{idx + 1}
                          </div>
                        )}
                        <FlightCard
                          flight={f}
                          onSelect={fl => handleSelectFlight(idx, fl)}
                          specialFare={specialFare}
                          discountedPrice={applyDiscount(f.price)}
                          selectLabel={isSelected ? '✓ Selected' : `Select for S${idx + 1}`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Next segment nudge */}
              {selectedFlights[idx] && idx < segments.length - 1 && !selectedFlights[idx + 1] && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setActiveSegment(idx + 1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors">
                    Next: {segments[idx + 1].origin} → {segments[idx + 1].destination} →
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky bottom bar: total fare + Book button */}
      {allSelected && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-500">Multi-City · {segments.length} Segments</p>
                <p className="text-sm font-semibold text-gray-700">
                  {segments.map(s => s.origin).join(' → ')} → {segments[segments.length - 1].destination}
                </p>
              </div>
              <div className="hidden sm:block text-gray-200">|</div>
              <div>
                <p className="text-xs text-gray-500">Total fare ({passengers} traveller{passengers > 1 ? 's' : ''})</p>
                <p className="text-xl font-bold text-orange-600">₹{totalFare.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-xs text-gray-400">
                per person: ₹{totalFareDisplay.toLocaleString('en-IN')}
              </div>
            </div>
            <button
              onClick={handleBookMultiCity}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full text-sm transition-colors whitespace-nowrap shadow-md">
              Book Multi-City →
            </button>
          </div>
        </div>
      )}
      {allSelected && <div className="h-20" />}
    </div>
  )
}
