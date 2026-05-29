import { useNavigate } from 'react-router-dom'

const CITY_GRADIENTS = {
  Mumbai:        'from-blue-200 to-indigo-200',
  Delhi:         'from-red-100 to-orange-200',
  Bangalore:     'from-green-100 to-teal-200',
  Goa:           'from-orange-200 to-yellow-100',
  Chennai:       'from-cyan-100 to-blue-200',
  Hyderabad:     'from-purple-100 to-indigo-200',
  Jaipur:        'from-pink-100 to-rose-200',
  Kolkata:       'from-yellow-100 to-amber-200',
  Udaipur:       'from-cyan-100 to-blue-100',
  Kochi:         'from-emerald-100 to-green-200',
  Manali:        'from-indigo-100 to-purple-200',
}

const CITY_ICONS = {
  Mumbai: '🌆', Delhi: '🏛️', Bangalore: '🌿', Goa: '🏖️',
  Chennai: '🏖️', Hyderabad: '🕌', Jaipur: '🏰', Kolkata: '🌉',
  Udaipur: '🛶', Kochi: '⛵', Manali: '🏔️',
}

function RatingBadge({ rating }) {
  if (!rating) return null
  const color = rating >= 4.5 ? 'bg-green-600' : rating >= 4 ? 'bg-green-500' : rating >= 3.5 ? 'bg-yellow-500' : 'bg-orange-400'
  const label = rating >= 4.5 ? 'Fabulous' : rating >= 4 ? 'Very Good' : rating >= 3.5 ? 'Good' : 'Okay'
  return (
    <div className={`${color} text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1`}>
      <span>{rating}</span>
      <span className="text-[10px] font-medium hidden sm:inline">{label}</span>
    </div>
  )
}

export default function HotelCard({ hotel, searchParams }) {
  const navigate   = useNavigate()
  const lowestRoom = hotel.rooms?.[0]
  const gradient   = CITY_GRADIENTS[hotel.city] || 'from-gray-100 to-gray-200'
  const cityIcon   = CITY_ICONS[hotel.city] || '🏨'
  const imgSrc     = hotel.images?.[0] || `https://picsum.photos/seed/${encodeURIComponent(hotel.name)}/400/300`

  function handleView() {
    const qs = new URLSearchParams({
      ...(searchParams?.checkIn  ? { checkIn:  searchParams.checkIn  } : {}),
      ...(searchParams?.checkOut ? { checkOut: searchParams.checkOut } : {}),
      ...(searchParams?.guests   ? { guests:   searchParams.guests   } : {}),
      ...(searchParams?.rooms    ? { rooms:    searchParams.rooms    } : {}),
    }).toString()
    navigate(`/hotels/${hotel.id}${qs ? `?${qs}` : ''}`)
  }

  const stars = hotel.starRating || 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Hotel image */}
        <div className="sm:w-52 h-44 sm:h-auto shrink-0 relative overflow-hidden">
          <img
            src={imgSrc}
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling.style.display = 'flex'
            }}
          />
          <div className={`hidden w-full h-full bg-gradient-to-br ${gradient} flex-col items-center justify-center`}>
            <span className="text-6xl">{cityIcon}</span>
            <span className="text-xs font-semibold text-gray-500 mt-2">{hotel.city}</span>
          </div>
          {hotel.starRating >= 5 && (
            <span className="absolute top-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full">
              Luxury
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{hotel.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{hotel.address}, {hotel.city}</p>

            {/* Stars + Rating */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-yellow-400 text-sm tracking-tight">
                {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
              </span>
              <RatingBadge rating={hotel.avgRating} />
              {hotel.reviewCount > 0 && (
                <span className="text-xs text-gray-400">{hotel.reviewCount} reviews</span>
              )}
            </div>

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {hotel.amenities.slice(0, 5).map(a => (
                  <span key={a} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                    {a}
                  </span>
                ))}
                {hotel.amenities.length > 5 && (
                  <span className="text-xs text-orange-500 font-medium">+{hotel.amenities.length - 5} more</span>
                )}
              </div>
            )}

            {lowestRoom && (
              <p className="text-xs text-gray-400 mt-2">Room: <span className="text-gray-600 font-medium">{lowestRoom.type}</span></p>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-3 shrink-0 sm:w-36">
            {lowestRoom ? (
              <div className="text-right">
                <p className="text-xs text-gray-400">Starting from</p>
                <p className="text-2xl font-bold text-orange-500">
                  ₹{Number(lowestRoom.pricePerNight).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-400">per night</p>
                <p className="text-[10px] text-gray-400 mt-0.5">+ taxes &amp; fees</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Check availability</p>
            )}
            <button onClick={handleView}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
              View Hotel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
