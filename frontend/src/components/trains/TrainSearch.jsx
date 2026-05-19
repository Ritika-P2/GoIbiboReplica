import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import StationSearch from '../common/StationSearch'
import { ROUTES } from '../../constants/routes'

const TRAIN_CLASSES = [
  { value: '',   label: 'All Classes' },
  { value: 'SL', label: 'Sleeper (SL)' },
  { value: '3A', label: 'AC 3 Tier (3A)' },
  { value: '2A', label: 'AC 2 Tier (2A)' },
  { value: '1A', label: 'AC First Class (1A)' },
  { value: 'CC', label: 'Chair Car (CC)' },
  { value: 'EC', label: 'Exec Chair Car (EC)' },
]

const QUOTAS = [
  { value: 'GN', label: 'General' },
  { value: 'LD', label: 'Ladies' },
  { value: 'TQ', label: 'Tatkal' },
  { value: 'PT', label: 'Premium Tatkal' },
  { value: 'SS', label: 'Senior Citizen' },
  { value: 'HH', label: 'Divyaang' },
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

export default function TrainSearch({ initialValues = {}, onSearch }) {
  const navigate = useNavigate()
  const today    = new Date().toISOString().split('T')[0]

  const [origin,     setOrigin]     = useState(initialValues.origin      || '')
  const [destination, setDest]      = useState(initialValues.destination || '')
  const [date,       setDate]       = useState(initialValues.date        || today)
  const [trainClass, setTrainClass] = useState(initialValues.trainClass  || '')
  const [quota,      setQuota]      = useState(initialValues.quota       || 'GN')

  const dateRef = useRef(null)
  const dateFmt = fmtDateGoibibo(date)

  function swap() {
    const t = origin
    setOrigin(destination)
    setDest(t)
  }

  function openDate() {
    try { dateRef.current?.showPicker() } catch (e) { dateRef.current?.focus() }
  }

  function handleSearch() {
    if (!origin || !destination) return
    const params = new URLSearchParams({
      origin, destination, date,
      ...(trainClass ? { trainClass } : {}),
      quota,
    }).toString()
    if (onSearch) onSearch()
    navigate(`${ROUTES.TRAIN_RESULTS}?${params}`)
  }

  return (
    <div className="w-full">
      <div className="flex border border-gray-300 rounded-lg overflow-visible mb-4">

        {/* FROM */}
        <div className="flex-1 min-w-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors relative">
          <p className="text-xs text-gray-500 mb-1">From</p>
          <StationSearch large value={origin} onChange={setOrigin} placeholder="From Station" required />
        </div>

        {/* SWAP */}
        <button type="button" onClick={swap}
          className="w-10 shrink-0 flex items-center justify-center bg-white border-r border-gray-300 hover:bg-orange-50 text-gray-400 hover:text-orange-500 text-lg transition-colors z-10">
          ⇌
        </button>

        {/* TO */}
        <div className="flex-1 min-w-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors relative">
          <p className="text-xs text-gray-500 mb-1">To</p>
          <StationSearch large value={destination} onChange={setDest} placeholder="To Station" required />
        </div>

        {/* DATE */}
        <div className="w-44 shrink-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer select-none relative"
          onClick={openDate}>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 pointer-events-none">
            Journey Date <span className="text-gray-400">▼</span>
          </p>
          <p className="text-2xl font-bold text-gray-900 leading-tight pointer-events-none">{dateFmt?.primary}</p>
          <p className="text-xs text-gray-500 mt-0.5 pointer-events-none">{dateFmt?.secondary}</p>
          <input
            ref={dateRef}
            type="date"
            min={today}
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}
          />
        </div>

        {/* CLASS */}
        <div className="w-44 shrink-0 px-4 pt-3 pb-3 border-r border-gray-300 hover:bg-gray-50 transition-colors">
          <p className="text-xs text-gray-500 mb-1">Class</p>
          <select
            value={trainClass}
            onChange={e => setTrainClass(e.target.value)}
            className="w-full text-base font-bold text-gray-900 border-none outline-none bg-transparent cursor-pointer mt-1">
            {TRAIN_CLASSES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* QUOTA */}
        <div className="w-40 shrink-0 px-4 pt-3 pb-3 hover:bg-gray-50 transition-colors">
          <p className="text-xs text-gray-500 mb-1">Quota</p>
          <select
            value={quota}
            onChange={e => setQuota(e.target.value)}
            className="w-full text-base font-bold text-gray-900 border-none outline-none bg-transparent cursor-pointer mt-1">
            {QUOTAS.map(q => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={handleSearch}
          disabled={!origin || !destination}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-base px-20 py-4 rounded-full shadow-lg transition-colors">
          Search Trains
        </button>
      </div>
    </div>
  )
}
