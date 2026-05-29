import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bookingStart, bookingSuccess, bookingFailure } from '../store/slices/bookingSlice'
import { bookingService } from '../services/bookingService'
import { ROUTES } from '../constants/routes'
import Input from '../components/common/Input'

const STEPS = ['Passenger Details', 'Contact Info', 'Review & Pay']

const AMENITY_ICONS = {
  'AC':            '❄️',
  'WiFi':          '📶',
  'Charging Port': '🔌',
  'Blanket':       '🛏️',
  'Water Bottle':  '💧',
  'Snacks':        '🍪',
  'Reading Light': '💡',
  'Pillow':        '🛋️',
}

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDate(dt) {
  if (!dt) return ''
  return new Date(dt + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}
function fmtDur(mins) {
  const h = Math.floor(mins / 60), m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function BusBookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector(s => s.booking)

  const { bus, date } = location.state || {}

  const [step,       setStep]       = useState(0)
  const [payDone,    setPayDone]    = useState(false)
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'MALE' }])
  const [contact,    setContact]    = useState({ email: '', phone: '' })
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV,    setCardCVV]    = useState('')

  if (!bus) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🚌</div>
        <p className="text-gray-500 text-lg mb-4">No bus selected.</p>
        <button onClick={() => navigate(ROUTES.BUSES)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full">
          Search Buses
        </button>
      </div>
    )
  }

  const totalPrice = Number(bus.price) * passengers.length

  function updatePassenger(i, field, value) {
    setPassengers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }
  function addPassenger() {
    if (passengers.length < bus.availableSeats && passengers.length < 6)
      setPassengers(prev => [...prev, { name: '', age: '', gender: 'MALE' }])
  }
  function removePassenger(i) {
    if (passengers.length > 1) setPassengers(prev => prev.filter((_, idx) => idx !== i))
  }

  const step1Valid = passengers.every(p => p.name.trim() && p.age && Number(p.age) > 0 && Number(p.age) <= 100)
  const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contact.email)
  const phoneValid = /^[6-9]\d{9}$/.test(contact.phone)
  const step2Valid = emailValid && phoneValid

  async function handleBook() {
    dispatch(bookingStart())
    try {
      const res = await bookingService.create({
        type: 'BUS',
        busId: bus.id,
        passengers,
        contactInfo: contact,
        totalAmount: totalPrice,
      })
      const bookingId = res.data.booking?.id
      dispatch(bookingSuccess({ bookingId }))
      setPayDone(true)
      setTimeout(() => {
        navigate(ROUTES.BOOKING_CONFIRMATION, {
          state: { bookingId, type: 'BUS', bus, passengers, contact, totalPrice, date }
        })
      }, 2000)
    } catch (e) {
      dispatch(bookingFailure(e.message || 'Booking failed. Please try again.'))
    }
  }

  if (payDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 text-lg mb-1">₹{totalPrice.toLocaleString('en-IN')} paid successfully.</p>
          <p className="text-gray-400 text-sm">Redirecting to your booking confirmation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Orange top bar */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-white">
            <span className="text-2xl">🚌</span>
            <div>
              <p className="font-bold text-lg leading-tight">{bus.operator}</p>
              <p className="text-orange-100 text-sm">{bus.origin} → {bus.destination} · {fmtDate(date)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left — steps */}
          <div className="flex-1 min-w-0">

            {/* Step indicator */}
            <div className="flex items-center mb-8">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center gap-2 ${i <= step ? 'text-orange-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                      ${i < step  ? 'bg-orange-500 border-orange-500 text-white'
                      : i === step ? 'border-orange-500 text-orange-600 bg-orange-50'
                      : 'border-gray-300 text-gray-400 bg-white'}`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${i < step ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* STEP 0 — Passengers */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 flex items-start gap-2">
                  <span className="text-base mt-0.5">ℹ️</span>
                  <span>Enter passenger details exactly as on their government-issued ID.</span>
                </div>

                {passengers.map((p, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        Passenger {i + 1}
                      </h2>
                      {passengers.length > 1 && (
                        <button onClick={() => removePassenger(i)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors">
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <Input label="Full Name (as on ID)" value={p.name}
                          onChange={e => updatePassenger(i, 'name', e.target.value)}
                          placeholder="John Doe" />
                      </div>
                      <div>
                        <Input label="Age" type="number" min="1" max="100" value={p.age}
                          onChange={e => updatePassenger(i, 'age', e.target.value)}
                          placeholder="25" />
                        {p.age && Number(p.age) > 100 && (
                          <p className="text-xs text-red-500 mt-1">Age cannot be more than 100 years.</p>
                        )}
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <div className="flex gap-6">
                          {['MALE', 'FEMALE', 'OTHER'].map(g => (
                            <label key={g} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`gender-${i}`} value={g}
                                checked={p.gender === g} onChange={() => updatePassenger(i, 'gender', g)}
                                className="accent-orange-500" />
                              <span className="text-sm text-gray-700 capitalize">{g.toLowerCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {passengers.length < 6 && (
                  <button onClick={addPassenger}
                    className="w-full py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-colors">
                    + Add Another Passenger
                  </button>
                )}

                <button
                  disabled={!step1Valid}
                  onClick={() => setStep(1)}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors">
                  Continue to Contact Info →
                </button>
              </div>
            )}

            {/* STEP 1 — Contact */}
            {step === 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="font-bold text-gray-900 text-lg">Contact Information</h2>
                <p className="text-sm text-gray-500">Booking confirmation and e-ticket will be sent to this email and phone.</p>

                <Input label="Email Address" type="email" value={contact.email}
                  onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                  placeholder="you@example.com"
                  error={contact.email && !emailValid ? 'Enter a valid email address (e.g. user@example.com)' : ''} />
                <Input label="Mobile Number" type="tel" value={contact.phone}
                  onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  error={contact.phone && !phoneValid ? 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9' : ''} />

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(0)}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors">
                    ← Back
                  </button>
                  <button
                    disabled={!step2Valid}
                    onClick={() => setStep(2)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors">
                    Review & Pay →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Review + Pay */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">Booking Summary</h2>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Route</span>
                      <span className="font-medium text-gray-800">{bus.origin} → {bus.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Operator</span>
                      <span className="font-medium text-gray-800">{bus.operator} · {bus.busType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Departure</span>
                      <span className="font-medium text-gray-800">{fmtTime(bus.departureTime)}{date ? `, ${fmtDate(date)}` : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Passengers</span>
                      <span className="font-medium text-gray-800">{passengers.map(p => p.name).join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact</span>
                      <span className="font-medium text-gray-800">{contact.email}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                  <h2 className="font-bold text-gray-900 text-lg">Payment Details</h2>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    This is a demo — enter any card details to simulate payment.
                  </p>
                  <Input label="Card Number" value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="4111 1111 1111 1111" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry (MM/YY)" value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)} placeholder="12/28" />
                    <Input label="CVV" value={cardCVV}
                      onChange={e => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="123" />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors">
                    ← Back
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleBook}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${totalPrice.toLocaleString('en-IN')}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right — Bus summary sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">

              {/* Header */}
              <div className="bg-orange-50 border-b border-orange-100 px-5 py-4">
                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Your Bus</p>
                <p className="font-bold text-gray-900">{bus.operator}</p>
                <p className="text-sm text-gray-500 mt-0.5">{bus.busType}</p>
              </div>

              <div className="px-5 py-4">
                {/* Route timeline */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-center shrink-0">
                    <p className="text-xl font-bold text-gray-900">{fmtTime(bus.departureTime)}</p>
                    <p className="text-xs text-gray-500">{bus.origin}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-[10px] text-gray-400 mb-1">{fmtDur(bus.duration)}</p>
                    <div className="w-full flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full border border-orange-400 bg-white shrink-0" />
                      <div className="flex-1 h-px bg-orange-300" />
                      <span className="text-xs mx-0.5">🚌</span>
                      <div className="flex-1 h-px bg-orange-300" />
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <p className="text-xl font-bold text-gray-900">{fmtTime(bus.arrivalTime)}</p>
                    <p className="text-xs text-gray-500">{bus.destination}</p>
                  </div>
                </div>

                {date && (
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <span>📅</span> {fmtDate(date)}
                  </p>
                )}

                {/* Amenities */}
                {bus.amenities && bus.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {bus.amenities.map(a => (
                      <span key={a} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5">
                        {AMENITY_ICONS[a] || '✓'} {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price breakdown */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">₹{Number(bus.price).toLocaleString('en-IN')} × {passengers.length} seat{passengers.length > 1 ? 's' : ''}</span>
                    <span className="text-gray-800">₹{(Number(bus.price) * passengers.length).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Operator charges</span>
                    <span className="text-green-600 font-medium">Included</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total Amount</span>
                    <span className="text-orange-500 text-base">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <p className="mt-4 text-[10px] text-gray-400 leading-relaxed">
                  Cancellation policy as per operator. Partial refund available up to 2 hours before departure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
