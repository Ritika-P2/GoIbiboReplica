import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { trainService } from '../services/trainService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'

const CLASS_LABELS = { SL: 'Sleeper', '3A': 'AC 3 Tier', '2A': 'AC 2 Tier', '1A': 'AC First', CC: 'Chair Car' }
const CLASS_COLORS = {
  SL:  'bg-blue-50 text-blue-700 border-blue-200',
  '3A':'bg-purple-50 text-purple-700 border-purple-200',
  '2A':'bg-indigo-50 text-indigo-700 border-indigo-200',
  '1A':'bg-yellow-50 text-yellow-700 border-yellow-200',
  CC:  'bg-green-50 text-green-700 border-green-200',
}

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDur(mins) {
  const h = Math.floor(mins / 60), m = mins % 60
  return `${h}h ${m}m`
}

export default function TrainResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const origin      = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date        = searchParams.get('date') || ''
  const trainClass  = searchParams.get('trainClass') || ''

  const [trains,  setTrains]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [sortBy,  setSortBy]  = useState('departure')

  const fetchTrains = useCallback(async () => {
    if (!origin || !destination || !date) return
    setLoading(true)
    setError(null)
    try {
      const params = { origin, destination, date, ...(trainClass ? { trainClass } : {}) }
      const res = await trainService.search(params)
      setTrains(res.data.trains || [])
    } catch {
      setError('Failed to fetch trains. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [origin, destination, date, trainClass])

  useEffect(() => { fetchTrains() }, [fetchTrains])

  const sorted = [...trains].sort((a, b) => {
    if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime)
    if (sortBy === 'duration')  return a.duration - b.duration
    if (sortBy === 'seats')     return b.availableSeats - a.availableSeats
    return 0
  })

  const fmtDate = date
    ? new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  if (!origin || !destination || !date) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">🚆</div>
        <h2 className="text-xl font-semibold text-gray-700">No search criteria</h2>
        <p className="text-gray-400 mt-2 mb-6">Please go back and enter your journey details.</p>
        <Button onClick={() => navigate(ROUTES.TRAINS)}>Search Trains</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{origin} → {destination}</h1>
        <p className="text-gray-500 mt-1">
          {fmtDate}
          {trainClass ? ` · ${CLASS_LABELS[trainClass] || trainClass}` : ' · All Classes'}
        </p>
      </div>

      {/* Sort bar */}
      {!loading && trains.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{trains.length} train{trains.length !== 1 ? 's' : ''} found</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            {[{ k: 'departure', l: 'Departure' }, { k: 'duration', l: 'Duration' }, { k: 'seats', l: 'Availability' }].map(s => (
              <button key={s.k} onClick={() => setSortBy(s.k)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${sortBy === s.k ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <Loader text="Searching trains..." />}

      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={fetchTrains} className="mt-4 text-green-600 hover:underline text-sm">Try again</button>
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🚆</div>
          <h2 className="text-xl font-semibold text-gray-700">No trains found</h2>
          <p className="text-gray-400 mt-2 mb-6">Try a different date or route.</p>
          <Button onClick={() => navigate(ROUTES.TRAINS)}>Modify Search</Button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {sorted.map(train => {
            const classes = train.classes && typeof train.classes === 'object' ? train.classes : {}
            const classKeys = Object.keys(classes)
            const cheapestClass = classKeys.reduce((min, k) =>
              !min || classes[k].price < classes[min].price ? k : min, null)

            return (
              <div key={train.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                {/* Train header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                  {/* Train name + number */}
                  <div className="sm:w-56 shrink-0">
                    <p className="font-bold text-gray-900">{train.trainName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">#{train.trainNumber}</p>
                    <span className={`inline-flex mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${train.availableSeats > 50 ? 'bg-green-100 text-green-700' : train.availableSeats > 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {train.availableSeats} seats available
                    </span>
                  </div>

                  {/* Route + timing */}
                  <div className="flex flex-1 items-center gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{fmt(train.departureTime)}</p>
                      <p className="text-sm font-medium text-gray-600">{train.origin}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-xs text-gray-400">{fmtDur(train.duration)}</p>
                      <div className="relative w-full flex items-center">
                        <div className="flex-1 h-px bg-gray-300" />
                        <span className="mx-2 text-lg">🚆</span>
                        <div className="flex-1 h-px bg-gray-300" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{fmt(train.arrivalTime)}</p>
                      <p className="text-sm font-medium text-gray-600">{train.destination}</p>
                    </div>
                  </div>

                  {/* Starting price */}
                  {cheapestClass && (
                    <div className="sm:w-32 text-right shrink-0">
                      <p className="text-xs text-gray-400">Starts from</p>
                      <p className="text-2xl font-bold text-green-600">₹{classes[cheapestClass].price}</p>
                      <p className="text-xs text-gray-400">{CLASS_LABELS[cheapestClass] || cheapestClass}</p>
                    </div>
                  )}
                </div>

                {/* Class options with Book buttons */}
                {classKeys.length > 0 && (
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Select Class & Book</p>
                    <div className="flex flex-wrap gap-2">
                      {classKeys.map(cls => (
                        <button key={cls}
                          onClick={() => navigate(ROUTES.TRAIN_BOOKING, {
                            state: { train, selectedClass: cls, classPrice: classes[cls].price, classSeats: classes[cls].seats, date }
                          })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:shadow-sm hover:scale-105 ${CLASS_COLORS[cls] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          <span>{CLASS_LABELS[cls] || cls}</span>
                          <span className="font-bold">₹{classes[cls].price}</span>
                          <span className="opacity-60">({classes[cls].seats} seats)</span>
                          <span className="ml-1 text-current opacity-80">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}