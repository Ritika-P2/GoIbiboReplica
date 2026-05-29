import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { holidayService } from '../services/holidayService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'

// Maps city/destination → Unsplash search keywords so gallery shows
// actual tourist photos of that place instead of generic images.
const DESTINATION_KEYWORDS = {
  // Domestic — beaches & coastal
  Goa:          'goa,beach,india',
  Andaman:      'andaman,islands,beach',
  Kochi:        'kerala,backwaters,houseboat',
  Lakshadweep:  'lakshadweep,coral,beach',

  // Domestic — hill stations & mountains
  Manali:       'manali,snow,himachal',
  Shimla:       'shimla,himachal,mountains',
  Darjeeling:   'darjeeling,tea,himalaya',
  Ladakh:       'ladakh,monastery,mountains',
  Nainital:     'nainital,lake,uttarakhand',
  Rishikesh:    'rishikesh,ganges,yoga',
  Mussoorie:    'mussoorie,uttarakhand,hills',
  Ooty:         'ooty,nilgiris,tea',
  Coorg:        'coorg,coffee,karnataka',
  Munnar:       'munnar,kerala,tea',
  Meghalaya:    'meghalaya,cherrapunji,waterfalls',

  // Domestic — heritage & culture
  Rajasthan:    'rajasthan,palace,desert',
  Jaipur:       'jaipur,amber-fort,rajasthan',
  Jodhpur:      'jodhpur,blue-city,rajasthan',
  Udaipur:      'udaipur,lake,palace',
  Jaisalmer:    'jaisalmer,desert,rajasthan',
  Varanasi:     'varanasi,ghats,ganges',
  Agra:         'agra,taj-mahal,india',
  Amritsar:     'amritsar,golden-temple,india',
  Khajuraho:    'khajuraho,temple,india',

  // Domestic — nature & wildlife
  Kerala:       'kerala,backwaters,india',
  'Jim Corbett': 'jim-corbett,tiger,wildlife',
  Ranthambore:  'ranthambore,tiger,safari',
  Kaziranga:    'kaziranga,rhino,assam',

  // Domestic — metro cities
  Mumbai:       'mumbai,gateway,india',
  Delhi:        'delhi,india-gate,monument',
  Bangalore:    'bangalore,garden-city,india',
  Chennai:      'chennai,marina,tamil-nadu',
  Hyderabad:    'hyderabad,charminar,india',
  Kolkata:      'kolkata,howrah-bridge,india',
  Chandigarh:   'chandigarh,punjab,india',
  Mysore:       'mysore,palace,karnataka',
  Pondicherry:  'pondicherry,french,india',

  // International
  Bali:         'bali,temple,indonesia',
  Thailand:     'thailand,bangkok,temple',
  Singapore:    'singapore,marina-bay,skyline',
  Maldives:     'maldives,overwater-bungalow,beach',
  Switzerland:  'switzerland,alps,scenic',
  Dubai:        'dubai,burj-khalifa,skyline',
  Paris:        'paris,eiffel-tower,france',
  London:       'london,big-ben,thames',
  Tokyo:        'tokyo,japan,cherry-blossom',
  'New York':   'new-york,manhattan,skyline',
  Rome:         'rome,colosseum,italy',
  Barcelona:    'barcelona,sagrada-familia,spain',
  Istanbul:     'istanbul,hagia-sophia,turkey',
  Amsterdam:    'amsterdam,canal,netherlands',
  Prague:       'prague,castle,czech',
  Santorini:    'santorini,greece,white-blue',
  'Sri Lanka':  'sri-lanka,temple,ceylon',
  Nepal:        'nepal,everest,himalaya',
  Vietnam:      'vietnam,halong-bay,asia',
  Cambodia:     'cambodia,angkor-wat,temple',
  Malaysia:     'malaysia,kuala-lumpur,tower',
  Australia:    'australia,sydney,opera-house',
  Mauritius:    'mauritius,beach,island',
}

// Derive destination keywords from city name, falling back to a generic travel query
function getDestinationKeywords(city) {
  if (!city) return 'travel,tourism,destination'
  // Try exact match first, then partial match
  if (DESTINATION_KEYWORDS[city]) return DESTINATION_KEYWORDS[city]
  const lower = city.toLowerCase()
  const match = Object.keys(DESTINATION_KEYWORDS).find(k => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower))
  return match ? DESTINATION_KEYWORDS[match] : `${city.toLowerCase().replace(/\s+/g, '-')},travel,tourism`
}

// Unsplash Source: sig param makes each slot consistent across reloads
function galleryUrl(keywords, slot, w = 600, h = 400) {
  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keywords)}&sig=${slot}`
}

const TAG_COLORS = {
  Beach:       'bg-cyan-100 text-cyan-700',
  Honeymoon:   'bg-pink-100 text-pink-700',
  Adventure:   'bg-orange-100 text-orange-700',
  Family:      'bg-green-100 text-green-700',
  Heritage:    'bg-amber-100 text-amber-700',
  Culture:     'bg-purple-100 text-purple-700',
  Nature:      'bg-emerald-100 text-emerald-700',
  Spiritual:   'bg-indigo-100 text-indigo-700',
  Wellness:    'bg-teal-100 text-teal-700',
  Luxury:      'bg-yellow-100 text-yellow-700',
  Hill:        'bg-blue-100 text-blue-700',
  'Hill Station': 'bg-blue-100 text-blue-700',
  International: 'bg-rose-100 text-rose-700',
}

function StarRating({ rating }) {
  const n = Number(rating) || 4.2
  const full = Math.floor(n)
  const half = n - full >= 0.5 ? 1 : 0
  return (
    <span className="text-yellow-400 text-lg tracking-tight">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - half)}
    </span>
  )
}

export default function HolidayDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [pkg, setPkg]       = useState(location.state?.pkg || null)
  const [loading, setLoading] = useState(!location.state?.pkg)
  const [error, setError]   = useState(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (pkg) return
    setLoading(true)
    holidayService.getById(id)
      .then(res => setPkg(res.data?.package || res.package))
      .catch(() => setError('Could not load package details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader text="Loading package…" /></div>
  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">{error || 'Package not found.'}</p>
        <button onClick={() => navigate(ROUTES.HOLIDAYS)} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
          Browse Packages
        </button>
      </div>
    )
  }

  const price         = Number(pkg.price)
  const originalPrice = pkg.originalPrice ? Number(pkg.originalPrice) : null
  const discount      = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0
  const rating        = Number(pkg.rating || 4.2)
  const reviews       = Number(pkg.reviewCount || 1200)
  const heroImg       = (!imgError && (pkg.images?.[0] || `https://picsum.photos/seed/${encodeURIComponent(pkg.title)}/1200/500`))

  const destKeywords = getDestinationKeywords(pkg.city)
  const galleryImages = Array.from({ length: 12 }, (_, i) =>
    galleryUrl(destKeywords, i + 1)
  )

  function handleBook() {
    navigate(ROUTES.HOLIDAY_BOOKING, { state: { pkg } })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="relative h-80 md:h-[420px] overflow-hidden">
        {heroImg ? (
          <img
            src={heroImg}
            alt={pkg.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-300 to-orange-400" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {pkg.tags?.map(tag => (
                <span key={tag} className="text-xs font-semibold bg-white/20 text-white backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
              {pkg.title}
            </h1>
            <p className="text-white/80 mt-2 text-sm md:text-base flex items-center gap-3">
              <span>📍 {pkg.city}</span>
              <span>·</span>
              <span>🗓 {pkg.duration}N / {pkg.duration + 1}D</span>
            </p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-right min-w-[180px]">
            {originalPrice && (
              <p className="text-white/60 text-sm line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
            )}
            <p className="text-3xl font-extrabold text-white">₹{price.toLocaleString('en-IN')}</p>
            <p className="text-white/70 text-xs mb-3">per person</p>
            {discount > 0 && (
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-3">
                {discount}% OFF
              </span>
            )}
            <button
              onClick={handleBook}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              Book This Package
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

        {/* Left: main details */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* About */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About This Package</h2>
            {pkg.description ? (
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">{pkg.description}</p>
            ) : (
              <p className="text-gray-400 italic text-sm">No description available.</p>
            )}
            {pkg.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {pkg.tags.map(tag => (
                  <span key={tag} className={`text-xs font-semibold px-3 py-1 rounded-full ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Highlights */}
          {pkg.highlights?.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Highlights</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 font-bold text-xs">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Destination Gallery */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Destination Gallery
            </h2>
            <p className="text-sm text-gray-500 mb-4">Explore {pkg.city} — images from this destination</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryImages.map((src, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden group bg-gray-100">
                  <img
                    src={src}
                    alt={`${pkg.city} tourist spot ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: sticky booking card */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">{pkg.title}</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>📍 Destination</span>
                <span className="font-semibold text-gray-800">{pkg.city}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>🗓 Duration</span>
                <span className="font-semibold text-gray-800">{pkg.duration}N / {pkg.duration + 1}D</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>⭐ Rating</span>
                <span className="flex items-center gap-1">
                  <StarRating rating={rating} />
                  <span className="text-xs text-gray-400 font-medium">({reviews.toLocaleString('en-IN')})</span>
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              {originalPrice && (
                <p className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')} / person</p>
              )}
              <p className="text-3xl font-extrabold text-orange-500">₹{price.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400 mb-1">per person, all inclusive</p>
              {discount > 0 && (
                <p className="text-xs text-green-600 font-semibold mb-3">
                  You save ₹{(originalPrice - price).toLocaleString('en-IN')} ({discount}% off)
                </p>
              )}
            </div>

            <button
              onClick={handleBook}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Book This Package
            </button>
            <p className="text-xs text-gray-400 text-center">No hidden charges · Instant confirmation</p>

            {pkg.tags?.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Package Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.tags.map(tag => (
                    <span key={tag} className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
