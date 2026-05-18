import { useState, useRef, useEffect } from 'react'

const STATIONS = [
  { code: 'NDLS', name: 'New Delhi',            city: 'Delhi' },
  { code: 'BCT',  name: 'Mumbai Central',        city: 'Mumbai' },
  { code: 'MMCT', name: 'Mumbai CSMT',           city: 'Mumbai' },
  { code: 'HWH',  name: 'Howrah Junction',       city: 'Kolkata' },
  { code: 'SBC',  name: 'KSR Bangalore City',    city: 'Bangalore' },
  { code: 'MAS',  name: 'Chennai Central',       city: 'Chennai' },
  { code: 'TVC',  name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram' },
  { code: 'PUNE', name: 'Pune Junction',         city: 'Pune' },
  { code: 'SC',   name: 'Secunderabad Junction', city: 'Hyderabad' },
  { code: 'ADI',  name: 'Ahmedabad Junction',    city: 'Ahmedabad' },
  { code: 'JP',   name: 'Jaipur Junction',       city: 'Jaipur' },
  { code: 'LKO',  name: 'Lucknow Charbagh',      city: 'Lucknow' },
  { code: 'AGC',  name: 'Agra Cantonment',       city: 'Agra' },
  { code: 'BSB',  name: 'Varanasi Junction',     city: 'Varanasi' },
  { code: 'PNBE', name: 'Patna Junction',        city: 'Patna' },
  { code: 'GHY',  name: 'Guwahati',              city: 'Guwahati' },
  { code: 'BBS',  name: 'Bhubaneswar',           city: 'Bhubaneswar' },
  { code: 'NZM',  name: 'Hazrat Nizamuddin',     city: 'Delhi' },
  { code: 'CDG',  name: 'Chandigarh',            city: 'Chandigarh' },
  { code: 'UDZ',  name: 'Udaipur City',          city: 'Udaipur' },
]

export default function StationSearch({ label, value, onChange, placeholder, required }) {
  const [query,       setQuery]       = useState(value || '')
  const [open,        setOpen]        = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef(null)

  const filtered = query.length >= 1
    ? STATIONS.filter(s =>
        s.code.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.city.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : STATIONS.slice(0, 8)

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleSelect(station) {
    setQuery(`${station.name} (${station.code})`)
    onChange(station.code)
    setOpen(false)
    setHighlighted(-1)
  }

  function handleChange(e) {
    const v = e.target.value
    setQuery(v)
    onChange(v.toUpperCase().trim())
    setOpen(true)
    setHighlighted(-1)
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); handleSelect(filtered[highlighted]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="flex flex-col gap-1 relative" ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">🔍</span>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((station, i) => (
            <li key={station.code}
              onMouseDown={() => handleSelect(station)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${i === highlighted ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-green-700 font-bold text-xs">{station.code}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{station.name}</p>
                <p className="text-xs text-gray-500">{station.city}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}