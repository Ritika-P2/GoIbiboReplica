import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { hotelService } from '../services/hotelService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'

const CITY_ICONS = {
  Mumbai: '🌆', Delhi: '🏛️', Bangalore: '🌿', Goa: '🏖️',
  Chennai: '🏖️', Hyderabad: '🕌', Jaipur: '🏰', Kolkata: '🌉',
  Udaipur: '🛶', Kochi: '⛵', Manali: '🏔️',
}

function RatingBadge({ rating }) {
  if (!rating) return null
  const color = rating >= 4.5 ? 'bg-green-600' : rating >= 4 ? 'bg-green-500' : 'bg-yellow-500'
  const label = rating >= 4.5 ? 'Fabulous' : rating >= 4 ? 'Very Good' : 'Good'
  return (
    <span className={`${color} text-white text-sm font-bold px-2.5 py-1 rounded`}>
      {rating} · {label}
    </span>
  )
}

export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const checkIn  = searchParams.get('checkIn')  || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests   = searchParams.get('guests')   || '1'
  const rooms    = searchParams.get('rooms')    || '1'

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1

  const [hotel,      setHotel]      = useState(null)
  const [hotelRooms, setHotelRooms] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null)
      try {
        const [hRes, rRes] = await Promise.all([
          hotelService.getById(id),
          hotelService.getRooms(id, { capacity: guests }),
        ])
        setHotel(hRes.data.hotel)
        setHotelRooms(rRes.data.rooms || [])
      } catch {
        setError('Failed to load hotel details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, guests])

  function handleSelectRoom(room) {
    navigate(ROUTES.HOTEL_BOOKING, {
      state: { hotel, room, checkIn, checkOut, guests: Number(guests), rooms: Number(rooms), nights }
    })
  }

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  }

  if (loading) return <Loader fullPage text="Loading hotel details..." />

  if (error || !hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 text-lg">{error || 'Hotel not found.'}</p>
        <button className="mt-4 text-orange-500 hover:underline" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    )
  }

  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : (hotel.amenities ? [hotel.amenities] : [])
  const avgRating = hotel.reviews?.length
    ? (hotel.reviews.reduce((s, r) => s + r.rating, 0) / hotel.reviews.length).toFixed(1)
    : hotel.avgRating || null
  const cityIcon = CITY_ICONS[hotel.city] || '🏨'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Back to results
          </button>
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center text-5xl shrink-0">
                {cityIcon}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
                <p className="text-gray-500 text-sm mt-0.5">{hotel.address}, {hotel.city}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-yellow-400 text-lg tracking-tight">
                    {'★'.repeat(hotel.starRating || 0)}{'☆'.repeat(5 - (hotel.starRating || 0))}
                  </span>
                  <RatingBadge rating={avgRating ? Number(avgRating) : null} />
                  {hotel.reviews?.length > 0 && (
                    <span className="text-xs text-gray-400">{hotel.reviews.length} reviews</span>
                  )}
                </div>
              </div>
              {hotelRooms[0] && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">Starting from</p>
                  <p className="text-3xl font-bold text-orange-500">₹{Number(hotelRooms[0].pricePerNight).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">per night</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Amenities + Rooms + Reviews */}
          <div className="flex-1 min-w-0 space-y-5">

            {amenities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Hotel Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map(a => (
                    <span key={a} className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-sm font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Available Rooms</h2>
              {hotelRooms.length === 0 ? (
                <p className="text-gray-500">No rooms available for your selection.</p>
              ) : (
                <div className="space-y-3">
                  {hotelRooms.map(room => (
                    <div key={room.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/30 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{room.type}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Up to {room.capacity} guests ·{' '}
                          <span className={room.availableRooms <= 3 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                            {room.availableRooms} room{room.availableRooms !== 1 ? 's' : ''} left
                          </span>
                        </p>
                        {room.amenities && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(Array.isArray(room.amenities) ? room.amenities : [room.amenities]).map(a => (
                              <span key={a} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right sm:w-40 shrink-0">
                        <p className="text-2xl font-bold text-orange-500">₹{Number(room.pricePerNight).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400">per night</p>
                        {nights > 1 && (
                          <p className="text-xs text-gray-500 font-medium">
                            ₹{(Number(room.pricePerNight) * nights).toLocaleString('en-IN')} for {nights} nights
                          </p>
                        )}
                        <button onClick={() => handleSelectRoom(room)}
                          className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            {hotel.reviews?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Guest Reviews <span className="text-gray-400 font-normal text-sm">({hotel.reviews.length})</span>
                </h2>
                <div className="space-y-4">
                  {hotel.reviews.slice(0, 5).map(r => (
                    <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-800 text-sm">{r.user?.name || 'Guest'}</p>
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                          {r.rating} ★
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking summary */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">Your Stay</h3>
              {checkIn && checkOut ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-semibold">{fmtDate(checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-semibold">{fmtDate(checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-semibold">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guests</span>
                    <span className="font-semibold">{guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rooms</span>
                    <span className="font-semibold">{rooms}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No dates selected.</p>
              )}
              <p className="text-xs text-gray-400 mt-4 bg-orange-50 rounded-lg p-3">
                Select a room above to complete your booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
