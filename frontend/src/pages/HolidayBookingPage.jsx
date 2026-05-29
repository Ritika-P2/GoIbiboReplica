import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bookingStart, bookingSuccess, bookingFailure } from '../store/slices/bookingSlice'
import { bookingService } from '../services/bookingService'
import { couponService } from '../services/couponService'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const STEPS = ['Traveller Details', 'Contact Info', 'Review & Pay']

function fmt(price) {
  return Number(price).toLocaleString('en-IN')
}

export default function HolidayBookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector(s => s.booking)

  const { pkg } = location.state || {}

  const [step, setStep] = useState(0)
  const [paymentDone, setPaymentDone] = useState(false)

  const basePrice = pkg ? Number(pkg.price) : 0

  // Travellers
  const [adults,   setAdults]   = useState(1)
  const [children, setChildren] = useState(0)
  const [travellers, setTravellers] = useState([{ name: '', age: '', gender: 'MALE' }])

  // Contact
  const [contact, setContact] = useState({ email: '', phone: '' })

  // Coupon
  const [couponCode,    setCouponCode]    = useState('')
  const [couponInput,   setCouponInput]   = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponMsg,     setCouponMsg]     = useState('')
  const [couponError,   setCouponError]   = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  // Payment
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV,    setCardCVV]    = useState('')

  if (!pkg) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🌴</div>
        <p className="text-gray-500 text-lg mb-4">No package selected.</p>
        <Button onClick={() => navigate(ROUTES.HOLIDAYS)}>Browse Packages</Button>
      </div>
    )
  }

  const totalPax     = adults + children
  const subtotal     = basePrice * adults + Math.round(basePrice * 0.6) * children
  const discountAmt  = couponDiscount
  const totalPrice   = Math.max(0, subtotal - discountAmt)

  function updateTraveller(i, field, val) {
    setTravellers(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t))
  }

  function syncTravellers(newAdults, newChildren) {
    const total = newAdults + newChildren
    setTravellers(prev => {
      if (total > prev.length) {
        return [...prev, ...Array(total - prev.length).fill({ name: '', age: '', gender: 'MALE' })]
      }
      return prev.slice(0, total)
    })
  }

  function changeAdults(n) {
    const v = Math.max(1, Math.min(8, n))
    setAdults(v)
    syncTravellers(v, children)
  }
  function changeChildren(n) {
    const v = Math.max(0, Math.min(4, n))
    setChildren(v)
    syncTravellers(adults, v)
  }

  function getTravellerErrors() {
    const errors = travellers.map((t, i) => {
      const errs = {}
      if (!t.name.trim()) {
        errs.name = 'Name is required.'
      } else {
        const nameCount = travellers.filter((x, j) => j !== i && x.name.trim().toLowerCase() === t.name.trim().toLowerCase()).length
        if (nameCount > 0) errs.name = 'Each traveller must have a unique name.'
      }
      const age = Number(t.age)
      if (!t.age) {
        errs.age = 'Age is required.'
      } else if (isNaN(age) || age <= 0) {
        errs.age = 'Enter a valid age.'
      } else if (i < adults && age < 12) {
        errs.age = 'Adults must be 12 years or older.'
      } else if (i < adults && age > 100) {
        errs.age = 'Age cannot be more than 100 years.'
      } else if (i >= adults && age > 18) {
        errs.age = 'Children must be 18 years or younger.'
      } else if (i >= adults && age < 2) {
        errs.age = 'Children must be at least 2 years old.'
      }
      return errs
    })
    return errors
  }

  function step1Valid() {
    const errors = getTravellerErrors()
    return errors.every(e => Object.keys(e).length === 0)
  }
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)
  function step2Valid() {
    return emailValid && contact.phone.length >= 10
  }

  async function applyCoupon() {
    setCouponError('')
    setCouponMsg('')
    setCouponDiscount(0)
    setCouponCode('')
    if (!couponInput.trim()) return
    setCouponLoading(true)
    try {
      const res = await couponService.validate(couponInput.trim(), subtotal)
      setCouponDiscount(res.data.discount)
      setCouponCode(res.data.code)
      setCouponMsg(res.data.description)
    } catch (e) {
      setCouponError(e.message || 'Invalid coupon code.')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setCouponCode('')
    setCouponInput('')
    setCouponDiscount(0)
    setCouponMsg('')
    setCouponError('')
  }

  async function handleBook() {
    dispatch(bookingStart())
    try {
      const res = await bookingService.create({
        type: 'HOLIDAY',
        passengers: travellers,
        contactInfo: contact,
        totalAmount: totalPrice,
        packageData: {
          id:            pkg.id,
          title:         pkg.title,
          duration:      pkg.duration,
          city:          pkg.city,
          highlights:    pkg.highlights,
          tags:          pkg.tags,
          basePrice:     basePrice,
          adults,
          children,
          couponCode:    couponCode || null,
          couponDiscount: discountAmt,
        },
      })
      const bookingId = res.data.booking?.id
      dispatch(bookingSuccess({ bookingId }))
      setPaymentDone(true)
      setTimeout(() => {
        navigate(ROUTES.BOOKING_CONFIRMATION, {
          state: {
            bookingId,
            type: 'HOLIDAY',
            pkg,
            travellers,
            contact,
            totalPrice,
            adults,
            children,
            couponCode,
            couponDiscount: discountAmt,
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left — steps */}
        <div className="flex-1 min-w-0">

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-pink-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                    ${i < step  ? 'bg-pink-600 border-pink-600 text-white'
                    : i === step ? 'border-pink-600 text-pink-600'
                    : 'border-gray-300 text-gray-400'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-pink-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* STEP 0 — Traveller Details */}
          {step === 0 && (
            <div className="space-y-5">
              {/* Pax selector */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Number of Travellers</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Adults', sub: '(12+ years)', val: adults, change: changeAdults },
                    { label: 'Children', sub: '(2–11 years)', val: children, change: changeChildren },
                  ].map(({ label, sub, val, change }) => (
                    <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => change(val - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                          disabled={label === 'Adults' ? val <= 1 : val <= 0}>
                          −
                        </button>
                        <span className="w-5 text-center font-bold text-gray-900">{val}</span>
                        <button onClick={() => change(val + 1)}
                          className="w-8 h-8 rounded-full border border-pink-300 flex items-center justify-center text-pink-600 hover:bg-pink-50 disabled:opacity-40"
                          disabled={label === 'Adults' ? val >= 8 : val >= 4}>
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traveller forms */}
              {(() => {
                const tErrors = getTravellerErrors()
                return travellers.map((t, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">
                      Traveller {i + 1}
                      <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {i < adults ? 'Adult (12+ yrs)' : 'Child (2–18 yrs)'}
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <Input label="Full Name (as on ID)" value={t.name}
                          onChange={e => updateTraveller(i, 'name', e.target.value)}
                          placeholder="John Doe"
                          error={t.name !== '' ? tErrors[i]?.name : undefined} />
                      </div>
                      <div>
                        <Input label={i < adults ? 'Age (12+)' : 'Age (2–18)'} type="number"
                          min={i < adults ? 12 : 2} max={i < adults ? 100 : 18}
                          value={t.age}
                          onChange={e => updateTraveller(i, 'age', e.target.value)}
                          placeholder={i < adults ? '25' : '10'}
                          error={t.age !== '' ? tErrors[i]?.age : undefined} />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <div className="flex gap-4">
                          {['MALE', 'FEMALE', 'OTHER'].map(g => (
                            <label key={g} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`gender-${i}`} value={g}
                                checked={t.gender === g} onChange={() => updateTraveller(i, 'gender', g)}
                                className="accent-pink-600" />
                              <span className="text-sm text-gray-700 capitalize">{g.toLowerCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              })()}

              {!step1Valid() && travellers.some(t => t.name || t.age) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-700 mb-1">Please fix the following:</p>
                  <ul className="space-y-0.5">
                    {getTravellerErrors().map((e, i) => Object.values(e).map((msg, j) => (
                      <li key={`${i}-${j}`} className="text-xs text-red-600">• Traveller {i + 1}: {msg}</li>
                    )))}
                  </ul>
                </div>
              )}
              <Button disabled={!step1Valid()} onClick={() => setStep(1)}
                className="bg-pink-600 hover:bg-pink-700">
                Continue to Contact Info
              </Button>
            </div>
          )}

          {/* STEP 1 — Contact */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-sm text-gray-500">Booking confirmation and itinerary will be sent to this email.</p>
              <Input label="Email Address" type="email" value={contact.email}
                onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                placeholder="you@example.com"
                error={contact.email && !emailValid ? 'Enter a valid email address (e.g. user@example.com)' : ''} />
              <Input label="Mobile Number" type="tel" value={contact.phone}
                onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                placeholder="+91 98765 43210" />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button disabled={!step2Valid()} onClick={() => setStep(2)}
                  className="bg-pink-600 hover:bg-pink-700">
                  Review & Pay
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 — Review + Pay */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Booking summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="text-gray-500">Package:</span> {pkg.title} ({pkg.duration})</p>
                  <p><span className="text-gray-500">Destination:</span> {pkg.city}</p>
                  <p><span className="text-gray-500">Travellers:</span> {adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}</p>
                  <p><span className="text-gray-500">Contact:</span> {contact.email} · {contact.phone}</p>
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Apply Coupon</h2>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-green-700">{couponCode} applied!</p>
                      <p className="text-xs text-green-600 mt-0.5">{couponMsg} — saving ₹{couponDiscount.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-red-500 hover:text-red-700 ml-4">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        placeholder="Enter coupon code (e.g. QUICK20)"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent uppercase tracking-widest"
                      />
                      <Button onClick={applyCoupon} loading={couponLoading}
                        className="bg-pink-600 hover:bg-pink-700 shrink-0">
                        Apply
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['QUICK20', 'GOIBIBO10', 'FLAT500', 'FIRSTTRIP'].map(code => (
                        <button key={code} onClick={() => { setCouponInput(code); setCouponError('') }}
                          className="text-xs bg-pink-50 text-pink-700 border border-pink-200 rounded-full px-3 py-1 hover:bg-pink-100 transition-colors font-mono">
                          {code}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">Try QUICK20 for 20% off · SUMMER30 for 30% off above ₹15,000</p>
                  </div>
                )}
              </div>

              {/* Payment */}
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
                <Button loading={loading} onClick={handleBook}
                  className="flex-1 bg-pink-600 hover:bg-pink-700">
                  Pay ₹{totalPrice.toLocaleString('en-IN')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Package summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
            {/* Package header */}
            <div className="h-28 bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center text-6xl relative">
              {pkg.img}
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {Math.round((1 - basePrice / Number(pkg.originalPrice)) * 100)}% OFF
              </span>
            </div>

            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-lg">{pkg.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{pkg.duration} · {pkg.city}</p>

              <div className="flex flex-wrap gap-1 my-3">
                {pkg.tags.map(t => (
                  <span key={t} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>

              <ul className="space-y-1 mb-4">
                {pkg.highlights.map(h => (
                  <li key={h} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="text-green-500">✓</span> {h}
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 pt-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{adults} adult{adults !== 1 ? 's' : ''} × ₹{basePrice.toLocaleString('en-IN')}</span>
                  <span>₹{(basePrice * adults).toLocaleString('en-IN')}</span>
                </div>
                {children > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{children} child{children !== 1 ? 'ren' : ''} × ₹{Math.round(basePrice * 0.6).toLocaleString('en-IN')}</span>
                    <span>₹{(Math.round(basePrice * 0.6) * children).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes & fees</span>
                  <span>Included</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({couponCode})</span>
                    <span>−₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-pink-600">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-400 text-right">per person pricing applied</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
