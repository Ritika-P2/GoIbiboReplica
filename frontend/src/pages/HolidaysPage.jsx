import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'

const packages = [
  {
    id: 1, title: 'Goa Beach Escape', duration: '4D/3N', price: '₹12,999', originalPrice: '₹17,999',
    img: '🏖️', tags: ['Flights Included', 'Hotel', 'Transfers'],
    highlights: ['Calangute Beach', 'Old Goa Churches', 'Spice Plantation Tour'],
    city: 'Goa',
  },
  {
    id: 2, title: 'Rajasthan Royal Tour', duration: '7D/6N', price: '₹24,999', originalPrice: '₹34,999',
    img: '🏰', tags: ['Hotel', 'Sightseeing', 'Meals'],
    highlights: ['Jaipur Pink City', 'Udaipur Lake Palace', 'Jodhpur Blue City'],
    city: 'Rajasthan',
  },
  {
    id: 3, title: 'Kerala Backwaters', duration: '5D/4N', price: '₹18,499', originalPrice: '₹25,000',
    img: '🛶', tags: ['Houseboat', 'Hotel', 'Meals'],
    highlights: ['Alleppey Houseboat', 'Munnar Tea Gardens', 'Kovalam Beach'],
    city: 'Kerala',
  },
  {
    id: 4, title: 'Manali Snow Adventure', duration: '6D/5N', price: '₹15,999', originalPrice: '₹22,000',
    img: '🏔️', tags: ['Hotel', 'Transfers', 'Activities'],
    highlights: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple'],
    city: 'Manali',
  },
  {
    id: 5, title: 'Andaman Island Bliss', duration: '5D/4N', price: '₹22,999', originalPrice: '₹30,000',
    img: '🌊', tags: ['Flights Included', 'Hotel', 'Water Sports'],
    highlights: ['Radhanagar Beach', 'Cellular Jail', 'Scuba Diving'],
    city: 'Andaman',
  },
  {
    id: 6, title: 'Darjeeling & Sikkim', duration: '6D/5N', price: '₹19,499', originalPrice: '₹27,000',
    img: '🍵', tags: ['Hotel', 'Sightseeing', 'Transfers'],
    highlights: ['Tiger Hill Sunrise', 'Tea Estate Tour', 'Rumtek Monastery'],
    city: 'Darjeeling',
  },
  {
    id: 7, title: 'Ladakh Bike Expedition', duration: '8D/7N', price: '₹32,999', originalPrice: '₹45,000',
    img: '🏍️', tags: ['Hotel', 'Bike Rental', 'Meals', 'Transfers'],
    highlights: ['Pangong Tso Lake', 'Khardung La Pass', 'Nubra Valley Dunes'],
    city: 'Ladakh',
  },
  {
    id: 8, title: 'Shimla Honeymoon Retreat', duration: '5D/4N', price: '₹14,999', originalPrice: '₹20,000',
    img: '❄️', tags: ['Hotel', 'Transfers', 'Sightseeing'],
    highlights: ['The Ridge & Mall Road', 'Kufri Snow Point', 'Jakhu Temple Trek'],
    city: 'Shimla',
  },
  {
    id: 9, title: 'Coorg Coffee Trails', duration: '4D/3N', price: '₹11,999', originalPrice: '₹16,500',
    img: '☕', tags: ['Resort Stay', 'Meals', 'Plantation Tour'],
    highlights: ['Coffee & Spice Plantation', 'Abbey Falls', 'Namdroling Monastery'],
    city: 'Coorg',
  },
  {
    id: 10, title: 'Varanasi Spiritual Journey', duration: '4D/3N', price: '₹9,999', originalPrice: '₹13,500',
    img: '🪔', tags: ['Hotel', 'Transfers', 'Guided Tour'],
    highlights: ['Ganga Aarti Ceremony', 'Sarnath Buddhist Site', 'Kashi Vishwanath Temple'],
    city: 'Varanasi',
  },
  {
    id: 11, title: 'Rishikesh Yoga & Adventure', duration: '5D/4N', price: '₹13,499', originalPrice: '₹18,000',
    img: '🧘', tags: ['Camp Stay', 'Meals', 'Activities'],
    highlights: ['Ganga White Water Rafting', 'Bungee Jumping', 'Sunrise Yoga Session'],
    city: 'Rishikesh',
  },
  {
    id: 12, title: 'Lakshadweep Island Getaway', duration: '5D/4N', price: '₹29,999', originalPrice: '₹40,000',
    img: '🐠', tags: ['Flights Included', 'Resort', 'Water Sports'],
    highlights: ['Snorkelling in Coral Reefs', 'Glass-bottom Boat Ride', 'Agatti Island Beach'],
    city: 'Lakshadweep',
  },
  {
    id: 13, title: 'Ooty Nilgiri Hills Escape', duration: '4D/3N', price: '₹10,499', originalPrice: '₹14,500',
    img: '🌿', tags: ['Hotel', 'Transfers', 'Sightseeing'],
    highlights: ['Nilgiri Mountain Railway', 'Botanical Gardens', 'Doddabetta Peak'],
    city: 'Ooty',
  },
  {
    id: 14, title: 'Spiti Valley Wilderness', duration: '9D/8N', price: '₹27,999', originalPrice: '₹38,000',
    img: '🌄', tags: ['Homestay', 'Transfers', 'Meals'],
    highlights: ['Key Monastery', 'Chandratal Lake', 'Pin Valley National Park'],
    city: 'Spiti Valley',
  },
]

const themes = [
  { icon: '🏖️', label: 'Beach' },
  { icon: '🏔️', label: 'Adventure' },
  { icon: '🏛️', label: 'Heritage' },
  { icon: '🌿', label: 'Nature' },
  { icon: '🙏', label: 'Spiritual' },
  { icon: '🛶', label: 'Leisure' },
]

export default function HolidaysPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-pink-600 via-rose-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
          <div className="text-center">
            <div className="text-5xl mb-4">🌴</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Holiday Packages</h1>
            <p className="mt-3 text-pink-100 text-lg max-w-2xl mx-auto">
              Handcrafted holiday packages with flights, hotels, sightseeing and more — all in one price.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {themes.map(t => (
                <span key={t.label} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  {t.icon} {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Packages grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Packages</h2>
          <span className="text-sm text-gray-500">{packages.length} packages available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => {
            const discount = Math.round((1 - Number(pkg.price.replace(/[^0-9]/g,'')) / Number(pkg.originalPrice.replace(/[^0-9]/g,''))) * 100)
            return (
              <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center text-7xl relative">
                  {pkg.img}
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-pink-600 transition-colors">{pkg.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{pkg.duration}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs text-gray-400 line-through">{pkg.originalPrice}</p>
                      <p className="text-xl font-bold text-pink-600">{pkg.price}</p>
                      <p className="text-xs text-gray-400">per person</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {pkg.tags.map(tag => (
                      <span key={tag} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-1 mb-4">
                    {pkg.highlights.map(h => (
                      <li key={h} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-green-500 shrink-0">✓</span> {h}
                      </li>
                    ))}
                  </ul>

                  <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700"
                    onClick={() => navigate(ROUTES.HOLIDAY_BOOKING, { state: { pkg } })}>
                    Book Now
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-pink-600 to-orange-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Need a Custom Package?</h2>
          <p className="text-pink-100 mb-6">Tell us your dream destination and we will plan the perfect trip for you.</p>
          <Button variant="secondary" size="lg" className="bg-white text-pink-600 hover:bg-pink-50 border-0">
            Talk to a Travel Expert
          </Button>
        </div>
      </div>
    </div>
  )
}