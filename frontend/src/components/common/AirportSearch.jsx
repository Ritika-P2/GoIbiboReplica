import { useState, useRef, useEffect } from 'react'

const AIRPORTS = [
  { code: 'DEL', city: 'Delhi',               name: 'Indira Gandhi International' },
  { code: 'BOM', city: 'Mumbai',              name: 'Chhatrapati Shivaji Maharaj International' },
  { code: 'BLR', city: 'Bangalore',           name: 'Kempegowda International' },
  { code: 'MAA', city: 'Chennai',             name: 'Chennai International' },
  { code: 'HYD', city: 'Hyderabad',           name: 'Rajiv Gandhi International' },
  { code: 'CCU', city: 'Kolkata',             name: 'Netaji Subhas Chandra Bose International' },
  { code: 'GOI', city: 'Goa',                 name: 'Goa International (Dabolim)' },
  { code: 'COK', city: 'Kochi',               name: 'Cochin International' },
  { code: 'PNQ', city: 'Pune',                name: 'Pune Airport' },
  { code: 'AMD', city: 'Ahmedabad',           name: 'Sardar Vallabhbhai Patel International' },
  { code: 'JAI', city: 'Jaipur',              name: 'Jaipur International' },
  { code: 'LKO', city: 'Lucknow',             name: 'Chaudhary Charan Singh International' },
  { code: 'ATQ', city: 'Amritsar',            name: 'Sri Guru Ram Dass Jee International' },
  { code: 'SXR', city: 'Srinagar',            name: 'Sheikh ul Alam International' },
  { code: 'IXC', city: 'Chandigarh',          name: 'Chandigarh Airport' },
  { code: 'NAG', city: 'Nagpur',              name: 'Dr. Babasaheb Ambedkar International' },
  { code: 'BBI', city: 'Bhubaneswar',         name: 'Biju Patnaik International' },
  { code: 'GAU', city: 'Guwahati',            name: 'Lokpriya Gopinath Bordoloi International' },
  { code: 'PAT', city: 'Patna',               name: 'Jay Prakash Narayan Airport' },
  { code: 'VNS', city: 'Varanasi',            name: 'Lal Bahadur Shastri Airport' },
  { code: 'IXB', city: 'Bagdogra',            name: 'Bagdogra Airport' },
  { code: 'TRV', city: 'Thiruvananthapuram',  name: 'Trivandrum International' },
  { code: 'IXZ', city: 'Port Blair',          name: 'Veer Savarkar International' },
  { code: 'UDR', city: 'Udaipur',             name: 'Maharana Pratap Airport' },
  { code: 'DED', city: 'Dehradun',            name: 'Jolly Grant Airport' },
]

// large=true → Goibibo big-city-name display mode
export default function AirportSearch({ label, value, onChange, placeholder, required, large = false, inputClassName }) {
  const [query,       setQuery]       = useState('')
  const [selected,    setSelected]    = useState(null)
  const [open,        setOpen]        = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [editing,     setEditing]     = useState(false)
  const containerRef = useRef(null)
  const inputRef     = useRef(null)

  // sync selected when value changes externally (e.g. initial values)
  useEffect(() => {
    if (value && value.length <= 4) {
      const found = AIRPORTS.find(a => a.code === value.toUpperCase())
      if (found) { setSelected(found); setQuery('') }
    }
  }, [value])

  const filtered = query.length >= 1
    ? AIRPORTS.filter(a =>
        a.code.toLowerCase().includes(query.toLowerCase()) ||
        a.city.toLowerCase().includes(query.toLowerCase()) ||
        a.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : AIRPORTS.slice(0, 8)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false); setEditing(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(airport) {
    setSelected(airport)
    setQuery('')
    onChange(airport.code)
    setOpen(false)
    setEditing(false)
    setHighlighted(-1)
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown')  { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); handleSelect(filtered[highlighted]) }
    else if (e.key === 'Escape') { setOpen(false); setEditing(false); setQuery('') }
  }

  function handleInputChange(e) {
    setQuery(e.target.value)
    onChange(e.target.value.toUpperCase().trim())
    setOpen(true)
    setHighlighted(-1)
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
        {label && <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>}

        {/* Display area — click to edit */}
        {!editing ? (
          <div onClick={activateEdit} className="cursor-pointer min-h-[56px] flex flex-col justify-center">
            {selected ? (
              <>
                <p className="text-2xl font-bold text-gray-900 leading-tight truncate">{selected.city}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{selected.code}, {selected.name}</p>
              </>
            ) : (
              <p className="text-lg text-gray-400 font-medium">{placeholder || 'City or Airport'}</p>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search city or airport"
            autoComplete="off"
            required={required}
            className="w-full text-lg font-semibold text-gray-900 border-none outline-none bg-transparent py-1 placeholder-gray-400"
          />
        )}

        {open && filtered.length > 0 && (
          <ul className="absolute top-full left-0 z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl w-72 max-h-72 overflow-y-auto">
            {filtered.map((airport, i) => (
              <li key={airport.code}
                onMouseDown={() => handleSelect(airport)}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${i === highlighted ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <span className="text-orange-700 font-bold text-xs">{airport.code}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{airport.city}</p>
                  <p className="text-xs text-gray-500 truncate">{airport.name}</p>
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
          value={selected && !editing ? `${selected.city} (${selected.code})` : query}
          onChange={handleInputChange}
          onFocus={() => { setEditing(true); setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={inputClassName || "w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">🔍</span>
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((airport, i) => (
            <li key={airport.code}
              onMouseDown={() => handleSelect(airport)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${i === highlighted ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-orange-700 font-bold text-xs">{airport.code}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{airport.city}</p>
                <p className="text-xs text-gray-500 truncate">{airport.name}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
