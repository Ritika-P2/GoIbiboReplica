function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDur(mins) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const AIRLINE_COLORS = {
  'IndiGo':    'bg-indigo-100 text-indigo-700',
  'Air India': 'bg-red-100 text-red-700',
  'Vistara':   'bg-purple-100 text-purple-700',
  'SpiceJet':  'bg-red-100 text-red-600',
  'GoAir':     'bg-blue-100 text-blue-700',
  'AirAsia':   'bg-red-100 text-red-700',
}

export default function FlightCard({ flight, onSelect, specialFare = 'REGULAR', discountedPrice }) {
  const displayPrice = discountedPrice ?? Number(flight.price)
  const originalPrice = Number(flight.price)
  const hasDiscount = specialFare !== 'REGULAR' && discountedPrice != null && discountedPrice < originalPrice
  const colorClass = AIRLINE_COLORS[flight.airline] || 'bg-gray-100 text-gray-700'
  const isNonstop = flight.stops === 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden">
      <div className="flex items-stretch">

        {/* Airline logo column */}
        <div className="flex flex-col items-center justify-center w-20 shrink-0 border-r border-gray-100 p-3 gap-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${colorClass}`}>
            {flight.airline.slice(0, 2).toUpperCase()}
          </div>
          <p className="text-[10px] text-gray-500 font-medium text-center leading-tight">{flight.airline}</p>
          <p className="text-[10px] text-gray-400">{flight.flightNumber}</p>
        </div>

        {/* Route info */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-center gap-3">

            {/* Departure */}
            <div className="text-center w-20 shrink-0">
              <p className="text-xl font-bold text-gray-900">{fmt(flight.departureTime)}</p>
              <p className="text-sm font-semibold text-gray-700">{flight.origin}</p>
              <p className="text-xs text-gray-400">{fmtDate(flight.departureTime)}</p>
            </div>

            {/* Duration + stops */}
            <div className="flex-1 flex flex-col items-center gap-1 px-2">
              <p className="text-xs text-gray-400">{fmtDur(flight.duration)}</p>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-gray-300" />
                {isNonstop
                  ? <span className="shrink-0 text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Non stop</span>
                  : <span className="shrink-0 text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">{flight.stops} stop</span>}
                <div className="flex-1 h-px bg-gray-300" />
              </div>
              <p className="text-[10px] text-gray-400 capitalize">{flight.cabinClass.replace('_', ' ').toLowerCase()}</p>
            </div>

            {/* Arrival */}
            <div className="text-center w-20 shrink-0">
              <p className="text-xl font-bold text-gray-900">{fmt(flight.arrivalTime)}</p>
              <p className="text-sm font-semibold text-gray-700">{flight.destination}</p>
              <p className="text-xs text-gray-400">{fmtDate(flight.arrivalTime)}</p>
            </div>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 mt-2">
            {flight.availableSeats <= 5 && (
              <span className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded font-medium">
                Only {flight.availableSeats} seats left!
              </span>
            )}
            {isNonstop && (
              <span className="text-[10px] bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded font-medium">
                Direct flight
              </span>
            )}
            <span className="text-[10px] text-gray-400">Includes taxes & fees</span>
          </div>
        </div>

        {/* Price + book */}
        <div className="flex flex-col items-end justify-between w-36 shrink-0 border-l border-gray-100 p-4">
          <div className="text-right">
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
            )}
            <p className="text-2xl font-bold text-orange-500">₹{displayPrice.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-gray-400">per person</p>
            {hasDiscount && (
              <p className="text-[10px] text-green-600 font-semibold">
                Save ₹{(originalPrice - displayPrice).toLocaleString('en-IN')}
              </p>
            )}
          </div>
          <button onClick={() => onSelect(flight)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2 rounded-lg transition-colors mt-3">
            Book
          </button>
        </div>
      </div>
    </div>
  )
}
