import { useNavigate } from 'react-router-dom'
import Card from '../common/Card'
import Button from '../common/Button'

const CITY_EMOJI = { Mumbai:'🌆', Delhi:'🏛️', Bangalore:'🌿', Goa:'🏖️' }

function Stars({ count }) {
  return <span className="text-yellow-400">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
}

export default function HotelCard({ hotel, searchParams }) {
  const navigate = useNavigate()
  const lowestRoom = hotel.rooms?.[0]

  function handleView() {
    const qs = new URLSearchParams({
      ...(searchParams?.checkIn  ? { checkIn:  searchParams.checkIn  } : {}),
      ...(searchParams?.checkOut ? { checkOut: searchParams.checkOut } : {}),
      ...(searchParams?.guests   ? { guests:   searchParams.guests   } : {}),
      ...(searchParams?.rooms    ? { rooms:    searchParams.rooms    } : {}),
    }).toString()
    navigate(`/hotels/${hotel.id}${qs ? `?${qs}` : ''}`)
  }

  return (
    <Card hover className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image placeholder */}
        <div className="sm:w-52 h-40 sm:h-auto bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-6xl shrink-0">
          {CITY_EMOJI[hotel.city] || '🏨'}
        </div>

        <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{hotel.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{hotel.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Stars count={hotel.starRating} />
              {hotel.avgRating && (
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {hotel.avgRating} ★
                </span>
              )}
              {hotel.reviewCount > 0 && (
                <span className="text-xs text-gray-400">{hotel.reviewCount} reviews</span>
              )}
            </div>

            {hotel.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {hotel.amenities.slice(0, 5).map(a => (
                  <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                ))}
                {hotel.amenities.length > 5 && (
                  <span className="text-xs text-blue-500">+{hotel.amenities.length - 5} more</span>
                )}
              </div>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
            {lowestRoom ? (
              <div className="text-right">
                <p className="text-xs text-gray-400">Starting from</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{Number(lowestRoom.pricePerNight).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-400">per night</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Price unavailable</p>
            )}
            <Button size="sm" onClick={handleView}>View Hotel</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}