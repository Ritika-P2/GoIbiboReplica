import { useState, useRef, useEffect } from 'react'

const AIRPORTS = [
  { code: 'DEL', city: 'Delhi',      name: 'Indira Gandhi International' },
  { code: 'BOM', city: 'Mumbai',     name: 'Chhatrapati Shivaji Maharaj International' },
  { code: 'BLR', city: 'Bangalore',  name: 'Kempegowda International' },
  { code: 'MAA', city: 'Chennai',    name: 'Chennai International' },
  { code: 'HYD', city: 'Hyderabad',  name: 'Rajiv Gandhi International' },
  { code: 'CCU', city: 'Kolkata',    name: 'Netaji Subhas Chandra Bose International' },
  { code: 'GOI', city: 'Goa',        name: 'Goa International (Dabolim)' },
  { code: 'COK', city: 'Kochi',      name: 'Cochin International' },
  { code: 'PNQ', city: 'Pune',       name: 'Pune Airport' },
  { code: 'AMD', city: 'Ahmedabad',  name: 'Sardar Vallabhbhai Patel International' },
  { code: 'JAI', city: 'Jaipur',     name: 'Jaipur International' },
  { code: 'LKO', city: 'Lucknow',    name: 'Chaudhary Charan Singh International' },
  { code: 'ATQ', city: 'Amritsar',   name: 'Sri Guru Ram Dass Jee International' },
  { code: 'SXR', city: 'Srinagar',   name: 'Sheikh ul Alam International' },
  { code: 'IXC', city: 'Chandigarh', name: 'Chandigarh Airport' },
  { code: 'NAG', city: 'Nagpur',     name: 'Dr. Babasaheb Ambedkar International' },
  { code: 'BBI', city: 'Bhubaneswar',name: 'Biju Patnaik International' },
  { code: 'GAU', city: 'Guwahati',   name: 'Lokpriya Gopinath Bordoloi International' },
  { code: 'PAT', city: 'Patna',      name: 'Jay Prakash Narayan Airport' },
  { code: 'VNS', city: 'Varanasi',   name: 'Lal Bahadur Shastri Airport' },
  { code: 'IXB', city: 'Bagdogra',   name: 'Bagdogra Airport' },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International' },
  { code: 'IXZ', city: 'Port Blair', name: 'Veer Savarkar International' },
  { code: 'UDR', city: 'Udaipur',    name: 'Maharana Pratap Airport' },
  { code: 'DED', city: 'Dehradun',   name: 'Jolly Grant Airport' },
]

export default function AirportSearch({ label, value, onChange, placeholder, required }) {
  const [query, setQuery]       = useState(value || '')
  const [open,  setOpen]        = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef(null)
  const inputRef     = useRef(null)

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
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(airport) {
    setQuery(`${airport.city} (${airport.code})`)
    onChange(airport.code)
    setOpen(false)
    setHighlighted(-1)
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      handleSelect(filtered[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function handleChange(e) {
    const v = e.target.value
    setQuery(v)
    onChange(v.toUpperCase().trim())
    setOpen(true)
    setHighlighted(-1)
  }

  return (
    <div className="flex flex-col gap-1 relative" ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
          🔍
        </span>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((airport, i) => (
            <li key={airport.code}
              onMouseDown={() => handleSelect(airport)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${i === highlighted ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-700 font-bold text-xs">{airport.code}</span>
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