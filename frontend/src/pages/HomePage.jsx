import { useState } from 'react'
import FlightSearch from '../components/flights/FlightSearch'
import HotelSearch from '../components/hotels/HotelSearch'

const tabs = [
  { id: 'flights',  label: 'Flights',  icon: '✈️' },
  { id: 'hotels',   label: 'Hotels',   icon: '🏨' },
  { id: 'trains',   label: 'Trains',   icon: '🚆' },
  { id: 'buses',    label: 'Buses',    icon: '🚌' },
  { id: 'cabs',     label: 'Cabs',     icon: '🚖' },
  { id: 'holidays', label: 'Holidays', icon: '🌴' },
]

const popularRoutes = [
  { from: 'DEL', to: 'BOM', label: 'Delhi → Mumbai',     price: '₹3,999' },
  { from: 'BOM', to: 'GOI', label: 'Mumbai → Goa',        price: '₹2,599' },
  { from: 'DEL', to: 'BLR', label: 'Delhi → Bangalore',  price: '₹3,999' },
  { from: 'BLR', to: 'DEL', label: 'Bangalore → Delhi',  price: '₹4,799' },
  { from: 'DEL', to: 'CCU', label: 'Delhi → Kolkata',    price: '₹4,200' },
  { from: 'DEL', to: 'GOI', label: 'Delhi → Goa',        price: '₹5,200' },
]

const popularHotels = [
  { city: 'Goa',       img: '🏖️', desc: 'Beach resorts from ₹650/night' },
  { city: 'Mumbai',    img: '🌆', desc: 'City hotels from ₹1,200/night' },
  { city: 'Delhi',     img: '🏛️', desc: 'Heritage stays from ₹1,200/night' },
  { city: 'Bangalore', img: '🌿', desc: 'Tech hub hotels from ₹3,200/night' },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('flights')
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Where do you want to go?
            </h1>
            <p className="mt-3 text-blue-100 text-lg">
              Flights, hotels, trains, buses and more — all in one place.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-6 justify-center flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-blue-100 hover:bg-blue-500/50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {activeTab === 'flights' && <FlightSearch />}
            {activeTab === 'hotels'  && <HotelSearch />}
            {!['flights','hotels'].includes(activeTab) && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-5xl mb-3">{tabs.find(t=>t.id===activeTab)?.icon}</div>
                <p className="text-lg font-medium text-gray-600 capitalize">{activeTab} search coming soon</p>
                <p className="text-sm mt-1">We're working on it!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Flight Routes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Flight Routes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularRoutes.map(route => (
              <a
                key={route.label}
                href={`/flights/results?origin=${route.from}&destination=${route.to}&date=${today}&passengers=1&cabin=ECONOMY`}
                className="group flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-center"
              >
                <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700">{route.label}</span>
                <span className="text-xs text-blue-600 font-bold mt-1">from {route.price}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Popular Hotel Destinations */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Hotel Destinations</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {popularHotels.map(dest => (
            <a
              key={dest.city}
              href={`/hotels/results?city=${dest.city}&guests=2&checkIn=${today}`}
              className="group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="h-36 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                {dest.img}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{dest.city}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{dest.desc}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Why Goibibo */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Book with Goibibo?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '💰', title: 'Best Prices', desc: 'Guaranteed lowest fares on flights, hotels, and more.' },
              { icon: '⚡', title: 'Instant Booking', desc: 'Confirm your trip in seconds with our seamless checkout.' },
              { icon: '🛡️', title: 'Safe & Secure', desc: 'Your payments and personal data are fully protected.' },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center gap-3">
                <div className="text-4xl">{item.icon}</div>
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