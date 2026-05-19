import HotelSearch from '../components/hotels/HotelSearch'

const DESTINATIONS = [
  { city: 'Goa',       icon: '🏖️', desc: 'Beach resorts from ₹650/night',     gradient: 'from-orange-200 to-yellow-100' },
  { city: 'Mumbai',    icon: '🌆', desc: 'City hotels from ₹1,200/night',     gradient: 'from-blue-200 to-indigo-100' },
  { city: 'Delhi',     icon: '🏛️', desc: 'Heritage stays from ₹1,200/night',  gradient: 'from-red-100 to-orange-100' },
  { city: 'Bangalore', icon: '🌿', desc: 'Tech hub hotels from ₹3,200/night', gradient: 'from-green-100 to-teal-100' },
  { city: 'Jaipur',    icon: '🏰', desc: 'Palace hotels from ₹900/night',     gradient: 'from-pink-100 to-rose-100' },
  { city: 'Udaipur',   icon: '🛶', desc: 'Lake view hotels from ₹2,000/night',gradient: 'from-cyan-100 to-blue-100' },
  { city: 'Manali',    icon: '🏔️', desc: 'Mountain stays from ₹1,500/night',  gradient: 'from-indigo-100 to-purple-100' },
  { city: 'Kochi',     icon: '⛵', desc: 'Backwater resorts from ₹1,800/night',gradient: 'from-emerald-100 to-green-100' },
]

const today    = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const OFFERS = [
  { tag: 'DEAL',    title: 'Early Bird Offer',    desc: 'Book 30 days early, save 25%',      color: 'from-orange-400 to-red-400',   emoji: '🎯' },
  { tag: 'WEEKEND', title: 'Weekend Getaway',     desc: 'Special weekend packages available', color: 'from-purple-500 to-indigo-500', emoji: '🌴' },
  { tag: 'LUXURY',  title: 'Luxury Escapes',      desc: '5-star stays at 4-star prices',      color: 'from-yellow-400 to-orange-400', emoji: '👑' },
  { tag: 'COUPLE',  title: 'Couple Friendly',     desc: 'Safe & comfortable stays',           color: 'from-pink-400 to-rose-400',    emoji: '💑' },
]

export default function HotelsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Orange hero */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <h1 className="text-white text-2xl font-bold text-center mb-6">Hotels, Homestays &amp; More</h1>
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <HotelSearch />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16 space-y-8">

        {/* Popular Destinations */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Hotel Destinations</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {DESTINATIONS.map(dest => (
              <a key={dest.city}
                href={`/hotels/results?city=${dest.city}&checkIn=${today}&checkOut=${tomorrow}&guests=1&rooms=1`}
                className="group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                <div className={`h-32 bg-gradient-to-br ${dest.gradient} flex items-center justify-center text-6xl group-hover:scale-105 transition-transform`}>
                  {dest.icon}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900">{dest.city}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{dest.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Offers */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Hotel Offers &amp; Deals</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {OFFERS.map(offer => (
              <div key={offer.title}
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
          </div>
        </div>

        {/* Why Goibibo Hotels */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Why Book Hotels on Goibibo?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '🏆', title: 'Top-Rated Hotels', desc: 'Every property is rated by verified guests.' },
              { icon: '🔓', title: 'Free Cancellation', desc: 'Flexible bookings on thousands of properties.' },
              { icon: '🎁', title: 'Exclusive Deals', desc: 'Member-only rates and early bird discounts.' },
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
