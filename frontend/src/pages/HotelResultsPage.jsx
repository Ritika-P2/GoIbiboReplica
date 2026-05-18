import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import HotelCard from '../components/hotels/HotelCard'
import HotelFilters from '../components/hotels/HotelFilters'
import Loader from '../components/common/Loader'
import { hotelService } from '../services/hotelService'

export default function HotelResultsPage() {
  const [searchParams] = useSearchParams()

  const city     = searchParams.get('city') || ''
  const checkIn  = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests   = searchParams.get('guests') || 1

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1

  const [hotels,  setHotels]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [sortBy,  setSortBy]  = useState('rating')
  const [filters, setFilters] = useState({ starRating: [], maxPrice: 100000 })

  const fetchHotels = useCallback(async () => {
    if (!city) return
    setLoading(true)
    setError(null)
    try {
      const params = {
        city, guests,
        ...(checkIn  ? { checkIn  } : {}),
        ...(checkOut ? { checkOut } : {}),
        maxPrice: filters.maxPrice,
        ...(filters.starRating.length > 0 ? { starRating: Math.min(...filters.starRating) } : {}),
      }
      const res = await hotelService.search(params)
      setHotels(res.data.hotels || [])
    } catch {
      setError('Failed to fetch hotels. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [city, checkIn, checkOut, guests, filters])

  useEffect(() => { fetchHotels() }, [fetchHotels])

  const sorted = [...hotels].sort((a, b) => {
    if (sortBy === 'rating') return (b.avgRating || 0) - (a.avgRating || 0)
    if (sortBy === 'price') {
      const pa = Number(a.rooms?.[0]?.pricePerNight || 0)
      const pb = Number(b.rooms?.[0]?.pricePerNight || 0)
      return pa - pb
    }
    if (sortBy === 'stars') return b.starRating - a.starRating
    return 0
  })

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hotels in {city}</h1>
        <p className="text-gray-500 mt-1">
          {checkIn && checkOut ? `${fmtDate(checkIn)} – ${fmtDate(checkOut)} · ${nights} night${nights > 1 ? 's' : ''}` : ''}
          {guests ? ` · ${guests} guest${guests > 1 ? 's' : ''}` : ''}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <HotelFilters filters={filters} onChange={setFilters} />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {!loading && hotels.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{hotels.length} hotels found</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                {[{ k:'rating', l:'Rating' }, { k:'price', l:'Price' }, { k:'stars', l:'Stars' }].map(s => (
                  <button key={s.k} onClick={() => setSortBy(s.k)}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${sortBy === s.k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && <Loader text="Searching hotels..." />}

          {!loading && error && (
            <div className="text-center py-16">
              <p className="text-red-500 text-lg">{error}</p>
              <button onClick={fetchHotels} className="mt-4 text-blue-600 hover:underline text-sm">Try again</button>
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏨</div>
              <h2 className="text-xl font-semibold text-gray-700">No hotels found</h2>
              <p className="text-gray-400 mt-2">Try a different city or adjust your filters.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {sorted.map(h => (
                <HotelCard key={h.id} hotel={h}
                  searchParams={{ city, checkIn, checkOut, guests, nights }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}