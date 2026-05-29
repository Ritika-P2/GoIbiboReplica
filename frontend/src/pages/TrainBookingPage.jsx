import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bookingStart, bookingSuccess, bookingFailure } from '../store/slices/bookingSlice'
import { bookingService } from '../services/bookingService'
import { ROUTES } from '../constants/routes'

const STEPS = ['Passenger Details', 'Contact Info', 'Review & Pay']

const CLASS_LABELS = {
  SL:  'Sleeper',
  '3A':'AC 3 Tier',
  '2A':'AC 2 Tier',
  '1A':'AC First Class',
  CC:  'Chair Car',
  EC:  'Exec Chair Car',
}

const CLASS_STYLES = {
  SL:  'bg-blue-100 text-blue-700',
  '3A':'bg-purple-100 text-purple-700',
  '2A':'bg-indigo-100 text-indigo-700',
  '1A':'bg-yellow-100 text-yellow-700',
  CC:  'bg-green-100 text-green-700',
  EC:  'bg-teal-100 text-teal-700',
}

const QUOTA_LABELS = {
  GN: 'General', LD: 'Ladies', TQ: 'Tatkal', PT: 'Premium Tatkal', SS: 'Senior Citizen', HH: 'Divyaang'
}

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDate(dt) {
  if (!dt) return ''
  return new Date(dt + (dt.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}
function fmtDur(mins) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

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

export default function TrainBookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector(s => s.booking)

  const { train, selectedClass, classPrice, classSeats, date, quota } = location.state || {}

  const [step,        setStep]        = useState(0)
  const [paymentDone, setPaymentDone] = useState(false)
  const isLadiesQuota       = quota === 'LD'
  const isSeniorCitizenQuota = quota === 'SS'
  const [passengers,  setPassengers]  = useState([{ name: '', age: '', gender: isLadiesQuota ? 'FEMALE' : 'MALE' }])
  const [contact,     setContact]     = useState({ email: '', phone: '' })
  const [cardNumber,  setCardNumber]  = useState('')
  const [cardExpiry,  setCardExpiry]  = useState('')
  const [cardCVV,     setCardCVV]     = useState('')

  if (!train || !selectedClass) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🚆</div>
        <p className="text-gray-500 text-lg mb-4">No train selected.</p>
        <button onClick={() => navigate(ROUTES.TRAINS)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full">
          Search Trains
        </button>
      </div>
    )
  }

  const totalPrice = classPrice * passengers.length

  function updatePassenger(i, field, value) {
    setPassengers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function addPassenger() {
    if (passengers.length < Math.min(classSeats, 6)) {
      setPassengers(prev => [...prev, { name: '', age: '', gender: isLadiesQuota ? 'FEMALE' : 'MALE' }])
    }
  }

  function removePassenger(i) {
    if (passengers.length > 1) setPassengers(prev => prev.filter((_, idx) => idx !== i))
  }

  const step1Valid = passengers.every(p =>
    p.name.trim() && p.age && Number(p.age) > 0 && Number(p.age) <= 100 &&
    (!isLadiesQuota || p.gender === 'FEMALE') &&
    (!isSeniorCitizenQuota || Number(p.age) >= 60)
  )
  const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contact.email)
  const phoneValid = /^[6-9]\d{9}$/.test(contact.phone)
  const step2Valid = emailValid && phoneValid

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
          state: { bookingId, type: 'TRAIN', train, selectedClass, classPrice, passengers, contact, totalPrice, date, quota }
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
          <h1 className="text-white text-xl font-bold">Complete Your Train Booking</h1>
          <p className="text-orange-100 text-sm mt-1">
            {train.trainName} · #{train.trainNumber} · {train.origin} → {train.destination}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Steps */}
          <div className="flex-1 min-w-0">
            <StepIndicator step={step} />

            {/* Step 0: Passengers */}
            {step === 0 && (
              <div className="space-y-4">
                {isLadiesQuota && (
                  <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <span className="text-pink-500 text-lg shrink-0">♀</span>
                    <p className="text-sm text-pink-700 font-medium">
                      Ladies Quota — only female passengers are allowed on this booking.
                    </p>
                  </div>
                )}
                {isSeniorCitizenQuota && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <span className="text-blue-500 text-lg shrink-0">🧓</span>
                    <p className="text-sm text-blue-700 font-medium">
                      Senior Citizen Quota — all passengers must be 60 years of age or above.
                    </p>
                  </div>
                )}
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
                        <Field label="Full Name (as on ID)">
                          <input className={inputClass} value={p.name}
                            onChange={e => updatePassenger(i, 'name', e.target.value)}
                            placeholder="John Doe" />
                        </Field>
                      </div>
                      <Field label={isSeniorCitizenQuota ? 'Age (min. 60)' : 'Age'}>
                        <input
                          className={`${inputClass} ${isSeniorCitizenQuota && p.age && Number(p.age) < 60 ? 'border-red-400 focus:ring-red-400' : ''}`}
                          type="number"
                          min={isSeniorCitizenQuota ? '60' : '1'}
                          max="100"
                          value={p.age}
                          onChange={e => updatePassenger(i, 'age', e.target.value)}
                          placeholder={isSeniorCitizenQuota ? '60+' : '25'} />
                        {p.age && Number(p.age) > 100 && (
                          <p className="text-xs text-red-500 mt-1">Age cannot be more than 100 years.</p>
                        )}
                        {isSeniorCitizenQuota && p.age && Number(p.age) <= 100 && Number(p.age) < 60 && (
                          <p className="text-xs text-red-500 mt-1">Passenger must be 60 years or above for Senior Citizen quota.</p>
                        )}
                      </Field>
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <div className="flex gap-4">
                          {['MALE', 'FEMALE', 'OTHER'].map(g => {
                            const disabled = isLadiesQuota && g !== 'FEMALE'
                            return (
                              <label key={g} className={`flex items-center gap-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input type="radio" name={`gender-${i}`} value={g}
                                  checked={p.gender === g}
                                  onChange={() => !disabled && updatePassenger(i, 'gender', g)}
                                  disabled={disabled}
                                  className="accent-orange-500" />
                                <span className="text-sm text-gray-700 capitalize">{g.toLowerCase()}</span>
                              </label>
                            )
                          })}
                        </div>
                        {isLadiesQuota && p.gender !== 'FEMALE' && (
                          <p className="text-xs text-red-500 mt-1">Only female passengers allowed for Ladies quota.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {passengers.length < 6 && (
                  <button onClick={addPassenger}
                    className="w-full py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-500 text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-colors">
                    + Add Another Passenger
                  </button>
                )}

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
                <p className="text-sm text-gray-500">Booking confirmation will be sent to this email.</p>
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

            {/* Step 2: Review + Pay */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="text-gray-500">Passengers:</span> {passengers.map(p => p.name).join(', ')}</p>
                    <p><span className="text-gray-500">Contact:</span> {contact.email} · {contact.phone}</p>
                    <p><span className="text-gray-500">Class:</span> {CLASS_LABELS[selectedClass] || selectedClass}</p>
                    <p><span className="text-gray-500">Quota:</span> {QUOTA_LABELS[quota] || quota || 'General'}</p>
                    <p><span className="text-gray-500">Journey Date:</span> {fmtDate(date)}</p>
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

          {/* Right: Train summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">Train Details</h3>

              <p className="font-bold text-gray-900">{train.trainName}</p>
              <p className="text-xs text-gray-400 mt-0.5">#{train.trainNumber}</p>

              <div className="flex justify-between items-center mt-4 mb-3">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{fmt(train.departureTime)}</p>
                  <p className="text-sm font-medium text-gray-600">{train.origin}</p>
                </div>
                <div className="text-center text-xs text-gray-400 px-2">
                  <p>{fmtDur(train.duration)}</p>
                  <div className="w-12 h-px bg-gray-300 my-1 mx-auto" />
                  <p>🚆</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{fmt(train.arrivalTime)}</p>
                  <p className="text-sm font-medium text-gray-600">{train.destination}</p>
                </div>
              </div>

              {date && <p className="text-xs text-gray-500 mb-3">{fmtDate(date)}</p>}

              <div className="flex gap-2 mb-4 flex-wrap">
                <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${CLASS_STYLES[selectedClass] || 'bg-gray-100 text-gray-600'}`}>
                  {CLASS_LABELS[selectedClass] || selectedClass}
                </span>
                {quota && quota !== 'GN' && (
                  <span className="inline-flex px-2 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
                    {QUOTA_LABELS[quota] || quota}
                  </span>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fare × {passengers.length} pax</span>
                  <span>₹{(classPrice * passengers.length).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxes & fees</span>
                  <span>Included</span>
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
