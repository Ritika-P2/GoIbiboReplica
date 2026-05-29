import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bookingStart, bookingSuccess, bookingFailure } from '../store/slices/bookingSlice'
import { bookingService } from '../services/bookingService'
import { ROUTES } from '../constants/routes'

const STEPS = ['Guest Details', 'Contact Info', 'Review & Pay']

function StepIndicator({ step }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className={`flex items-center gap-2 ${i <= step ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
              i < step  ? 'bg-orange-500 border-orange-500 text-white' :
              i === step ? 'border-orange-500 text-orange-500' :
              'border-gray-300 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className="text-sm font-medium hidden sm:block">{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-orange-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"

export default function HotelBookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector(s => s.booking)

  const { hotel, room, checkIn, checkOut, guests = 1, rooms = 1, nights = 1 } = location.state || {}

  const [step,        setStep]        = useState(0)
  const [paymentDone, setPaymentDone] = useState(false)
  const [guestForms,  setGuestForms]  = useState([{ name: '', age: '', gender: 'MALE' }])
  const [contact,     setContact]     = useState({ email: '', phone: '' })
  const [cardNumber,  setCardNumber]  = useState('')
  const [cardExpiry,  setCardExpiry]  = useState('')
  const [cardCVV,     setCardCVV]     = useState('')

  if (!hotel || !room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">No hotel or room selected.</p>
        <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-full"
          onClick={() => navigate(ROUTES.HOTELS)}>
          Search Hotels
        </button>
      </div>
    )
  }

  const totalPrice = Number(room.pricePerNight) * nights * rooms

  function updateGuest(i, field, value) {
    setGuestForms(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g))
  }

  const step1Valid = guestForms.every(g => g.name.trim() && g.age && Number(g.age) > 0 && Number(g.age) <= 100)
  const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contact.email)
  const phoneValid = /^[6-9]\d{9}$/.test(contact.phone)
  const step2Valid = emailValid && phoneValid

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  }

  async function handleBook() {
    dispatch(bookingStart())
    try {
      const payload = {
        type: 'HOTEL',
        hotelId: hotel.id,
        roomId: room.id,
        passengers: guestForms,
        contactInfo: contact,
        totalAmount: totalPrice,
        checkIn,
        checkOut,
      }
      const res = await bookingService.create(payload)
      const bookingId = res.data.booking?.id
      dispatch(bookingSuccess({ bookingId }))
      setPaymentDone(true)
      setTimeout(() => {
        navigate(ROUTES.BOOKING_CONFIRMATION, {
          state: { bookingId, type: 'HOTEL', hotel, room, guests: guestForms, contact, totalPrice, checkIn, checkOut, nights }
        })
      }, 2000)
    } catch (e) {
      dispatch(bookingFailure(e.message || 'Booking failed. Please try again.'))
    }
  }

  if (paymentDone) {
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
      {/* Orange header */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-white text-xl font-bold">Complete Your Hotel Booking</h1>
          <p className="text-orange-100 text-sm mt-1">{hotel.name} · {hotel.city}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Steps */}
          <div className="flex-1 min-w-0">
            <StepIndicator step={step} />

            {/* Step 0: Guest */}
            {step === 0 && (
              <div className="space-y-4">
                {guestForms.map((g, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Primary Guest</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <Field label="Full Name">
                          <input className={inputClass} value={g.name}
                            onChange={e => updateGuest(i, 'name', e.target.value)}
                            placeholder="John Doe" />
                        </Field>
                      </div>
                      <Field label="Age">
                        <input className={inputClass} type="number" min="18" max="100" value={g.age}
                          onChange={e => updateGuest(i, 'age', e.target.value)} placeholder="30" />
                        {g.age && Number(g.age) > 100 && (
                          <p className="text-xs text-red-500 mt-1">Age cannot be more than 100 years.</p>
                        )}
                      </Field>
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <div className="flex gap-4">
                          {['MALE', 'FEMALE', 'OTHER'].map(gv => (
                            <label key={gv} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`gender-${i}`} value={gv}
                                checked={g.gender === gv} onChange={() => updateGuest(i, 'gender', gv)}
                                className="accent-orange-500" />
                              <span className="text-sm text-gray-700 capitalize">{gv.toLowerCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button disabled={!step1Valid} onClick={() => setStep(1)}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-full transition-colors">
                  Continue to Contact Info →
                </button>
              </div>
            )}

            {/* Step 1: Contact */}
            {step === 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Contact Information</h2>
                <p className="text-sm text-gray-500">Booking voucher will be sent to this email.</p>
                <Field label="Email Address">
                  <input className={`${inputClass}${contact.email && !emailValid ? ' border-red-400 bg-red-50' : ''}`} type="email" value={contact.email}
                    onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                    placeholder="you@example.com" />
                  {contact.email && !emailValid && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid email address (e.g. user@example.com)</p>
                  )}
                </Field>
                <Field label="Mobile Number">
                  <input className={`${inputClass}${contact.phone && !phoneValid ? ' border-red-400 bg-red-50' : ''}`} type="tel" value={contact.phone}
                    onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                    placeholder="e.g. 9876543210" />
                  {contact.phone && !phoneValid && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9</p>
                  )}
                </Field>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(0)}
                    className="border-2 border-gray-300 text-gray-700 hover:border-orange-400 font-bold px-6 py-2.5 rounded-full transition-colors">
                    ← Back
                  </button>
                  <button disabled={!step2Valid} onClick={() => setStep(2)}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-full transition-colors">
                    Review &amp; Pay →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Pay */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="text-gray-500">Guest:</span> {guestForms[0]?.name}</p>
                    <p><span className="text-gray-500">Contact:</span> {contact.email} · {contact.phone}</p>
                    <p><span className="text-gray-500">Check-in:</span> {fmtDate(checkIn)}</p>
                    <p><span className="text-gray-500">Check-out:</span> {fmtDate(checkOut)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                  <h2 className="font-semibold text-gray-900">Payment Details</h2>
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    This is a demo — enter any card details to simulate payment.
                  </p>
                  <Field label="Card Number">
                    <input className={inputClass} value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="4111 1111 1111 1111" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry (MM/YY)">
                      <input className={inputClass} value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)} placeholder="12/28" />
                    </Field>
                    <Field label="CVV">
                      <input className={inputClass} value={cardCVV}
                        onChange={e => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123" />
                    </Field>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="border-2 border-gray-300 text-gray-700 hover:border-orange-400 font-bold px-6 py-2.5 rounded-full transition-colors">
                    ← Back
                  </button>
                  <button disabled={loading} onClick={handleBook}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-full transition-colors">
                    {loading ? 'Processing...' : `Pay ₹${totalPrice.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Hotel summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">Hotel Details</h3>
              <p className="font-semibold text-gray-900">{hotel.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{hotel.city}</p>
              <div className="text-yellow-400 text-sm mt-1">
                {'★'.repeat(hotel.starRating || 0)}{'☆'.repeat(5 - (hotel.starRating || 0))}
              </div>
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Room type</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-in</span>
                  <span className="font-medium">{fmtDate(checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-out</span>
                  <span className="font-medium">{fmtDate(checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Guests</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rooms</span>
                  <span className="font-medium">{rooms}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>₹{Number(room.pricePerNight).toLocaleString('en-IN')} × {nights} night{nights !== 1 ? 's' : ''} × {rooms} room{rooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-500 text-lg">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
