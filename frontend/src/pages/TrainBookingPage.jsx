import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bookingStart, bookingSuccess, bookingFailure } from '../store/slices/bookingSlice'
import { bookingService } from '../services/bookingService'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const STEPS = ['Passenger Details', 'Contact Info', 'Review & Pay']

const CLASS_LABELS = { SL: 'Sleeper', '3A': 'AC 3 Tier', '2A': 'AC 2 Tier', '1A': 'AC First Class', CC: 'Chair Car' }
const CLASS_COLORS = {
  SL: 'bg-blue-100 text-blue-700',
  '3A': 'bg-purple-100 text-purple-700',
  '2A': 'bg-indigo-100 text-indigo-700',
  '1A': 'bg-yellow-100 text-yellow-700',
  CC: 'bg-green-100 text-green-700',
}

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtDur(mins) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function TrainBookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector(s => s.booking)

  const { train, selectedClass, classPrice, classSeats, date } = location.state || {}

  const [step, setStep] = useState(0)
  const [paymentDone, setPaymentDone] = useState(false)
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'MALE' }])
  const [contact, setContact]       = useState({ email: '', phone: '' })
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV,    setCardCVV]    = useState('')

  if (!train || !selectedClass) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🚆</div>
        <p className="text-gray-500 text-lg mb-4">No train selected.</p>
        <Button onClick={() => navigate(ROUTES.TRAINS)}>Search Trains</Button>
      </div>
    )
  }

  const totalPrice = classPrice * passengers.length

  function updatePassenger(i, field, value) {
    setPassengers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function addPassenger() {
    if (passengers.length < classSeats && passengers.length < 6) {
      setPassengers(prev => [...prev, { name: '', age: '', gender: 'MALE' }])
    }
  }

  function removePassenger(i) {
    if (passengers.length > 1) setPassengers(prev => prev.filter((_, idx) => idx !== i))
  }

  function step1Valid() {
    return passengers.every(p => p.name.trim() && p.age && Number(p.age) > 0)
  }
  function step2Valid() {
    return contact.email.includes('@') && contact.phone.length >= 10
  }

  async function handleBook() {
    dispatch(bookingStart())
    try {
      const res = await bookingService.create({
        type: 'TRAIN',
        trainId: train.id,
        passengers,
        contactInfo: contact,
        totalAmount: totalPrice,
      })
      const bookingId = res.data.booking?.id
      dispatch(bookingSuccess({ bookingId }))
      setPaymentDone(true)
      setTimeout(() => {
        navigate(ROUTES.BOOKING_CONFIRMATION, {
          state: { bookingId, type: 'TRAIN', train, selectedClass, classPrice, passengers, contact, totalPrice, date }
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
        {/* Left — steps */}
        <div className="flex-1 min-w-0">

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i < step ? 'bg-green-600 border-green-600 text-white' : i === step ? 'border-green-600 text-green-600' : 'border-gray-300 text-gray-400'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* STEP 0 — Passengers */}
          {step === 0 && (
            <div className="space-y-4">
              {passengers.map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Passenger {i + 1}</h2>
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
                              className="accent-green-600" />
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
                  className="w-full py-3 border-2 border-dashed border-green-300 rounded-xl text-green-600 text-sm font-medium hover:border-green-400 hover:bg-green-50 transition-colors">
                  + Add Another Passenger
                </button>
              )}

              <Button disabled={!step1Valid()} onClick={() => setStep(1)}>
                Continue to Contact Info
              </Button>
            </div>
          )}

          {/* STEP 1 — Contact */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-sm text-gray-500">Booking confirmation will be sent to this email.</p>
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

          {/* STEP 2 — Review + Pay */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="text-gray-500">Passengers:</span> {passengers.map(p => p.name).join(', ')}</p>
                  <p><span className="text-gray-500">Contact:</span> {contact.email} · {contact.phone}</p>
                  <p><span className="text-gray-500">Class:</span> {CLASS_LABELS[selectedClass] || selectedClass}</p>
                </div>
              </div>

              {/* Mock payment */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Payment Details</h2>
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button loading={loading} onClick={handleBook} className="flex-1">
                  Pay ₹{totalPrice.toLocaleString('en-IN')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Train summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Train Details</h3>

            <div className="mb-4">
              <p className="font-bold text-gray-900">{train.trainName}</p>
              <p className="text-xs text-gray-400">#{train.trainNumber}</p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xl font-bold text-gray-900">{fmt(train.departureTime)}</p>
                <p className="text-sm text-gray-600">{train.origin}</p>
              </div>
              <div className="text-center text-xs text-gray-400 px-2">
                <p>{fmtDur(train.duration)}</p>
                <div className="w-12 h-px bg-gray-300 my-1 mx-auto" />
                <p>🚆</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{fmt(train.arrivalTime)}</p>
                <p className="text-sm text-gray-600">{train.destination}</p>
              </div>
            </div>

            {date && (
              <p className="text-xs text-gray-500 mb-3">{fmtDate(date)}</p>
            )}

            <div className="mb-4">
              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${CLASS_COLORS[selectedClass] || 'bg-gray-100 text-gray-600'}`}>
                {CLASS_LABELS[selectedClass] || selectedClass}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fare × {passengers.length} pax</span>
                <span>₹{(classPrice * passengers.length).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxes & fees</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-green-600">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}