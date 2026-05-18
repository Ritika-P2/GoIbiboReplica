import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AirportSearch from '../common/AirportSearch'
import { ROUTES } from '../../constants/routes'

const SPECIAL_FARES = [
  { id: 'REGULAR',        label: 'Regular',          icon: '✈️' },
  { id: 'STUDENT',        label: 'Student',           icon: '🎓' },
  { id: 'ARMED_FORCES',   label: 'Armed Forces',      icon: '🪖' },
  { id: 'GST',            label: 'Have a GST number?', icon: '🧾' },
  { id: 'SENIOR_CITIZEN', label: 'Senior Citizen',    icon: '👴' },
  { id: 'DOCTOR_NURSE',   label: 'Doctor and Nurses', icon: '🩺' },
]

const CABIN_OPTS = [
  { value: 'ECONOMY',         label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS',        label: 'Business' },
  { value: 'FIRST',           label: 'First Class' },
]

export default function FlightSearch({ compact = false, initialValues = {} }) {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const [tripType, setTripType]     = useState(initialValues.tripType || 'one-way')
  const [origin, setOrigin]         = useState(initialValues.origin || '')
  const [destination, setDest]      = useState(initialValues.destination || '')
  const [date, setDate]             = useState(initialValues.date || today)
  const [returnDate, setReturnDate] = useState(initialValues.returnDate || '')
  const [adults, setAdults]         = useState(Number(initialValues.passengers) || 1)
  const [cabin, setCabin]           = useState(initialValues.cabin || 'ECONOMY')
  const [specialFare, setSF]        = useState(initialValues.specialFare || 'REGULAR')
  const [showPax, setShowPax]       = useState(false)

  function swap() {
    const tmp = origin; setOrigin(destination); setDest(tmp)
  }

  function handleSearch(e) {
    e?.preventDefault()
    const params = new URLSearchParams({
      origin, destination, date, passengers: adults, cabin, specialFare,
      ...(tripType === 'round-trip' && returnDate ? { returnDate } : {}),
    }).toString()
    navigate(`${ROUTES.FLIGHT_RESULTS}?${params}`)
  }

  const cabinLabel = CABIN_OPTS.find(c => c.value === cabin)?.label || cabin

  return (
    <div className={compact ? '' : ''}>
      {/* Trip type tabs */}
      {!compact && (
        <div className="flex gap-1 mb-4">
          {[{ v: 'one-way', l: 'One Way' }, { v: 'round-trip', l: 'Round Trip' }, { v: 'multi-city', l: 'Multi City' }].map(t => (
            <button key={t.v} type="button" onClick={() => setTripType(t.v)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${tripType === t.v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
              {t.l}
            </button>
          ))}
        </div>
      )}

      {/* Main search row */}
      <form onSubmit={handleSearch}>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden divide-x divide-gray-300">

          {/* FROM */}
          <div className="flex-1 min-w-0 px-4 py-3 bg-white hover:bg-blue-50 transition-colors">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">From</p>
            <AirportSearch value={origin} onChange={setOrigin} placeholder="City or Airport" inputClassName="text-base font-bold text-gray-900 bg-transparent border-none outline-none p-0 w-full placeholder-gray-400" />
          </div>

          {/* SWAP */}
          <button type="button" onClick={swap}
            className="w-10 shrink-0 flex items-center justify-center bg-white hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-colors">
            ⇌
          </button>

          {/* TO */}
          <div className="flex-1 min-w-0 px-4 py-3 bg-white hover:bg-blue-50 transition-colors">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">To</p>
            <AirportSearch value={destination} onChange={setDest} placeholder="City or Airport" inputClassName="text-base font-bold text-gray-900 bg-transparent border-none outline-none p-0 w-full placeholder-gray-400" />
          </div>

          {/* DEPART */}
          <div className="w-36 shrink-0 px-4 py-3 bg-white hover:bg-blue-50 transition-colors">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Depart</p>
            <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} required
              className="text-sm font-bold text-gray-900 bg-transparent border-none outline-none p-0 w-full" />
          </div>

          {/* RETURN */}
          <div className="w-36 shrink-0 px-4 py-3 bg-white hover:bg-blue-50 transition-colors cursor-pointer relative"
            onClick={() => tripType === 'one-way' && setTripType('round-trip')}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Return</p>
            {tripType === 'round-trip' ? (
              <input type="date" min={date} value={returnDate} onChange={e => setReturnDate(e.target.value)}
                className="text-sm font-bold text-gray-900 bg-transparent border-none outline-none p-0 w-full" />
            ) : (
              <p className="text-sm text-blue-500 font-medium">Select Return</p>
            )}
          </div>

          {/* PASSENGERS & CLASS */}
          <div className="w-44 shrink-0 px-4 py-3 bg-white hover:bg-blue-50 transition-colors relative cursor-pointer"
            onClick={() => setShowPax(p => !p)}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Passengers & Class</p>
            <p className="text-sm font-bold text-gray-900 truncate">{adults} Adult{adults > 1 ? 's' : ''}, {cabinLabel}</p>
            {showPax && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 w-72"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-700">Adults</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setAdults(a => Math.max(1, a - 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-sm">−</button>
                    <span className="w-4 text-center font-bold text-gray-900">{adults}</span>
                    <button type="button" onClick={() => setAdults(a => Math.min(9, a + 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-sm">+</button>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Cabin Class</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CABIN_OPTS.map(c => (
                      <button key={c.value} type="button" onClick={() => setCabin(c.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${cabin === c.value ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => setShowPax(false)}
                  className="w-full mt-2 bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600">
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <button type="submit"
            className="w-28 shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wider px-4 transition-colors">
            Search
          </button>
        </div>

        {/* Fare Type */}
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 mr-1">Fare Type:</span>
          {SPECIAL_FARES.map(sf => (
            <label key={sf.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${specialFare === sf.id ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-300 bg-white text-gray-600 hover:border-orange-300'}`}>
              <input type="radio" name="specialFare" value={sf.id} checked={specialFare === sf.id}
                onChange={() => setSF(sf.id)} className="sr-only" />
              <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${specialFare === sf.id ? 'border-orange-500' : 'border-gray-400'}`}>
                {specialFare === sf.id && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block" />}
              </span>
              {sf.label}
            </label>
          ))}
        </div>
      </form>
    </div>
  )
}
