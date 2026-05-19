import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CitySearch from '../common/CitySearch'
import { ROUTES } from '../../constants/routes'

function fmtDateGoibibo(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  const mon = d.toLocaleDateString('en-IN', { month: 'short' })
  const yr  = String(d.getFullYear()).slice(2)
  const wkd = d.toLocaleDateString('en-IN', { weekday: 'long' })
  return { primary: `${day} ${mon}'${yr}`, secondary: wkd }
}

export default function HotelSearch({ initialValues = {}, onSearch }) {
  const navigate = useNavigate()
  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [city,            setCity]            = useState(initialValues.city     || '')
  const [checkIn,         setCheckIn]         = useState(initialValues.checkIn  || today)
  const [checkOut,        setCheckOut]        = useState(initialValues.checkOut || tomorrow)
  const [guests,          setGuests]          = useState(Number(initialValues.guests) || 1)
  const [rooms,           setRooms]           = useState(Number(initialValues.rooms)  || 1)
  const [showGuestsPopup, setShowGuestsPopup] = useState(false)

  const checkInRef  = useRef(null)
  const checkOutRef = useRef(null)

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut + 'T00:00:00') - new Date(checkIn + 'T00:00:00')) / 86400000))
    : 1

  const checkInFmt  = fmtDateGoibibo(checkIn)
  const checkOutFmt = fmtDateGoibibo(checkOut)

  function openCheckIn() {
    try { checkInRef.current?.showPicker() } catch (e) { checkInRef.current?.focus() }
  }
  function openCheckOut() {
    try { checkOutRef.current?.showPicker() } catch (e) { checkOutRef.current?.focus() }
  }

  function handleCheckInChange(e) {
    const v = e.target.value
    setCheckIn(v)
    if (v >= checkOut) {
      const d = new Date(v + 'T00:00:00')
      d.setDate(d.getDate() + 1)
      setCheckOut(d.toISOString().split('T')[0])
    }
  }

  function handleSearch() {
    if (!city) return
    const params = new URLSearchParams({ city, checkIn, checkOut, guests, rooms }).toString()
    if (onSearch) onSearch()
    navigate(`${ROUTES.HOTEL_RESULTS}?${params}`)
  }

  return (
    <div className="w-full">
      {/* Search fields row */}
      <div className="flex border border-gray-300 rounded-lg overflow-visible mb-4">

        {/* CITY */}
        <div className="flex-1 min-w-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors relative">
          <p className="text-xs text-gray-500 mb-1">City, Area or Property</p>
          <CitySearch large value={city} onChange={setCity} placeholder="Where to stay?" required />
        </div>

        {/* CHECK-IN */}
        <div className="w-40 shrink-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer select-none relative"
          onClick={openCheckIn}>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 pointer-events-none">
            Check-in <span className="text-gray-400">▼</span>
          </p>
          <p className="text-2xl font-bold text-gray-900 leading-tight pointer-events-none">{checkInFmt?.primary}</p>
          <p className="text-xs text-gray-500 mt-0.5 pointer-events-none">{checkInFmt?.secondary}</p>
          <input
            ref={checkInRef}
            type="date"
            min={today}
            value={checkIn}
            onChange={handleCheckInChange}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}
          />
        </div>

        {/* NIGHTS badge */}
        <div className="w-16 shrink-0 flex items-center justify-center bg-orange-50 border-r border-gray-300">
          <div className="text-center px-1">
            <p className="text-xl font-bold text-orange-600 leading-tight">{nights}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-tight">Night{nights !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* CHECK-OUT */}
        <div className="w-40 shrink-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer select-none relative"
          onClick={openCheckOut}>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 pointer-events-none">
            Check-out <span className="text-gray-400">▼</span>
          </p>
          <p className="text-2xl font-bold text-gray-900 leading-tight pointer-events-none">{checkOutFmt?.primary}</p>
          <p className="text-xs text-gray-500 mt-0.5 pointer-events-none">{checkOutFmt?.secondary}</p>
          <input
            ref={checkOutRef}
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={e => setCheckOut(e.target.value)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}
          />
        </div>

        {/* ROOMS & GUESTS */}
        <div className="w-44 shrink-0 px-4 pt-3 pb-3 hover:bg-gray-50 transition-colors relative cursor-pointer"
          onClick={() => setShowGuestsPopup(p => !p)}>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">Rooms &amp; Guests <span className="text-gray-400">▼</span></p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{rooms} Room{rooms > 1 ? 's' : ''}</p>
          <p className="text-xs text-gray-500 mt-0.5">{guests} Guest{guests > 1 ? 's' : ''}</p>

          {showGuestsPopup && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-5 z-[100] w-72"
              onClick={e => e.stopPropagation()}>
              <h4 className="font-bold text-gray-900 mb-4 text-sm">Rooms &amp; Guests</h4>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-800">Rooms</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setRooms(r => Math.max(1, r - 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-orange-400 font-bold">−</button>
                  <span className="w-4 text-center font-bold text-gray-900">{rooms}</span>
                  <button type="button" onClick={() => setRooms(r => Math.min(10, r + 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-orange-400 font-bold">+</button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Guests</p>
                  <p className="text-xs text-gray-400">Per room</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-orange-400 font-bold">−</button>
                  <span className="w-4 text-center font-bold text-gray-900">{guests}</span>
                  <button type="button" onClick={() => setGuests(g => Math.min(10, g + 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-orange-400 font-bold">+</button>
                </div>
              </div>

              <button type="button" onClick={() => setShowGuestsPopup(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-colors text-sm">
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search button */}
      <div className="flex justify-center">
        <button type="button" onClick={handleSearch}
          disabled={!city}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-base px-20 py-4 rounded-full shadow-lg transition-colors">
          Search Hotels
        </button>
      </div>
    </div>
  )
}
