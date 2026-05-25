import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bookingStart, bookingSuccess, bookingFailure } from '../store/slices/bookingSlice'
import { bookingService } from '../services/bookingService'
import { couponService } from '../services/couponService'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const STEPS = ['Passenger Details', 'Contact Info', 'Review & Pay']
const CABINS = { ECONOMY: 'Economy', PREMIUM_ECONOMY: 'Premium Economy', BUSINESS: 'Business', FIRST: 'First Class' }

const SPECIAL_FARES = {
  REGULAR:        { label: 'Regular',        icon: '✈️',  discount: null },
  STUDENT:        { label: 'Student',         icon: '🎓',  discount: { type: 'PERCENT', value: 10 },  note: 'Extra baggage allowance included' },
  ARMED_FORCES:   { label: 'Armed Forces',    icon: '🪖',  discount: { type: 'FLAT',    value: 600 }, note: 'Valid ID proof required at check-in' },
  SENIOR_CITIZEN: { label: 'Senior Citizen',  icon: '👴',  discount: { type: 'FLAT',    value: 600 }, note: 'Valid for passengers aged 60+' },
  DOCTOR_NURSE:   { label: 'Doctor & Nurses', icon: '🩺',  discount: { type: 'FLAT',    value: 600 }, note: 'Valid medical professional ID required' },
}

function computeDiscount(specialFare, baseTotal) {
  const fare = SPECIAL_FARES[specialFare]
  if (!fare || !fare.discount) return 0
  if (fare.discount.type === 'PERCENT') return Math.round(baseTotal * fare.discount.value / 100)
  if (fare.discount.type === 'FLAT')    return Math.min(fare.discount.value, baseTotal)
  return 0
}

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDur(mins) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function FlightSegment({ flight, label }) {
  return (
    <div>
      {label && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
          {flight.airline.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{flight.airline}</p>
          <p className="text-xs text-gray-400">{flight.flightNumber} · {CABINS[flight.cabinClass] || flight.cabinClass}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div>
          <p className="text-lg font-bold text-gray-900">{fmt(flight.departureTime)}</p>
          <p className="text-sm text-gray-600">{flight.origin}</p>
          <p className="text-xs text-gray-400">{fmtDate(flight.departureTime)}</p>
        </div>
        <div className="text-center text-xs text-gray-400 px-2">
          <p>{fmtDur(flight.duration)}</p>
          <div className="w-12 h-px bg-gray-300 my-1 mx-auto" />
          <p>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">{fmt(flight.arrivalTime)}</p>
          <p className="text-sm text-gray-600">{flight.destination}</p>
          <p className="text-xs text-gray-400">{fmtDate(flight.arrivalTime)}</p>
        </div>
      </div>
    </div>
  )
}

export default function FlightBookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector(s => s.booking)

  const { flight, returnFlight, returnDate, passengers = 1, cabin = 'ECONOMY', specialFare = 'REGULAR' } = location.state || {}
  const isRoundTrip = !!returnFlight

  const [step, setStep] = useState(0)
  const [paymentDone, setPaymentDone] = useState(false)
  const [pendingBookingId, setPendingBookingId] = useState(null)
  const [creatingBooking, setCreatingBooking] = useState(false)
  const [passengerForms, setPassengerForms] = useState(
    Array.from({ length: Number(passengers) }, () => ({ name: '', age: '', gender: 'MALE' }))
  )
  const [contact, setContact] = useState({ email: '', phone: '' })
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV, setCardCVV] = useState('')

  // Coupon state (only usable when specialFare === REGULAR)
  const [couponCode, setCouponCode] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponDesc, setCouponDesc] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  if (!flight) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">No flight selected.</p>
        <Button className="mt-4" onClick={() => navigate(ROUTES.FLIGHTS)}>Search Flights</Button>
      </div>
    )
  }

  // Price calculation — includes both legs for round trips
  const onwardFare      = Number(flight.price) * Number(passengers)
  const returnFare      = isRoundTrip ? Number(returnFlight.price) * Number(passengers) : 0
  const baseFare        = onwardFare + returnFare
  const fareInfo        = SPECIAL_FARES[specialFare] || SPECIAL_FARES.REGULAR
  const specialDiscount = computeDiscount(specialFare, baseFare)
  const totalDiscount   = specialDiscount + couponDiscount
  const totalPrice      = Math.max(0, baseFare - totalDiscount)
  const isSpecialFareActive = specialFare !== 'REGULAR'

  function updatePassenger(i, field, value) {
    setPassengerForms(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function step1Valid() {
    return passengerForms.every(p => p.name.trim() && p.age && Number(p.age) > 0)
  }
  function step2Valid() {
    return contact.email.includes('@') && contact.phone.length >= 10
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await couponService.validate(couponInput.trim().toUpperCase(), baseFare)
      const { code, discount, description } = res.data
      setCouponCode(code)
      setCouponDiscount(discount)
      setCouponDesc(description)
      setCouponInput('')
    } catch (e) {
      setCouponError(e.message || 'Invalid coupon code')
      setCouponDiscount(0)
      setCouponCode('')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setCouponCode('')
    setCouponDiscount(0)
    setCouponDesc('')
    setCouponError('')
    setCouponInput('')
  }

  // Build the booking payload (shared between Step-2 creation and Pay fallback)
  function buildBookingPayload(finalAmount) {
    return {
      type:           'FLIGHT',
      flightId:       flight.id,
      ...(isRoundTrip ? { returnFlightId: returnFlight.id } : {}),
      passengers:     passengerForms,
      contactInfo:    contact,
      totalAmount:    finalAmount,
      packageData: {
        tripType:          isRoundTrip ? 'ROUND_TRIP' : 'ONE_WAY',
        specialFare,
        specialFareLabel:  fareInfo.label,
        specialDiscount,
        couponCode:        null,
        couponDiscount:    0,
        ...(isRoundTrip ? {
          onwardFlightId:   flight.id,
          returnFlightId:   returnFlight.id,
          onwardFare,
          returnFare,
        } : {}),
      },
    }
  }

  async function handleNavigateToStep2() {
    if (!pendingBookingId) {
      setCreatingBooking(true)
      try {
        const res = await bookingService.create(buildBookingPayload(baseFare - specialDiscount))
        setPendingBookingId(res.data.booking?.id)
      } catch {
        // Non-fatal: fallback in handleBook
      } finally {
        setCreatingBooking(false)
      }
    }
    setStep(2)
  }

  async function handleBook() {
    dispatch(bookingStart())
    try {
      let bookingId = pendingBookingId

      if (!bookingId) {
        const res = await bookingService.create(buildBookingPayload(totalPrice))
        bookingId = res.data.booking?.id
        setPendingBookingId(bookingId)
      }

      if (cardCVV === '000') {
        dispatch(bookingFailure(
          'Payment declined by bank. Your booking is saved — retry payment from My Bookings.'
        ))
        return
      }

      await bookingService.confirmPayment(bookingId, {
        totalAmount: totalPrice,
        packageData: {
          tripType:         isRoundTrip ? 'ROUND_TRIP' : 'ONE_WAY',
          specialFare,
          specialFareLabel: fareInfo.label,
          specialDiscount,
          couponCode:       couponCode || null,
          couponDiscount,
          ...(isRoundTrip ? {
            onwardFlightId: flight.id,
            returnFlightId: returnFlight.id,
            onwardFare,
            returnFare,
          } : {}),
        },
      })
      dispatch(bookingSuccess({ bookingId }))
      setPaymentDone(true)
      setTimeout(() => {
        navigate(ROUTES.BOOKING_CONFIRMATION, {
          state: {
            bookingId,
            type:          'FLIGHT',
            flight,
            returnFlight:  isRoundTrip ? returnFlight : undefined,
            isRoundTrip,
            passengers:    passengerForms,
            contact,
            totalPrice,
            specialFare,
            specialDiscount,
            couponCode,
            couponDiscount,
          },
        })
      }, 2000)
    } catch (e) {
      dispatch(bookingFailure(e.message || 'Booking failed. Please try again.'))
    }
  }

  if (paymentDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
      {isRoundTrip && (
        <p className="text-sm text-blue-600 font-medium mb-6 flex items-center gap-1.5">
          <span className="inline-block w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">↔</span>
          Round Trip · {flight.origin} ⇌ {flight.destination}
        </p>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Steps */}
        <div className="flex-1 min-w-0">
          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i < step ? 'bg-blue-600 border-blue-600 text-white' : i === step ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Special fare banner */}
          {isSpecialFareActive && (
            <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <span className="text-2xl">{fareInfo.icon}</span>
              <div>
                <p className="font-semibold text-blue-800 text-sm">
                  {fareInfo.label} Fare Applied
                  {specialDiscount > 0 && (
                    <span className="ml-2 text-green-600">— saving ₹{specialDiscount.toLocaleString('en-IN')}</span>
                  )}
                </p>
                {fareInfo.note && <p className="text-xs text-blue-600 mt-0.5">📌 {fareInfo.note}</p>}
              </div>
            </div>
          )}

          {/* Step 0: Passengers */}
          {step === 0 && (
            <div className="space-y-6">
              {passengerForms.map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Passenger {i + 1}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Input label="Full Name (as on ID)" value={p.name}
                        onChange={e => updatePassenger(i, 'name', e.target.value)}
                        placeholder="John Doe" />
                    </div>
                    <Input label="Age" type="number" min="1" max="120" value={p.age}
                      onChange={e => updatePassenger(i, 'age', e.target.value)}
                      placeholder="25" />
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <div className="flex gap-4">
                        {['MALE', 'FEMALE', 'OTHER'].map(g => (
                          <label key={g} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`gender-${i}`} value={g}
                              checked={p.gender === g} onChange={() => updatePassenger(i, 'gender', g)}
                              className="text-blue-600" />
                            <span className="text-sm text-gray-700 capitalize">{g.toLowerCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button disabled={!step1Valid()} onClick={() => setStep(1)} className="w-full sm:w-auto">
                Continue to Contact Info
              </Button>
            </div>
          )}

          {/* Step 1: Contact */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-sm text-gray-500 mb-4">Booking confirmation will be sent to this email.</p>
              <Input label="Email Address" type="email" value={contact.email}
                onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                placeholder="you@example.com" />
              <Input label="Mobile Number" type="tel" value={contact.phone}
                onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                placeholder="+91 98765 43210" />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button
                  disabled={!step2Valid() || creatingBooking}
                  loading={creatingBooking}
                  onClick={handleNavigateToStep2}
                >
                  {creatingBooking ? 'Saving booking…' : 'Review & Pay'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Review + Pay */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="text-gray-500">Passengers:</span> {passengerForms.map(p => p.name).join(', ')}</p>
                  <p><span className="text-gray-500">Contact:</span> {contact.email} · {contact.phone}</p>
                </div>
              </div>

              {/* Coupon code */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Promo / Coupon Code</h2>
                {isSpecialFareActive ? (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                    <span>⚠️</span>
                    <span>Coupon codes cannot be combined with <strong>{fareInfo.label} Fare</strong> discounts.</span>
                  </div>
                ) : couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-semibold text-green-700">🎉 {couponCode} applied</p>
                      <p className="text-xs text-green-600">{couponDesc} — saving ₹{couponDiscount.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                      <Button size="sm" onClick={applyCoupon} loading={couponLoading} disabled={!couponInput.trim()}>
                        Apply
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['QUICK20', 'GOIBIBO10', 'FLAT500'].map(c => (
                        <button key={c} type="button" onClick={() => setCouponInput(c)}
                          className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-full hover:bg-blue-100">
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mock payment */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Payment Details</h2>
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                  Demo mode — enter any card details. Use CVV <strong>000</strong> to simulate a failed payment and test the Pending booking flow.
                </p>
                <Input label="Card Number" value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g,'').slice(0,16))}
                  placeholder="4111 1111 1111 1111" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry (MM/YY)" value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)} placeholder="12/28" />
                  <Input label="CVV" value={cardCVV}
                    onChange={e => setCardCVV(e.target.value.replace(/\D/g,'').slice(0,3))}
                    placeholder="123" />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <p className="font-medium">{error}</p>
                  {pendingBookingId && (
                    <p className="mt-1 text-xs text-red-500">
                      Booking ID <span className="font-mono">{pendingBookingId}</span> is saved as <strong>Pending</strong>. Fix your card details and retry, or find it in My Bookings.
                    </p>
                  )}
                </div>
              )}

              {pendingBookingId && !error && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  <p className="font-medium">⏳ Booking is saved — complete payment to confirm.</p>
                  <p className="text-xs mt-0.5">Booking ID: <span className="font-mono">{pendingBookingId}</span></p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} disabled={!!pendingBookingId}>Back</Button>
                <Button loading={loading} onClick={handleBook} className="flex-1">
                  {pendingBookingId ? `Retry Payment — ₹${totalPrice.toLocaleString('en-IN')}` : `Pay ₹${totalPrice.toLocaleString('en-IN')}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Flight summary + price breakdown */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4 space-y-5">
            <h3 className="font-semibold text-gray-900">{isRoundTrip ? 'Flight Details' : 'Flight Details'}</h3>

            {/* Onward segment */}
            <FlightSegment flight={flight} label={isRoundTrip ? 'Onward' : undefined} />

            {/* Return segment */}
            {isRoundTrip && returnFlight && (
              <>
                <div className="border-t border-dashed border-gray-200" />
                <FlightSegment flight={returnFlight} label="Return" />
              </>
            )}

            {/* Special fare badge */}
            {isSpecialFareActive && (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <span className="text-sm">{fareInfo.icon}</span>
                <span className="text-xs font-semibold text-blue-700">{fareInfo.label} Fare</span>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-1.5">
              {isRoundTrip ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Onward fare × {passengers}</span>
                    <span>₹{onwardFare.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Return fare × {passengers}</span>
                    <span>₹{returnFare.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base fare × {passengers}</span>
                  <span>₹{baseFare.toLocaleString('en-IN')}</span>
                </div>
              )}
              {specialDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{fareInfo.icon} {fareInfo.label} discount</span>
                  <span>−₹{specialDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>🎟 {couponCode}</span>
                  <span>−₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxes & fees</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-blue-600">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              {totalDiscount > 0 && (
                <p className="text-xs text-green-600 text-right font-medium">
                  You save ₹{totalDiscount.toLocaleString('en-IN')}!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
