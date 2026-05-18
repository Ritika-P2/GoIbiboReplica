import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { hotelService } from '../services/hotelService'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'

const AMENITY_ICONS = {
  'WiFi': 'Wifi', 'Pool': 'Pool', 'Gym': 'Gym', 'Spa': 'Spa',
  'Restaurant': 'Restaurant', 'Bar': 'Bar', 'Parking': 'Parking',
  'Air Conditioning': 'AC', 'Room Service': 'Room Service',
}

export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const checkIn  = searchParams.get('checkIn')  || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests   = searchParams.get('guests')   || '1'
  const rooms    = searchParams.get('rooms')    || '1'

  const [hotel,   setHotel]   = useState(null)
  const [hotelRooms, setHotelRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 1

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
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
  }, [id, guests, rooms])

  function handleSelectRoom(room) {
    navigate(ROUTES.HOTEL_BOOKING, {
      state: { hotel, room, checkIn, checkOut, guests: Number(guests), rooms: Number(rooms), nights }
    })
  }

  if (loading) return <Loader fullPage text="Loading hotel details..." />

  if (error || !hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 text-lg">{error || 'Hotel not found.'}</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : (hotel.amenities ? [hotel.amenities] : [])
  const avgRating = hotel.reviews?.length
    ? (hotel.reviews.reduce((s, r) => s + r.rating, 0) / hotel.reviews.length).toFixed(1)
    : hotel.avgRating || null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{hotel.name}</h1>
            <p className="text-blue-100 mb-3">{hotel.address}, {hotel.city}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
                {Array.from({ length: 5 - (hotel.starRating || 0) }).map((_, i) => (
                  <span key={i} className="text-blue-300 text-lg">★</span>
                ))}
              </div>
              {avgRating && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {avgRating} / 5
                </span>
              )}
            </div>
          </div>
          {hotel.pricePerNight && (
            <div className="text-right shrink-0">
              <p className="text-blue-200 text-sm">Starting from</p>
              <p className="text-3xl font-bold">₹{Number(hotel.pricePerNight).toLocaleString('en-IN')}</p>
              <p className="text-blue-200 text-sm">per night</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: About + Rooms */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {amenities.map(a => (
                  <span key={a} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {AMENITY_ICONS[a] || a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rooms */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Rooms</h2>
            {hotelRooms.length === 0 ? (
              <p className="text-gray-500">No rooms available for your selection.</p>
            ) : (
              <div className="space-y-4">
                {hotelRooms.map(room => (
                  <div key={room.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{room.type}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Up to {room.capacity} guests ·{' '}
                        {room.availableRooms} room{room.availableRooms !== 1 ? 's' : ''} left
                      </p>
                      {room.amenities && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(Array.isArray(room.amenities) ? room.amenities : [room.amenities]).map(a => (
                            <span key={a} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right sm:w-36 shrink-0">
                      <p className="text-xl font-bold text-blue-600">₹{Number(room.pricePerNight).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400">per night</p>
                      <p className="text-xs text-gray-400 mb-2">Total: ₹{(Number(room.pricePerNight) * nights).toLocaleString('en-IN')}</p>
                      <Button size="sm" onClick={() => handleSelectRoom(room)}>Select</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          {hotel.reviews?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Guest Reviews <span className="text-gray-400 font-normal text-base">({hotel.reviews.length})</span>
              </h2>
              <div className="space-y-4">
                {hotel.reviews.slice(0, 5).map(r => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-800 text-sm">{r.user?.name || 'Guest'}</p>
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking card */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Your Stay</h3>
            {checkIn && checkOut ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-in</span>
                  <span className="font-medium">{new Date(checkIn).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-out</span>
                  <span className="font-medium">{new Date(checkOut).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Guests</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rooms</span>
                  <span className="font-medium">{rooms}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No dates selected. Please go back and search with dates.</p>
            )}
            <p className="text-xs text-gray-400 mt-4">Select a room above to proceed with booking.</p>
          </div>
        </div>
      </div>
    </div>
  )
}