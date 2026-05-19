import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AirportSearch from '../common/AirportSearch'
import { ROUTES } from '../../constants/routes'

const SPECIAL_FARES = [
  { id: 'REGULAR',        label: 'Regular',          sub: 'Regular fares'           },
  { id: 'STUDENT',        label: 'Student',           sub: 'Extra discounts/baggage' },
  { id: 'ARMED_FORCES',   label: 'Armed Forces',      sub: 'Up to ₹ 600 off'        },
  { id: 'SENIOR_CITIZEN', label: 'Senior Citizen',    sub: 'Up to ₹ 600 off'        },
  { id: 'DOCTOR_NURSE',   label: 'Doctor and Nurses', sub: 'Up to ₹ 600 off'        },
]

const CABINS = [
  { value: 'ECONOMY',         label: 'Economy'        },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy'},
  { value: 'BUSINESS',        label: 'Business'       },
  { value: 'FIRST',           label: 'First Class'    },
]

function fmtDateGoibibo(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  const mon = d.toLocaleDateString('en-IN', { month: 'short' })
  const yr  = String(d.getFullYear()).slice(2)
  const wkd = d.toLocaleDateString('en-IN', { weekday: 'long' })
  return { primary: `${day} ${mon}'${yr}`, secondary: wkd }
}

export default function FlightSearch({ initialValues = {}, onSearch }) {
  const navigate = useNavigate()
  const today    = new Date().toISOString().split('T')[0]

  const [tripType,    setTripType]    = useState(initialValues.tripType    || 'one-way')
  const [origin,      setOrigin]      = useState(initialValues.origin      || '')
  const [destination, setDest]        = useState(initialValues.destination || '')
  const [date,        setDate]        = useState(initialValues.date        || today)
  const [returnDate,  setReturnDate]  = useState(initialValues.returnDate  || '')
  const [adults,      setAdults]      = useState(Number(initialValues.passengers) || 1)
  const [cabin,       setCabin]       = useState(initialValues.cabin       || 'ECONOMY')
  const [specialFare, setSF]          = useState(initialValues.specialFare || 'REGULAR')
  const [showPax,     setShowPax]     = useState(false)

  const departureDateRef = useRef(null)
  const returnDateRef    = useRef(null)

  function swap() { const t = origin; setOrigin(destination); setDest(t) }

  function openDeparture() {
    try { departureDateRef.current?.showPicker() } catch (e) { departureDateRef.current?.focus() }
  }

  function openReturn() {
    if (tripType === 'one-way') setTripType('round-trip')
    setTimeout(() => {
      try { returnDateRef.current?.showPicker() } catch (e) { returnDateRef.current?.focus() }
    }, 0)
  }

  function handleSearch(e) {
    e?.preventDefault()
    if (!origin || !destination || !date) return
    const params = new URLSearchParams({
      origin, destination, date, passengers: adults, cabin, specialFare,
      ...(tripType === 'round-trip' && returnDate ? { returnDate } : {}),
    }).toString()
    if (onSearch) onSearch()
    navigate(`${ROUTES.FLIGHT_RESULTS}?${params}`)
  }

  const cabinLabel   = CABINS.find(c => c.value === cabin)?.label || cabin
  const departureFmt = fmtDateGoibibo(date)
  const returnFmt    = returnDate ? fmtDateGoibibo(returnDate) : null

  return (
    <div className="w-full">
      {/* Row 1: Trip type */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {[{ v: 'one-way', l: 'Oneway' }, { v: 'round-trip', l: 'Round Trip' }, { v: 'multi-city', l: 'Multi City' }].map(t => (
            <label key={t.v} className="flex items-center gap-2 cursor-pointer select-none">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${tripType === t.v ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                {tripType === t.v && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <input type="radio" value={t.v} checked={tripType === t.v} onChange={() => setTripType(t.v)} className="sr-only" />
              <span className={`text-sm font-semibold ${tripType === t.v ? 'text-blue-600' : 'text-gray-700'}`}>{t.l}</span>
            </label>
          ))}
        </div>
        <span className="text-sm text-gray-500 hidden sm:block">Book International and Domestic Flights</span>
      </div>

      {/* Row 2: Search fields */}
      <div className="flex border border-gray-300 rounded-lg overflow-visible mb-4">

        {/* FROM */}
        <div className="flex-1 min-w-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors relative">
          <p className="text-xs text-gray-500 mb-1">From</p>
          <AirportSearch large value={origin} onChange={setOrigin} placeholder="From Where?" required />
        </div>

        {/* SWAP */}
        <button type="button" onClick={swap}
          className="w-10 shrink-0 flex items-center justify-center bg-white border-r border-gray-300 hover:bg-orange-50 text-gray-400 hover:text-orange-500 text-lg transition-colors z-10">
          ⇌
        </button>

        {/* TO */}
        <div className="flex-1 min-w-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors relative">
          <p className="text-xs text-gray-500 mb-1">To</p>
          <AirportSearch large value={destination} onChange={setDest} placeholder="Where To?" required />
        </div>

        {/* DEPARTURE */}
        <div className="w-40 shrink-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer select-none relative"
          onClick={openDeparture}>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 pointer-events-none">
            Departure <span className="text-gray-400">▼</span>
          </p>
          <p className="text-2xl font-bold text-gray-900 leading-tight pointer-events-none">{departureFmt?.primary}</p>
          <p className="text-xs text-gray-500 mt-0.5 pointer-events-none">{departureFmt?.secondary}</p>
          <input
            ref={departureDateRef}
            type="date"
            min={today}
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}
          />
        </div>

        {/* RETURN */}
        <div className="w-44 shrink-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer select-none relative"
          onClick={openReturn}>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 pointer-events-none">
            Return <span className="text-gray-400">▼</span>
          </p>
          {returnFmt ? (
            <>
              <p className="text-2xl font-bold text-gray-900 leading-tight pointer-events-none">{returnFmt.primary}</p>
              <p className="text-xs text-gray-500 mt-0.5 pointer-events-none">{returnFmt.secondary}</p>
            </>
          ) : (
            <p className="text-sm text-blue-500 font-medium leading-snug mt-1 pointer-events-none">
              Tap to add a return<br/>date for bigger discounts
            </p>
          )}
          <input
            ref={returnDateRef}
            type="date"
            min={date}
            value={returnDate}
            onChange={e => setReturnDate(e.target.value)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}
          />
        </div>

        {/* TRAVELLERS & CLASS */}
        <div className="w-48 shrink-0 px-4 pt-3 pb-3 hover:bg-gray-50 transition-colors relative cursor-pointer"
          onClick={() => setShowPax(p => !p)}>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">Travellers &amp; Class <span className="text-gray-400">▼</span></p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{adults} Traveller{adults > 1 ? 's' : ''}</p>
          <p className="text-xs text-gray-500 mt-0.5">{cabinLabel}</p>

          {showPax && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-5 z-[100] w-72"
              onClick={e => e.stopPropagation()}>
              <h4 className="font-bold text-gray-900 mb-4 text-sm">Travellers</h4>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Adults</p>
                  <p className="text-xs text-gray-400">12 years and above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setAdults(a => Math.max(1, a - 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-orange-400 font-bold">−</button>
                  <span className="w-4 text-center font-bold text-gray-900 text-base">{adults}</span>
                  <button type="button" onClick={() => setAdults(a => Math.min(9, a + 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-orange-400 font-bold">+</button>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Cabin Class</h4>
              <div className="grid grid-cols-2 gap-2">
                {CABINS.map(c => (
                  <button key={c.value} type="button" onClick={() => setCabin(c.value)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border-2 transition-colors ${cabin === c.value ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setShowPax(false)}
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-colors text-sm">
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Special Fares */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wide whitespace-nowrap">Special<br/>Fares</span>
        {SPECIAL_FARES.map(sf => (
          <button key={sf.id} type="button" onClick={() => setSF(sf.id)}
            className={`flex flex-col items-start px-4 py-2 rounded border transition-all min-w-[100px] ${specialFare === sf.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-300'}`}>
            <span className={`text-sm font-bold leading-tight ${specialFare === sf.id ? 'text-blue-700' : 'text-gray-800'}`}>{sf.label}</span>
            <span className={`text-xs mt-0.5 ${specialFare === sf.id ? 'text-blue-500' : 'text-gray-500'}`}>{sf.sub}</span>
          </button>
        ))}
      </div>

      {/* Row 4: SEARCH button */}
      <div className="flex justify-center">
        <button type="button" onClick={handleSearch}
          disabled={!origin || !destination}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-base px-20 py-4 rounded-full shadow-lg transition-colors">
          Search
        </button>
      </div>
    </div>
  )
}
