import Card from '../common/Card'
import Button from '../common/Button'

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDur(mins) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function FlightCard({ flight, onSelect }) {
  return (
    <Card hover className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Airline */}
        <div className="flex items-center gap-3 sm:w-40">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            {flight.airline.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{flight.airline}</p>
            <p className="text-xs text-gray-400">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex flex-1 items-center gap-3">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{fmt(flight.departureTime)}</p>
            <p className="text-sm font-medium text-gray-600">{flight.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-xs text-gray-400">{fmtDur(flight.duration)}</p>
            <div className="relative w-full flex items-center">
              <div className="flex-1 h-px bg-gray-300" />
              {flight.stops === 0
                ? <span className="mx-2 text-xs text-green-600 font-medium whitespace-nowrap">Non-stop</span>
                : <span className="mx-2 text-xs text-orange-500 font-medium whitespace-nowrap">{flight.stops} stop</span>}
              <div className="flex-1 h-px bg-gray-300" />
            </div>
            <p className="text-xs text-gray-400 capitalize">{flight.cabinClass.replace('_', ' ').toLowerCase()}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{fmt(flight.arrivalTime)}</p>
            <p className="text-sm font-medium text-gray-600">{flight.destination}</p>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:w-32">
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">₹{Number(flight.price).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400">{flight.availableSeats} seats left</p>
          </div>
          <Button size="sm" onClick={() => onSelect(flight)}>Book</Button>
        </div>
      </div>
    </Card>
  )
}