import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { offerService } from '../services/offerService'
import { analytics } from '../services/analyticsService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'

// Maps offer category to the booking route the user should land on
const CATEGORY_ROUTE = {
  FLIGHTS: ROUTES.FLIGHTS,
  HOTELS:  ROUTES.HOTELS,
  TRAINS:  ROUTES.TRAINS,
  BUS:     ROUTES.BUSES,
  BANK:    ROUTES.FLIGHTS,
}

const CATEGORY_LABEL = {
  FLIGHTS: 'Flights',
  HOTELS:  'Hotels',
  TRAINS:  'Trains',
  BUS:     'Bus',
  BANK:    'Bank Offers',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function OfferDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Accept offer passed via navigation state to avoid an extra API round-trip
  const stateOffer = location.state?.offer || null

  const [offer,   setOffer]   = useState(stateOffer)
  const [loading, setLoading] = useState(!stateOffer)
  const [error,   setError]   = useState(null)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    if (stateOffer) {
      analytics.offerViewed(stateOffer)
      return
    }
    let cancelled = false
    setLoading(true)
    offerService.getById(id)
      .then(res => {
        if (!cancelled) {
          setOffer(res.data?.offer)
          analytics.offerViewed(res.data?.offer)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Offer not found or no longer available.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, stateOffer])

  function handleCopyCode() {
    navigator.clipboard.writeText(offer.offerCode).then(() => {
      analytics.offerApplied(offer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function handleBookNow() {
    const route = CATEGORY_ROUTE[offer.category] || ROUTES.HOME
    navigate(route)
  }

  if (loading) return <Loader fullPage text="Loading offer details..." />

  if (error || !offer) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-800">Offer not found</h2>
        <p className="text-gray-500 mt-2">{error || 'This offer may have expired or been removed.'}</p>
        <button onClick={() => navigate(ROUTES.HOME)}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
          Back to Home
        </button>
      </div>
    )
  }

  const isExpired = new Date(offer.validTo) < new Date()
  const daysLeft = Math.max(0, Math.ceil((new Date(offer.validTo) - new Date()) / 86400000))

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Hero banner */}
      <div className={`bg-gradient-to-br ${offer.color} py-14`}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-8xl mb-4">{offer.emoji}</div>
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            {CATEGORY_LABEL[offer.category] || offer.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow">{offer.title}</h1>
          <p className="mt-3 text-white/90 text-sm sm:text-base max-w-xl mx-auto">{offer.description}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 pb-16 space-y-5">

        {/* Offer code card */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Offer Code</p>
            <p className="text-2xl font-extrabold text-gray-900 tracking-widest mt-0.5">{offer.offerCode}</p>
            <p className="text-sm text-orange-500 font-semibold mt-1">
              {offer.discountPercent}% off · up to ₹{Number(offer.maxDiscountAmount).toLocaleString('en-IN')} savings
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
          >
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Validity & key details */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Offer Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <p className="text-2xl font-extrabold text-orange-500">{offer.discountPercent}%</p>
              <p className="text-xs text-gray-500 mt-1">Discount</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-extrabold text-green-600">
                ₹{Number(offer.maxDiscountAmount).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Max Savings</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-lg font-extrabold text-blue-600">{fmtDate(offer.validFrom)}</p>
              <p className="text-xs text-gray-500 mt-1">Valid From</p>
            </div>
            <div className={`text-center p-3 rounded-xl ${isExpired ? 'bg-red-50' : 'bg-purple-50'}`}>
              <p className={`text-lg font-extrabold ${isExpired ? 'text-red-500' : 'text-purple-600'}`}>
                {isExpired ? 'Expired' : `${daysLeft}d left`}
              </p>
              <p className="text-xs text-gray-500 mt-1">Valid Till {fmtDate(offer.validTo)}</p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-3">Terms &amp; Conditions</h2>
          <ul className="space-y-2">
            {offer.termsConditions.split('. ').filter(Boolean).map((term, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                <span>{term.endsWith('.') ? term : `${term}.`}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopyCode}
            disabled={isExpired}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              isExpired
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : copied
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {isExpired ? 'Offer Expired' : copied ? '✓ Code Copied!' : 'Apply Offer'}
          </button>
          <button
            onClick={handleBookNow}
            disabled={isExpired}
            className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
              isExpired
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'
            }`}
          >
            Book Now →
          </button>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
