import { useState, useRef, useEffect } from 'react'

const CITIES = [
  { name: 'Mumbai',        state: 'Maharashtra',      icon: '🌆' },
  { name: 'Delhi',         state: 'Delhi',            icon: '🏛️' },
  { name: 'Bangalore',     state: 'Karnataka',        icon: '🌿' },
  { name: 'Hyderabad',     state: 'Telangana',        icon: '🕌' },
  { name: 'Chennai',       state: 'Tamil Nadu',       icon: '🏖️' },
  { name: 'Kolkata',       state: 'West Bengal',      icon: '🌉' },
  { name: 'Goa',           state: 'Goa',              icon: '🏝️' },
  { name: 'Jaipur',        state: 'Rajasthan',        icon: '🏰' },
  { name: 'Udaipur',       state: 'Rajasthan',        icon: '🛶' },
  { name: 'Kochi',         state: 'Kerala',           icon: '⛵' },
  { name: 'Pune',          state: 'Maharashtra',      icon: '🏙️' },
  { name: 'Ahmedabad',     state: 'Gujarat',          icon: '🏗️' },
  { name: 'Agra',          state: 'Uttar Pradesh',    icon: '🕌' },
  { name: 'Varanasi',      state: 'Uttar Pradesh',    icon: '🙏' },
  { name: 'Amritsar',      state: 'Punjab',           icon: '⭐' },
  { name: 'Manali',        state: 'Himachal Pradesh', icon: '🏔️' },
  { name: 'Shimla',        state: 'Himachal Pradesh', icon: '🌨️' },
  { name: 'Darjeeling',    state: 'West Bengal',      icon: '🍵' },
  { name: 'Mysuru',        state: 'Karnataka',        icon: '🏯' },
  { name: 'Pondicherry',   state: 'Puducherry',       icon: '🌊' },
  { name: 'Coorg',         state: 'Karnataka',        icon: '☕' },
  { name: 'Ooty',          state: 'Tamil Nadu',       icon: '🌸' },
  { name: 'Munnar',        state: 'Kerala',           icon: '🌱' },
  { name: 'Jodhpur',       state: 'Rajasthan',        icon: '🔵' },
  { name: 'Pushkar',       state: 'Rajasthan',        icon: '🐪' },
  { name: 'Rishikesh',     state: 'Uttarakhand',      icon: '🏄' },
  { name: 'Dehradun',      state: 'Uttarakhand',      icon: '🌲' },
  { name: 'Srinagar',      state: 'J&K',              icon: '❄️' },
  { name: 'Chandigarh',    state: 'Punjab',           icon: '🌳' },
  { name: 'Lucknow',       state: 'Uttar Pradesh',    icon: '🏺' },
  { name: 'Bhopal',        state: 'Madhya Pradesh',   icon: '🏞️' },
  { name: 'Indore',        state: 'Madhya Pradesh',   icon: '🍽️' },
  { name: 'Nagpur',        state: 'Maharashtra',      icon: '🍊' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh',   icon: '🌊' },
  { name: 'Bhubaneswar',   state: 'Odisha',           icon: '🛕' },
  { name: 'Guwahati',      state: 'Assam',            icon: '🌿' },
  { name: 'Port Blair',    state: 'Andaman & Nicobar',icon: '🐠' },
]

export default function CitySearch({ label, value, onChange, placeholder, required, large = false }) {
  const [query,        setQuery]        = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [open,         setOpen]         = useState(false)
  const [highlighted,  setHighlighted]  = useState(-1)
  const [editing,      setEditing]      = useState(false)
  const containerRef = useRef(null)
  const inputRef     = useRef(null)

  useEffect(() => {
    if (value) {
      const found = CITIES.find(c => c.name.toLowerCase() === value.toLowerCase())
      if (found) { setSelectedCity(found); setQuery('') }
    }
  }, [value])

  const filtered = query.length >= 1
    ? CITIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.state.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : CITIES.slice(0, 8)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false); setEditing(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(city) {
    setSelectedCity(city)
    setQuery('')
    onChange(city.name)
    setOpen(false)
    setEditing(false)
    setHighlighted(-1)
  }

  function handleChange(e) {
    const v = e.target.value
    setQuery(v)
    onChange(v)
    setOpen(true)
    setHighlighted(-1)
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown')  { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); handleSelect(filtered[highlighted]) }
    else if (e.key === 'Escape') { setOpen(false); setEditing(false); setQuery('') }
  }

  function activateEdit() {
    setEditing(true)
    setOpen(true)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  // ── Large / Goibibo mode ──────────────────────────────────────
  if (large) {
    return (
      <div className="relative w-full" ref={containerRef}>
        {!editing ? (
          <div onClick={activateEdit} className="cursor-pointer min-h-[56px] flex flex-col justify-center">
            {selectedCity ? (
              <>
                <p className="text-2xl font-bold text-gray-900 leading-tight truncate">{selectedCity.name}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{selectedCity.state}</p>
              </>
            ) : (
              <p className="text-lg text-gray-400 font-medium">{placeholder || 'City or Area'}</p>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search city or area"
            autoComplete="off"
            required={required}
            className="w-full text-lg font-semibold text-gray-900 border-none outline-none bg-transparent py-1 placeholder-gray-400"
          />
        )}

        {open && filtered.length > 0 && (
          <ul className="absolute top-full left-0 z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl w-72 max-h-72 overflow-y-auto">
            {filtered.map((city, i) => (
              <li key={city.name}
                onMouseDown={() => handleSelect(city)}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${i === highlighted ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">{city.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{city.name}</p>
                  <p className="text-xs text-gray-500">{city.state}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  // ── Compact / default mode ────────────────────────────────────
  return (
    <div className="flex flex-col gap-1 relative" ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedCity && !editing ? selectedCity.name : query}
          onChange={handleChange}
          onFocus={() => { setEditing(true); setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">🔍</span>
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((city, i) => (
            <li key={city.name}
              onMouseDown={() => handleSelect(city)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${i === highlighted ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
              <span className="text-xl shrink-0">{city.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{city.name}</p>
                <p className="text-xs text-gray-500">{city.state}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
