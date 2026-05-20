import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlightSearch from '../components/flights/FlightSearch'
import { ROUTES } from '../constants/routes'

const today = new Date().toISOString().split('T')[0]

const OFFERS = [
  { id: 1, tag: 'FLIGHTS', title: 'Fly Smart, Save Big', desc: 'Up to 30% off on select routes', color: 'from-orange-400 to-red-400',   emoji: '✈️' },
  { id: 2, tag: 'HOTELS',  title: 'Hotel Deals',         desc: 'Save up to 40% on stays',       color: 'from-purple-500 to-indigo-500', emoji: '🏨' },
  { id: 3, tag: 'TRAINS',  title: 'Train Offers',        desc: 'Tatkal bookings made easy',       color: 'from-green-400 to-teal-400',   emoji: '🚂' },
  { id: 4, tag: 'BUS',     title: 'Bus Cashback',        desc: 'Flat ₹150 off on bus tickets',   color: 'from-blue-400 to-cyan-400',    emoji: '🚌' },
]

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
  { city: 'Goa',       emoji: '🏖️', desc: 'Beach resorts from ₹650/night',    gradient: 'from-orange-200 to-yellow-100' },
  { city: 'Mumbai',    emoji: '🌆', desc: 'City hotels from ₹1,200/night',    gradient: 'from-blue-200 to-indigo-100' },
  { city: 'Delhi',     emoji: '🏛️', desc: 'Heritage stays from ₹1,200/night', gradient: 'from-red-100 to-orange-100' },
  { city: 'Bangalore', emoji: '🌿', desc: 'Tech hub hotels from ₹3,200/night',gradient: 'from-green-100 to-teal-100' },
]

const OFFER_TABS = ['All', 'Bank Offers', 'Flights', 'Hotels', 'Bus', 'Trains']

export default function HomePage() {
  const navigate = useNavigate()
  const [offerTab, setOfferTab] = useState('All')

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

        {/* Other services row */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {[
              { icon: '🏨', label: 'Hotels', route: ROUTES.HOTELS },
              { icon: '🚂', label: 'Trains', route: ROUTES.TRAINS },
              { icon: '🚌', label: 'Bus', route: ROUTES.BUSES },
              { icon: '🏖️', label: 'Holidays', route: ROUTES.HOLIDAYS },
            ].map(s => (
              <button key={s.label} onClick={() => s.route !== '#' && navigate(s.route)}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl hover:bg-orange-50 transition-colors group min-w-[70px]">
                <span className="text-3xl group-hover:scale-110 transition-transform">{s.icon}</span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-600">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Offers For You */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Offers For You</h2>
            <button className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
              View All <span>›</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
            {OFFER_TABS.map(tab => (
              <button key={tab} onClick={() => setOfferTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${offerTab === tab ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Offer cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {OFFERS.filter(o => offerTab === 'All' || o.tag === offerTab.toUpperCase()).map(offer => (
              <div key={offer.id}
                className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className={`bg-gradient-to-br ${offer.color} h-28 flex items-center justify-center text-6xl`}>
                  {offer.emoji}
                </div>
                <div className="p-3">
                  <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">{offer.tag}</span>
                  <p className="text-sm font-bold text-gray-900 mt-1">{offer.title}</p>
                  <p className="text-xs text-gray-500">{offer.desc}</p>
                </div>
              </div>
            ))}
            {OFFERS.filter(o => offerTab === 'All' || o.tag === offerTab.toUpperCase()).length === 0 && (
              <div className="col-span-4 text-center py-8 text-gray-400">
                <p>No offers available for this category right now.</p>
              </div>
            )}
          </div>
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
