import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import HotelCard from '../components/hotels/HotelCard'
import HotelFilters from '../components/hotels/HotelFilters'
import Loader from '../components/common/Loader'
import { hotelService } from '../services/hotelService'
import HotelSearch from '../components/hotels/HotelSearch'

const SORT_TABS = [
  { id: 'rating',    label: 'TOP RATED',     icon: '⭐' },
  { id: 'price',     label: 'LOWEST PRICE',  icon: '₹'  },
  { id: 'stars',     label: 'STAR CATEGORY', icon: '🏆' },
]

export default function HotelResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const city     = searchParams.get('city')     || ''
  const checkIn  = searchParams.get('checkIn')  || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests   = searchParams.get('guests')   || 1
  const rooms    = searchParams.get('rooms')    || 1

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1

  const [hotels,     setHotels]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [sortBy,     setSortBy]     = useState('rating')
  const [filters,    setFilters]    = useState({ starRating: [], maxPrice: 100000, minRating: 0, budgetRange: '' })
  const [showSearch, setShowSearch] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!city) return
    let cancelled = false
    setLoading(true)
    setError(null)
    hotelService.search({ city, guests, checkIn, checkOut })
      .then(res => {
        if (!cancelled) setHotels(res.data?.hotels || [])
      })
      .catch(() => {
        if (!cancelled) setError('Failed to fetch hotels. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [city, checkIn, checkOut, guests, retryCount])

  const fetchHotels = useCallback(() => setRetryCount(c => c + 1), [])

  // Client-side filter
  const filtered = hotels.filter(h => {
    const price = Number(h.rooms?.[0]?.pricePerNight || 0)
    if (filters.starRating.length > 0 && !filters.starRating.includes(h.starRating)) return false
    if (price > Number(filters.maxPrice)) return false
    if (filters.minRating > 0 && (h.avgRating || 0) < filters.minRating) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') return (b.avgRating || 0) - (a.avgRating || 0)
    if (sortBy === 'price')  return Number(a.rooms?.[0]?.pricePerNight || 0) - Number(b.rooms?.[0]?.pricePerNight || 0)
    if (sortBy === 'stars')  return b.starRating - a.starRating
    return 0
  })

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  }

  const cheapestPrice = filtered.length > 0
    ? Math.min(...filtered.map(h => Number(h.rooms?.[0]?.pricePerNight || 0)).filter(p => p > 0))
    : null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky orange header */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {!showSearch ? (
            <button onClick={() => setShowSearch(true)}
              className="w-full bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-white text-left transition-colors">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-bold text-lg">🏨 {city}</span>
                <span className="text-orange-100 text-sm">|</span>
                {checkIn && checkOut && (
                  <>
                    <span className="text-orange-100 text-sm">{fmtDate(checkIn)} – {fmtDate(checkOut)}</span>
                    <span className="text-orange-100 text-sm">|</span>
                    <span className="text-orange-100 text-sm">{nights} night{nights !== 1 ? 's' : ''}</span>
                    <span className="text-orange-100 text-sm">|</span>
                  </>
                )}
                <span className="text-orange-100 text-sm">{guests} Guest{guests > 1 ? 's' : ''} · {rooms} Room{rooms > 1 ? 's' : ''}</span>
                <span className="ml-auto text-xs underline text-orange-100">Modify Search ▼</span>
              </div>
            </button>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Modify Search</h3>
                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <HotelSearch initialValues={{ city, checkIn, checkOut, guests, rooms }} onSearch={() => setShowSearch(false)} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-4">

          {/* Sidebar filters */}
          <aside className="hidden lg:block w-60 shrink-0">
            <HotelFilters filters={filters} onChange={setFilters} />
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Sort tabs */}
            {!loading && hotels.length > 0 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex">
                    {SORT_TABS.map(tab => (
                      <button key={tab.id} onClick={() => setSortBy(tab.id)}
                        className={`flex-1 flex flex-col items-center py-3 px-2 border-b-2 text-xs transition-colors ${sortBy === tab.id ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                        <span className="font-bold text-xs uppercase tracking-wide">{tab.label}</span>
                        {tab.id === 'price' && cheapestPrice != null && cheapestPrice > 0 && (
                          <span className={`text-xs mt-0.5 font-semibold ${sortBy === tab.id ? 'text-orange-500' : 'text-gray-400'}`}>
                            from ₹{cheapestPrice.toLocaleString('en-IN')}/night
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{sorted.length}</span> hotels in {city}
                    {filtered.length !== hotels.length && (
                      <span className="text-orange-500 ml-1">(filtered from {hotels.length})</span>
                    )}
                  </p>
                  {checkIn && checkOut && (
                    <p className="text-xs text-gray-400">
                      {fmtDate(checkIn)} – {fmtDate(checkOut)} · {nights} night{nights !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </>
            )}

            {loading && <Loader text="Searching hotels..." />}

            {!loading && error && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="text-red-500 text-lg">{error}</p>
                <button onClick={fetchHotels} className="mt-4 text-orange-500 hover:underline text-sm">Try again</button>
              </div>
            )}

            {!loading && !error && sorted.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">🏨</div>
                <h2 className="text-xl font-semibold text-gray-700">No hotels found</h2>
                <p className="text-gray-400 mt-2">Try a different city or adjust your filters.</p>
              </div>
            )}

            {!loading && !error && sorted.map(h => (
              <HotelCard key={h.id} hotel={h}
                searchParams={{ city, checkIn, checkOut, guests, rooms, nights }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
