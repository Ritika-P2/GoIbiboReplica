import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

const AMENITY_ICONS = {
  'AC':            '❄️',
  'WiFi':          '📶',
  'Charging Port': '🔌',
  'USB Charging':  '🔌',
  'Blanket':       '🛏️',
  'Water Bottle':  '💧',
  'Snacks':        '🍪',
  'Reading Light': '💡',
  'Entertainment': '📺',
  'Pillow':        '🛋️',
  'Toilet':        '🚻',
  'Live Tracking': '📍',
}

const BUS_TYPE_BADGE = {
  'AC Sleeper':     'bg-blue-100 text-blue-700',
  'Non-AC Sleeper': 'bg-gray-100 text-gray-700',
  'AC Seater':      'bg-sky-100 text-sky-700',
  'Seater':         'bg-green-100 text-green-700',
  'Sleeper':        'bg-orange-100 text-orange-700',
  'Volvo':          'bg-purple-100 text-purple-700',
}

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDur(mins) {
  const h = Math.floor(mins / 60), m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function SeatBadge({ seats }) {
  if (seats > 20) return (
    <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
      {seats} seats left
    </span>
  )
  if (seats > 5) return (
    <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      {seats} seats left
    </span>
  )
  if (seats > 0) return (
    <span className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      {seats} seats left
    </span>
  )
  return (
    <span className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      Waitlist
    </span>
  )
}

function BusTypeBadge({ busType }) {
  const cls = BUS_TYPE_BADGE[busType] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${cls}`}>
      {busType}
    </span>
  )
}

export default function BusCard({ bus, date }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">

      {/* Main row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">

        {/* Operator + type + seats */}
        <div className="sm:w-52 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-xl mt-0.5">
              🚌
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm leading-snug truncate">{bus.operator}</p>
              <div className="mt-1">
                <BusTypeBadge busType={bus.busType} />
              </div>
            </div>
          </div>
          <div className="mt-2.5">
            <SeatBadge seats={bus.availableSeats} />
          </div>
        </div>

        {/* Route + timing */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className="text-center shrink-0">
            <p className="text-2xl font-bold text-gray-900 leading-tight">{fmtTime(bus.departureTime)}</p>
            <p className="text-sm font-semibold text-gray-600 mt-0.5">{bus.origin}</p>
          </div>

          <div className="flex-1 flex flex-col items-center px-2">
            <p className="text-xs text-gray-400 mb-1.5">{fmtDur(bus.duration)}</p>
            <div className="relative w-full flex items-center">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-orange-400 bg-white shrink-0" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-300 to-orange-400" />
              <span className="text-sm mx-1 shrink-0">🚌</span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-400 to-orange-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Non-stop</p>
          </div>

          <div className="text-center shrink-0">
            <p className="text-2xl font-bold text-gray-900 leading-tight">{fmtTime(bus.arrivalTime)}</p>
            <p className="text-sm font-semibold text-gray-600 mt-0.5">{bus.destination}</p>
          </div>
        </div>

        {/* Price + book */}
        <div className="sm:w-36 shrink-0 text-right">
          <p className="text-xs text-gray-400 mb-0.5">Starts from</p>
          <p className="text-2xl font-bold text-orange-500">₹{Number(bus.price).toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mb-3">per seat</p>
          <button
            onClick={() => navigate(ROUTES.BUS_BOOKING, { state: { bus, date } })}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors">
            Book Now →
          </button>
        </div>
      </div>

      {/* Amenities footer */}
      {bus.amenities && bus.amenities.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-2.5 bg-gray-50/60 flex flex-wrap gap-2">
          {bus.amenities.map(a => (
            <span key={a} className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-1">
              <span className="text-sm">{AMENITY_ICONS[a] || '✓'}</span>
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
