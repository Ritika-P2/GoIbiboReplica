import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingService } from '../services/bookingService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'

const TYPES    = ['ALL', 'FLIGHT', 'HOTEL', 'TRAIN', 'BUS', 'CAB', 'HOLIDAY']
const STATUSES = ['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED']

const TYPE_ICONS = { FLIGHT: '✈️', HOTEL: '🏨', TRAIN: '🚂', BUS: '🚌', CAB: '🚗', HOLIDAY: '🌴' }
const TYPE_COLOR = {
  FLIGHT:  'from-blue-500 to-indigo-500',
  HOTEL:   'from-purple-500 to-violet-500',
  TRAIN:   'from-green-500 to-emerald-500',
  BUS:     'from-orange-500 to-amber-500',
  CAB:     'from-yellow-500 to-orange-400',
  HOLIDAY: 'from-pink-500 to-rose-400',
}
const STATUS_BADGE = {
  PENDING:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
}
const PAYMENT_STYLE = {
  SUCCESS:  { cls: 'text-green-700 bg-green-50 border-green-200', label: '✓ Paid' },
  PENDING:  { cls: 'text-yellow-700 bg-yellow-50 border-yellow-200', label: '⏳ Pending' },
  REFUNDED: { cls: 'text-blue-700 bg-blue-50 border-blue-200', label: '↩ Refunded' },
  FAILED:   { cls: 'text-red-700 bg-red-50 border-red-200', label: '✗ Failed' },
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
function fmtTime(d) {
  return d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''
}
function fmtDur(mins) {
  if (!mins) return ''
  const h = Math.floor(mins / 60), m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
function nights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  return Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
}

function BookingDetails({ b }) {
  if (b.type === 'FLIGHT' && b.flight) {
    return (
      <div className="flex items-center gap-3 mt-2">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{fmtTime(b.flight.departureTime)}</p>
          <p className="text-sm font-semibold text-gray-700">{b.flight.origin}</p>
        </div>
        <div className="flex-1 text-center px-2">
          <p className="text-xs text-gray-400">{b.flight.airline} · {b.flight.flightNumber}</p>
          <div className="relative flex items-center my-1">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="mx-1 text-sm">✈️</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          <p className="text-xs text-gray-400">{b.flight.cabinClass}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{fmtTime(b.flight.arrivalTime)}</p>
          <p className="text-sm font-semibold text-gray-700">{b.flight.destination}</p>
        </div>
        <div className="ml-4 text-right">
          <p className="text-xs text-gray-400">Date</p>
          <p className="text-sm font-medium text-gray-700">{fmtDate(b.flight.departureTime)}</p>
        </div>
      </div>
    )
  }

  if (b.type === 'HOTEL' && b.hotel) {
    const n = nights(b.checkIn, b.checkOut)
    return (
      <div className="mt-2 space-y-1">
        <p className="font-semibold text-gray-900">{b.hotel.name}
          <span className="ml-2 text-xs text-yellow-500">{'★'.repeat(b.hotel.starRating)}</span>
        </p>
        <p className="text-sm text-gray-500">{b.hotel.city}{b.hotel.address ? ` · ${b.hotel.address}` : ''}</p>
        {b.room && <p className="text-sm text-gray-600">Room: <span className="font-medium">{b.room.type}</span></p>}
        <div className="flex gap-4 mt-1">
          <div className="bg-gray-50 rounded-lg px-3 py-1.5">
            <p className="text-xs text-gray-400">Check-in</p>
            <p className="text-sm font-medium text-gray-800">{fmtDate(b.checkIn)}</p>
          </div>
          <div className="text-gray-300 self-center">→</div>
          <div className="bg-gray-50 rounded-lg px-3 py-1.5">
            <p className="text-xs text-gray-400">Check-out</p>
            <p className="text-sm font-medium text-gray-800">{fmtDate(b.checkOut)}</p>
          </div>
          {n > 0 && <p className="self-center text-xs text-gray-500">{n} night{n !== 1 ? 's' : ''}</p>}
        </div>
      </div>
    )
  }

  if (b.type === 'TRAIN' && b.train) {
    return (
      <div className="flex items-center gap-3 mt-2">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{fmtTime(b.train.departureTime)}</p>
          <p className="text-sm font-semibold text-gray-700">{b.train.origin}</p>
        </div>
        <div className="flex-1 text-center px-2">
          <p className="text-xs text-gray-400">{b.train.trainName} · #{b.train.trainNumber}</p>
          <div className="relative flex items-center my-1">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="mx-1 text-sm">🚆</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          <p className="text-xs text-gray-400">{fmtDur(b.train.duration)}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{fmtTime(b.train.arrivalTime)}</p>
          <p className="text-sm font-semibold text-gray-700">{b.train.destination}</p>
        </div>
        <div className="ml-4 text-right">
          <p className="text-xs text-gray-400">Date</p>
          <p className="text-sm font-medium text-gray-700">{fmtDate(b.train.departureTime)}</p>
        </div>
      </div>
    )
  }

  if (b.type === 'BUS' && b.bus) {
    return (
      <div className="flex items-center gap-3 mt-2">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{fmtTime(b.bus.departureTime)}</p>
          <p className="text-sm font-semibold text-gray-700">{b.bus.origin}</p>
        </div>
        <div className="flex-1 text-center px-2">
          <p className="text-xs text-gray-400">{b.bus.operator} · {b.bus.busType}</p>
          <div className="relative flex items-center my-1">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="mx-1 text-sm">🚌</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          <p className="text-xs text-gray-400">{fmtDur(b.bus.duration)}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{fmtTime(b.bus.arrivalTime)}</p>
          <p className="text-sm font-semibold text-gray-700">{b.bus.destination}</p>
        </div>
        <div className="ml-4 text-right">
          <p className="text-xs text-gray-400">Date</p>
          <p className="text-sm font-medium text-gray-700">{fmtDate(b.bus.departureTime)}</p>
        </div>
      </div>
    )
  }

  if (b.type === 'HOLIDAY' && b.packageData) {
    const pd = b.packageData
    return (
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">{pd.title}</p>
          <span className="text-xs bg-pink-50 text-pink-700 border border-pink-100 px-2 py-0.5 rounded-full">{pd.duration}</span>
        </div>
        <p className="text-sm text-gray-600">
          📍 {pd.city}
          {pd.adults ? ` · ${pd.adults} adult${pd.adults !== 1 ? 's' : ''}` : ''}
          {pd.children > 0 ? `, ${pd.children} child${pd.children !== 1 ? 'ren' : ''}` : ''}
        </p>
        {pd.couponCode && (
          <p className="text-xs text-green-600 font-medium">
            🏷 Coupon {pd.couponCode} applied — ₹{Number(pd.couponDiscount).toLocaleString('en-IN')} off
          </p>
        )}
      </div>
    )
  }

  return null
}

function ContactInfo({ contactInfo }) {
  if (!contactInfo) return null
  return (
    <div className="text-xs text-gray-500 mt-1 flex gap-3">
      {contactInfo.email && <span>✉ {contactInfo.email}</span>}
      {contactInfo.phone && <span>📞 {contactInfo.phone}</span>}
    </div>
  )
}

export default function MyBookingsPage() {
  const navigate = useNavigate()

  const [bookings,   setBookings]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [typeTab,    setTypeTab]    = useState('ALL')
  const [statusTab,  setStatusTab]  = useState('ALL')
  const [cancelling, setCancelling] = useState(null)
  const [expanded,   setExpanded]   = useState({})

  async function fetchBookings() {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (typeTab   !== 'ALL') params.type   = typeTab
      if (statusTab !== 'ALL') params.status = statusTab
      const res = await bookingService.getMyList(params)
      setBookings(res.data.bookings || [])
    } catch {
      setError('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [typeTab, statusTab])

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking? This action cannot be undone.')) return
    setCancelling(id)
    try {
      await bookingService.cancel(id)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED', payment: b.payment ? { ...b.payment, status: 'REFUNDED' } : b.payment } : b))
    } catch {
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">All your travel bookings — persisted across sessions</p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {TYPES.map(t => (
          <button key={t} onClick={() => setTypeTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${typeTab === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t === 'ALL' ? 'All Types' : `${TYPE_ICONS[t]} ${t.charAt(0) + t.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusTab(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${statusTab === s ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
            {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading && <Loader text="Loading your bookings..." />}

      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchBookings}>Try Again</Button>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🧳</div>
          <h2 className="text-xl font-semibold text-gray-700">No bookings found</h2>
          <p className="text-gray-400 mt-2 mb-6">Start exploring and book your next trip.</p>
          <Button onClick={() => navigate(ROUTES.HOME)}>Explore Trips</Button>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map(b => {
            const payStyle = PAYMENT_STYLE[b.payment?.status] || PAYMENT_STYLE.PENDING
            const isExpanded = expanded[b.id]

            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Colour stripe */}
                <div className={`h-1 bg-gradient-to-r ${TYPE_COLOR[b.type] || 'from-gray-400 to-gray-500'}`} />

                <div className="px-5 pt-4 pb-3">
                  {/* Top row: icon + title + status + amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl shrink-0 mt-0.5">{TYPE_ICONS[b.type] || '📋'}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 text-base">
                            {b.type === 'FLIGHT' && b.flight
                              ? `${b.flight.origin} → ${b.flight.destination}`
                              : b.type === 'TRAIN' && b.train
                              ? `${b.train.origin} → ${b.train.destination}`
                              : b.type === 'BUS' && b.bus
                              ? `${b.bus.origin} → ${b.bus.destination}`
                              : b.type === 'HOTEL' && b.hotel
                              ? b.hotel.name
                              : b.type === 'HOLIDAY' && b.packageData?.title
                              ? b.packageData.title
                              : `${b.type?.charAt(0) + b.type?.slice(1).toLowerCase()} Booking`}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {b.status?.charAt(0) + b.status?.slice(1).toLowerCase()}
                          </span>
                        </div>
                        {/* Booking detail row */}
                        <BookingDetails b={b} />
                        <ContactInfo contactInfo={b.contactInfo} />
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-gray-900">₹{Number(b.totalAmount).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400">{b.passengers?.length || 1} traveller{(b.passengers?.length || 1) !== 1 ? 's' : ''}</p>
                      <span className={`inline-flex mt-1 text-xs font-medium px-2 py-0.5 rounded border ${payStyle.cls}`}>
                        {payStyle.label}
                      </span>
                    </div>
                  </div>

                  {/* Expand/collapse toggle */}
                  <button onClick={() => toggleExpand(b.id)}
                    className="mt-3 text-xs text-blue-600 hover:underline flex items-center gap-1">
                    {isExpanded ? '▲ Hide details' : '▼ Show traveller details'}
                  </button>
                </div>

                {/* Expanded: travellers + booking meta */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-gray-100 pt-3 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Travellers */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Travellers</p>
                        <div className="space-y-1">
                          {(b.passengers || []).map((p, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">{i + 1}</div>
                              <span className="font-medium text-gray-800">{p.name}</span>
                              <span className="text-gray-400 text-xs">{p.age} yrs · {p.gender?.toLowerCase()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Meta */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Booking Info</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><span className="text-gray-400">ID:</span> <span className="font-mono">{b.id}</span></p>
                          <p><span className="text-gray-400">Booked:</span> {fmtDate(b.createdAt)}</p>
                          {b.payment?.paidAt && (
                            <p><span className="text-gray-400">Paid:</span> {fmtDate(b.payment.paidAt)} via {b.payment.method}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer: cancel button */}
                {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                  <div className="border-t border-gray-100 px-5 py-2.5 flex justify-end bg-white">
                    <Button size="sm" variant="danger" loading={cancelling === b.id}
                      onClick={() => handleCancel(b.id)}>
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
