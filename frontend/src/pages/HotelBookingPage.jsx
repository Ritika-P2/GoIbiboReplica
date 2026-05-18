import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bookingStart, bookingSuccess, bookingFailure } from '../store/slices/bookingSlice'
import { bookingService } from '../services/bookingService'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const STEPS = ['Guest Details', 'Contact Info', 'Review & Pay']

export default function HotelBookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector(s => s.booking)

  const { hotel, room, checkIn, checkOut, guests = 1, rooms = 1, nights = 1 } = location.state || {}

  const [step, setStep] = useState(0)
  const [paymentDone, setPaymentDone] = useState(false)
  const [guestForms, setGuestForms] = useState(
    Array.from({ length: 1 }, () => ({ name: '', age: '', gender: 'MALE' }))
  )
  const [contact, setContact] = useState({ email: '', phone: '' })
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV, setCardCVV] = useState('')

  if (!hotel || !room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">No hotel or room selected.</p>
        <Button className="mt-4" onClick={() => navigate(ROUTES.HOTELS)}>Search Hotels</Button>
      </div>
    )
  }

  const totalPrice = Number(room.pricePerNight) * nights * rooms

  function updateGuest(i, field, value) {
    setGuestForms(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g))
  }

  function step1Valid() {
    return guestForms.every(g => g.name.trim() && g.age && Number(g.age) > 0)
  }
  function step2Valid() {
    return contact.email.includes('@') && contact.phone.length >= 10
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>

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

          {/* Step 0: Guests */}
          {step === 0 && (
            <div className="space-y-6">
              {guestForms.map((g, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Primary Guest</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Input label="Full Name" value={g.name}
                        onChange={e => updateGuest(i, 'name', e.target.value)}
                        placeholder="John Doe" />
                    </div>
                    <Input label="Age" type="number" min="18" max="120" value={g.age}
                      onChange={e => updateGuest(i, 'age', e.target.value)}
                      placeholder="30" />
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <div className="flex gap-4">
                        {['MALE', 'FEMALE', 'OTHER'].map(gv => (
                          <label key={gv} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`gender-${i}`} value={gv}
                              checked={g.gender === gv} onChange={() => updateGuest(i, 'gender', gv)}
                              className="text-blue-600" />
                            <span className="text-sm text-gray-700 capitalize">{gv.toLowerCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button disabled={!step1Valid()} onClick={() => setStep(1)}>
                Continue to Contact Info
              </Button>
            </div>
          )}

          {/* Step 1: Contact */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-sm text-gray-500">Booking voucher will be sent to this email.</p>
              <Input label="Email Address" type="email" value={contact.email}
                onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                placeholder="you@example.com" />
              <Input label="Mobile Number" type="tel" value={contact.phone}
                onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                placeholder="+91 98765 43210" />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button disabled={!step2Valid()} onClick={() => setStep(2)}>Review & Pay</Button>
              </div>
            </div>
          )}

          {/* Step 2: Pay */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="text-gray-500">Guest:</span> {guestForms[0]?.name}</p>
                  <p><span className="text-gray-500">Contact:</span> {contact.email} · {contact.phone}</p>
                  <p><span className="text-gray-500">Check-in:</span> {checkIn && new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p><span className="text-gray-500">Check-out:</span> {checkOut && new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Payment Details</h2>
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                  This is a demo — enter any card details to simulate payment.
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

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button loading={loading} onClick={handleBook} className="flex-1">
                  Pay ₹{totalPrice.toLocaleString('en-IN')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Hotel summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Hotel Details</h3>
            <p className="font-medium text-gray-900">{hotel.name}</p>
            <p className="text-sm text-gray-500 mb-4">{hotel.city}</p>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Room type</span>
                <span className="font-medium">{room.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in</span>
                <span>{checkIn && new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-out</span>
                <span>{checkOut && new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{nights} night{nights !== 1 ? 's' : ''} × {rooms} room</span>
                <span>₹{(Number(room.pricePerNight) * nights * rooms).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-blue-600">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}