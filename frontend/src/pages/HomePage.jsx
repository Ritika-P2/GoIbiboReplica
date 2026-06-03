import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FlightSearch from '../components/flights/FlightSearch'
import OfferCard from '../components/offers/OfferCard'
import OfferCardSkeleton from '../components/offers/OfferCardSkeleton'
import { offerService } from '../services/offerService'
import { analytics } from '../services/analyticsService'
import { ROUTES } from '../constants/routes'

const today = new Date().toISOString().split('T')[0]

const POPULAR_ROUTES = [
  { from: 'DEL', to: 'BOM', label: 'Delhi → Mumbai',    price: '₹3,999' },
  { from: 'BOM', to: 'GOI', label: 'Mumbai → Goa',      price: '₹2,599' },
  { from: 'DEL', to: 'BLR', label: 'Delhi → Bangalore', price: '₹3,999' },
  { from: 'BLR', to: 'DEL', label: 'Bangalore → Delhi', price: '₹4,799' },
  { from: 'DEL', to: 'CCU', label: 'Delhi → Kolkata',   price: '₹4,200' },
  { from: 'DEL', to: 'GOI', label: 'Delhi → Goa',       price: '₹5,200' },
  { from: 'BOM', to: 'DEL', label: 'Mumbai → Delhi',    price: '₹3,799' },
  { from: 'MAA', to: 'BOM', label: 'Chennai → Mumbai',  price: '₹4,100' },
]

const POPULAR_HOTELS = [
  { city: 'Goa',       emoji: '🏖️', desc: 'Beach resorts from ₹650/night',     gradient: 'from-orange-200 to-yellow-100' },
  { city: 'Mumbai',    emoji: '🌆', desc: 'City hotels from ₹1,200/night',     gradient: 'from-blue-200 to-indigo-100' },
  { city: 'Delhi',     emoji: '🏛️', desc: 'Heritage stays from ₹1,200/night',  gradient: 'from-red-100 to-orange-100' },
  { city: 'Bangalore', emoji: '🌿', desc: 'Tech hub hotels from ₹3,200/night', gradient: 'from-green-100 to-teal-100' },
]

// Tab label → API category filter (empty = All)
const OFFER_TABS = [
  { label: 'All',         category: '' },
  { label: 'Bank Offers', category: 'BANK' },
  { label: 'Flights',     category: 'FLIGHTS' },
  { label: 'Hotels',      category: 'HOTELS' },
  { label: 'Bus',         category: 'BUS' },
  { label: 'Trains',      category: 'TRAINS' },
]

export default function HomePage() {
  const navigate = useNavigate()

  const [activeTab,  setActiveTab]  = useState(OFFER_TABS[0])
  const [allOffers,  setAllOffers]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState(false)

  // Fetch all offers once; tab filtering is client-side
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    offerService.list({ limit: 100 })
      .then(res => {
        if (!cancelled) {
          const offers = res.data?.offers || []
          setAllOffers(offers)
          offers.forEach(o => analytics.offerViewed(o))
        }
      })
      .catch(() => { if (!cancelled) setFetchError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const visibleOffers = activeTab.category
    ? allOffers.filter(o => o.category === activeTab.category)
    : allOffers

  function handleOfferClick(offer) {
    navigate(`/offers/details/${offer.id}`, { state: { offer } })
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Orange hero with flight search ── */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
          <h1 className="text-white text-xl font-bold text-center mb-5">
            Domestic and International Flights
          </h1>
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <FlightSearch />
          </div>
        </div>
      </div>

      {/* ── Content below hero ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16 space-y-8">

        {/* Service shortcuts */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {[
              { icon: '🏨', label: 'Hotels',   route: ROUTES.HOTELS },
              { icon: '🚂', label: 'Trains',   route: ROUTES.TRAINS },
              { icon: '🚌', label: 'Bus',      route: ROUTES.BUSES },
              { icon: '🏖️', label: 'Holidays', route: ROUTES.HOLIDAYS },
            ].map(s => (
              <button key={s.label} onClick={() => navigate(s.route)}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl hover:bg-orange-50 transition-colors group min-w-[70px]">
                <span className="text-3xl group-hover:scale-110 transition-transform">{s.icon}</span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-600">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Offers For You ── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Offers For You</h2>
            <span className="text-xs text-gray-400">{allOffers.length} offers available</span>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
            {OFFER_TABS.map(tab => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${
                  activeTab.label === tab.label
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <OfferCardSkeleton key={i} />)}
            </div>
          )}

          {/* Error state */}
          {!loading && fetchError && (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="text-gray-500 text-sm">Could not load offers right now. Please try again later.</p>
            </div>
          )}

          {/* Empty state (filtered) */}
          {!loading && !fetchError && visibleOffers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">🏷️</p>
              <p>No offers available for this category right now.</p>
            </div>
          )}

          {/* Offer grid */}
          {!loading && !fetchError && visibleOffers.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleOffers.map(offer => (
                <OfferCard key={offer.id} offer={offer} onClick={handleOfferClick} />
              ))}
            </div>
          )}
        </div>

        {/* Popular Flight Routes */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Flight Routes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {POPULAR_ROUTES.map(route => (
              <a key={route.label}
                href={`/flights/results?origin=${route.from}&destination=${route.to}&date=${today}&passengers=1&cabin=ECONOMY&specialFare=REGULAR`}
                className="group flex flex-col p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-700">{route.label}</span>
                <span className="text-xs text-orange-500 font-bold mt-1">from {route.price}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Popular Hotels */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Hotel Destinations</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_HOTELS.map(dest => (
              <a key={dest.city}
                href={`/hotels/results?city=${dest.city}&guests=2&checkIn=${today}`}
                className="group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                <div className={`h-32 bg-gradient-to-br ${dest.gradient} flex items-center justify-center text-6xl group-hover:scale-105 transition-transform`}>
                  {dest.emoji}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900">{dest.city}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{dest.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Why Goibibo */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Why Book with Goibibo?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '💰', title: 'Best Prices Guaranteed', desc: 'Lowest fares on flights, hotels, trains and more.' },
              { icon: '⚡', title: 'Instant Confirmation',    desc: 'Confirm your trip in seconds with seamless checkout.' },
              { icon: '🛡️', title: 'Safe & Secure',          desc: 'Your payments and personal data are always protected.' },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
