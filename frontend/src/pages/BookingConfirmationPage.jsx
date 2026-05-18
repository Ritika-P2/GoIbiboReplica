import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'

const TYPE_ICONS = { FLIGHT: '✈️', HOTEL: '🏨', TRAIN: '🚂', BUS: '🚌', CAB: '🚗', HOLIDAY: '🌴' }

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

export default function BookingConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const { bookingId, type, flight, hotel, room, train, bus, selectedClass, classPrice, passengers, guests, contact, totalPrice, checkIn, checkOut, nights, date, pkg, travellers, adults, children, couponCode, couponDiscount } = location.state || {}

  if (!bookingId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">No booking found.</p>
        <Button className="mt-4" onClick={() => navigate(ROUTES.HOME)}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="text-gray-500 mt-2">Your booking has been successfully placed.</p>
      </div>

      {/* Booking details card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* Header strip */}
        <div className={`px-6 py-4 text-white bg-gradient-to-r ${
          type === 'TRAIN'   ? 'from-green-600 to-emerald-600'  :
          type === 'BUS'     ? 'from-orange-500 to-amber-500'   :
          type === 'HOTEL'   ? 'from-purple-600 to-violet-600'  :
          type === 'HOLIDAY' ? 'from-pink-600 to-rose-500'      :
          'from-blue-600 to-indigo-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{TYPE_ICONS[type] || '📋'}</span>
              <div>
                <p className="font-semibold text-lg capitalize">{type === 'HOLIDAY' ? pkg?.title || 'Holiday Package' : `${type?.toLowerCase()} Booking`}</p>
                <p className="text-white/70 text-sm">Booking ID: {bookingId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Total Paid</p>
              <p className="text-2xl font-bold">₹{Number(totalPrice).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Flight details */}
          {type === 'FLIGHT' && flight && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Flight Details</h2>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{fmt(flight.departureTime)}</p>
                  <p className="text-gray-600 font-medium">{flight.origin}</p>
                </div>
                <div className="flex-1 flex flex-col items-center px-4">
                  <p className="text-xs text-gray-400 mb-1">{flight.airline} · {flight.flightNumber}</p>
                  <div className="w-full h-px bg-gray-300 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">✈️</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{fmt(flight.arrivalTime)}</p>
                  <p className="text-gray-600 font-medium">{flight.destination}</p>
                </div>
              </div>
            </div>
          )}

          {/* Train details */}
          {type === 'TRAIN' && train && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Train Details</h2>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{train.trainName}</p>
                  <p className="text-sm text-gray-400">#{train.trainNumber}</p>
                </div>
                {selectedClass && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                    {selectedClass} · ₹{classPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{fmt(train.departureTime)}</p>
                  <p className="text-gray-600 font-medium">{train.origin}</p>
                </div>
                <div className="flex-1 flex flex-col items-center px-4">
                  <p className="text-xs text-gray-400 mb-1">
                    {Math.floor(train.duration / 60)}h {train.duration % 60}m
                  </p>
                  <div className="w-full h-px bg-gray-300 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🚆</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{fmt(train.arrivalTime)}</p>
                  <p className="text-gray-600 font-medium">{train.destination}</p>
                </div>
              </div>
              {date && (
                <p className="text-sm text-gray-500 mt-3">
                  Date: {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {/* Bus details */}
          {type === 'BUS' && bus && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bus Details</h2>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{bus.operator}</p>
                  <p className="text-sm text-gray-400">{bus.busType}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200">
                  ₹{Number(bus.price).toLocaleString('en-IN')} / seat
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{fmt(bus.departureTime)}</p>
                  <p className="text-gray-600 font-medium">{bus.origin}</p>
                </div>
                <div className="flex-1 flex flex-col items-center px-4">
                  <p className="text-xs text-gray-400 mb-1">
                    {Math.floor(bus.duration / 60)}h {bus.duration % 60}m
                  </p>
                  <div className="w-full h-px bg-gray-300 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🚌</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{fmt(bus.arrivalTime)}</p>
                  <p className="text-gray-600 font-medium">{bus.destination}</p>
                </div>
              </div>
              {date && (
                <p className="text-sm text-gray-500 mt-3">
                  Date: {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {/* Hotel details */}
          {type === 'HOTEL' && hotel && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Hotel Details</h2>
              <p className="text-lg font-semibold text-gray-900">{hotel.name}</p>
              <p className="text-gray-500 text-sm mb-3">{hotel.address}, {hotel.city}</p>
              {room && <p className="text-sm text-gray-700">Room: <span className="font-medium">{room.type}</span></p>}
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
                  <p className="font-medium text-gray-900 text-sm">{fmtDate(checkIn)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
                  <p className="font-medium text-gray-900 text-sm">{fmtDate(checkOut)}</p>
                </div>
              </div>
              {nights && <p className="text-sm text-gray-500 mt-2">{nights} night{nights !== 1 ? 's' : ''}</p>}
            </div>
          )}

          {/* Holiday details */}
          {type === 'HOLIDAY' && pkg && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Package Details</h2>
              <div className="flex items-start gap-4 mb-3">
                <span className="text-4xl">{pkg.img}</span>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{pkg.title}</p>
                  <p className="text-sm text-gray-500">{pkg.duration} · {pkg.city}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {pkg.tags.map(t => (
                  <span key={t} className="text-xs bg-pink-50 text-pink-700 border border-pink-100 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              <ul className="space-y-1 mb-3">
                {pkg.highlights.map(h => (
                  <li key={h} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 shrink-0">✓</span> {h}
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Adults</p>
                  <p className="font-medium text-gray-900">{adults}</p>
                </div>
                {children > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Children</p>
                    <p className="font-medium text-gray-900">{children}</p>
                  </div>
                )}
                {couponCode && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Coupon Applied</p>
                    <p className="font-medium text-green-600">{couponCode} — ₹{Number(couponDiscount).toLocaleString('en-IN')} off</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passenger / Guest details */}
          {(passengers || guests || (type === 'HOLIDAY' && travellers)) && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {type === 'HOTEL' ? 'Guest' : 'Passengers'}
              </h2>
              <div className="space-y-2">
                {(passengers || guests || travellers || []).map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {i + 1}
                    </div>
                    <span className="text-gray-800 font-medium">{p.name}</span>
                    <span className="text-gray-400">{p.age} yrs · {p.gender?.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          {contact && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact</h2>
              <p className="text-sm text-gray-700">{contact.email}</p>
              <p className="text-sm text-gray-700">{contact.phone}</p>
            </div>
          )}

          {/* Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-800">
              A confirmation email has been sent to <strong>{contact?.email}</strong>. Please carry a copy of this confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => window.print()}>Print / Save</Button>
        <Button className="flex-1" onClick={() => navigate(ROUTES.MY_BOOKINGS)}>View My Bookings</Button>
        <Button variant="ghost" className="flex-1" onClick={() => navigate(ROUTES.HOME)}>Back to Home</Button>
      </div>
    </div>
  )
}