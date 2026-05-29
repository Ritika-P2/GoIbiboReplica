import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import api from '../services/api'

// ─── Static data (same as HolidaysPage) ──────────────────────────────────────

const DESTINATIONS = [
  { name: 'Goa',       emoji: '🏖️', tag: 'Beach' },
  { name: 'Kerala',    emoji: '🌿', tag: 'Nature' },
  { name: 'Manali',    emoji: '🏔️', tag: 'Hill Station' },
  { name: 'Rajasthan', emoji: '🏰', tag: 'Heritage' },
  { name: 'Andaman',   emoji: '🐠', tag: 'Beach' },
  { name: 'Shimla',    emoji: '❄️', tag: 'Hill Station' },
  { name: 'Ooty',      emoji: '🌸', tag: 'Nature' },
  { name: 'Kashmir',   emoji: '⛰️', tag: 'Hill Station' },
  { name: 'Varanasi',  emoji: '🙏', tag: 'Spiritual' },
  { name: 'Coorg',     emoji: '☕', tag: 'Nature' },
  { name: 'Rishikesh', emoji: '🧘', tag: 'Adventure' },
  { name: 'Udaipur',   emoji: '💧', tag: 'Heritage' },
]

const THEMES = [
  { label: 'All',          icon: '🌍' },
  { label: 'Beach',        icon: '🏖️' },
  { label: 'Hill Station', icon: '🏔️' },
  { label: 'Heritage',     icon: '🏛️' },
  { label: 'Adventure',    icon: '🧗' },
  { label: 'Honeymoon',    icon: '💑' },
  { label: 'Wildlife',     icon: '🦁' },
  { label: 'Spiritual',    icon: '🙏' },
  { label: 'Family',       icon: '👨‍👩‍👧‍👦' },
]

const BUDGET_OPTIONS   = ['Any Budget', 'Under ₹10,000', '₹10,000–₹20,000', '₹20,000–₹50,000', '₹50,000+']
const DURATION_OPTIONS = ['Any Duration', '1–3 Nights', '4–6 Nights', '7–10 Nights', '11+ Nights']
const SORT_OPTIONS     = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'duration_asc',label: 'Duration: Shortest' },
  { value: 'discount',    label: 'Best Discount' },
]

const INCLUSIONS_ICONS = { Flight: '✈️', Hotel: '🏨', Transfer: '🚌', Meals: '🍽️', Sightseeing: '🗺️', Guide: '👤' }

const DEST_GRADIENT = {
  'Goa': 'from-amber-300 to-orange-400', 'Kerala': 'from-green-300 to-teal-400',
  'Manali': 'from-blue-300 to-indigo-400', 'Rajasthan': 'from-orange-300 to-red-400',
  'Andaman': 'from-cyan-300 to-blue-400', 'Shimla': 'from-slate-300 to-blue-300',
  'Ooty': 'from-pink-200 to-rose-300', 'Kashmir': 'from-violet-300 to-indigo-400',
  'Varanasi': 'from-yellow-300 to-amber-400', 'Coorg': 'from-green-400 to-emerald-500',
  'Rishikesh': 'from-teal-300 to-cyan-400', 'Udaipur': 'from-blue-200 to-indigo-300',
}

const FALLBACK_PACKAGES = [
  { id: 'f1', title: 'Goa Beach Getaway', city: 'Goa', duration: 4, price: 12999, originalPrice: 18999, images: [], tags: ['Beach', 'Honeymoon'], highlights: ['Stay at 4-star beachside resort', 'North & South Goa sightseeing', 'Ferry ride to Divar Island'], inclusions: ['Hotel', 'Transfer', 'Meals'], rating: 4.5, reviewCount: 2340, badge: 'BEST SELLER' },
  { id: 'f2', title: 'Kerala Backwaters & Ayurveda', city: 'Kerala', duration: 6, price: 22500, originalPrice: 30000, images: [], tags: ['Nature', 'Wellness'], highlights: ['Houseboat stay in Alleppey backwaters', 'Ayurvedic spa & wellness package', 'Munnar tea garden visit'], inclusions: ['Hotel', 'Transfer', 'Meals', 'Sightseeing'], rating: 4.7, reviewCount: 1820, badge: 'TRENDING' },
  { id: 'f3', title: 'Manali Snow Adventure', city: 'Manali', duration: 5, price: 15999, originalPrice: 20000, images: [], tags: ['Adventure', 'Hill Station'], highlights: ['Solang Valley snow activities', 'Rohtang Pass day trip', 'Beas river rafting'], inclusions: ['Hotel', 'Transfer', 'Sightseeing'], rating: 4.4, reviewCount: 3100, badge: 'TRENDING' },
  { id: 'f4', title: 'Royal Rajasthan Heritage Tour', city: 'Rajasthan', duration: 7, price: 28999, originalPrice: 38000, images: [], tags: ['Heritage', 'Culture'], highlights: ['Jaipur–Jodhpur–Udaipur circuit', 'Camel safari in Thar Desert', 'Palace hotel stay experience'], inclusions: ['Hotel', 'Transfer', 'Meals', 'Guide'], rating: 4.6, reviewCount: 980, badge: 'BEST SELLER' },
  { id: 'f5', title: 'Andaman Island Escape', city: 'Andaman', duration: 5, price: 32000, originalPrice: 42000, images: [], tags: ['Beach', 'Adventure'], highlights: ["Radhanagar Beach – Asia's best beach", 'Scuba diving & snorkelling', 'Cellular Jail light & sound show'], inclusions: ['Flight', 'Hotel', 'Transfer', 'Sightseeing'], rating: 4.8, reviewCount: 1540, badge: 'NEW' },
  { id: 'f6', title: 'Shimla–Manali Honeymoon', city: 'Shimla', duration: 6, price: 19999, originalPrice: 26000, images: [], tags: ['Honeymoon', 'Hill Station'], highlights: ['Snow-covered Kufri valley stay', 'Romantic candlelit dinner', 'Mall Road & Jakhu Temple visit'], inclusions: ['Hotel', 'Transfer', 'Meals'], rating: 4.3, reviewCount: 2760, badge: '' },
  { id: 'f7', title: 'Kashmir Great Lakes Trek', city: 'Kashmir', duration: 8, price: 45000, originalPrice: 58000, images: [], tags: ['Adventure', 'Hill Station'], highlights: ['Alpine lakes circuit', 'Camping under stars', 'Expert trekking guide'], inclusions: ['Hotel', 'Transfer', 'Meals', 'Guide'], rating: 4.9, reviewCount: 380, badge: 'FEATURED' },
  { id: 'f8', title: 'Varanasi Spiritual Retreat', city: 'Varanasi', duration: 3, price: 8999, originalPrice: 12000, images: [], tags: ['Spiritual', 'Heritage'], highlights: ['Ganga Aarti evening ceremony', 'Sarnath Buddhist site tour', 'Boat ride at sunrise'], inclusions: ['Hotel', 'Transfer', 'Sightseeing'], rating: 4.6, reviewCount: 1100, badge: '' },
  { id: 'f9', title: 'Coorg Coffee Estate Stay', city: 'Coorg', duration: 4, price: 16500, originalPrice: 22000, images: [], tags: ['Nature', 'Family'], highlights: ['Plantation resort stay', 'Coffee estate guided tour', 'Abbey Falls & Raja\'s Seat'], inclusions: ['Hotel', 'Transfer', 'Meals'], rating: 4.4, reviewCount: 760, badge: '' },
  { id: 'f10', title: 'Rishikesh Yoga & Adventure', city: 'Rishikesh', duration: 5, price: 13999, originalPrice: 18000, images: [], tags: ['Adventure', 'Spiritual'], highlights: ['White water rafting on Ganges', 'Yoga & meditation sessions', 'Bungee jumping & cliff jumping'], inclusions: ['Hotel', 'Transfer', 'Meals'], rating: 4.5, reviewCount: 1450, badge: 'TRENDING' },
  { id: 'f11', title: 'Udaipur Lake Palace Experience', city: 'Udaipur', duration: 4, price: 24999, originalPrice: 32000, images: [], tags: ['Heritage', 'Honeymoon'], highlights: ['Lake Pichola boat ride', 'City Palace guided tour', 'Sajjangarh Monsoon Palace sunset'], inclusions: ['Hotel', 'Transfer', 'Sightseeing'], rating: 4.7, reviewCount: 890, badge: 'BEST SELLER' },
  { id: 'f12', title: 'Andaman Luxury Escape', city: 'Andaman', duration: 6, price: 52000, originalPrice: 68000, images: [], tags: ['Beach', 'Luxury'], highlights: ['5-star resort on Havelock Island', 'Private snorkelling tour', 'Seaplane experience'], inclusions: ['Flight', 'Hotel', 'Transfer', 'Meals', 'Sightseeing'], rating: 4.8, reviewCount: 290, badge: 'FEATURED' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesBudget(price, budget) {
  if (budget === 'Any Budget') return true
  if (budget === 'Under ₹10,000') return price < 10000
  if (budget === '₹10,000–₹20,000') return price >= 10000 && price <= 20000
  if (budget === '₹20,000–₹50,000') return price > 20000 && price <= 50000
  if (budget === '₹50,000+') return price > 50000
  return true
}

function matchesDuration(duration, filter) {
  if (filter === 'Any Duration') return true
  if (filter === '1–3 Nights') return duration <= 3
  if (filter === '4–6 Nights') return duration >= 4 && duration <= 6
  if (filter === '7–10 Nights') return duration >= 7 && duration <= 10
  if (filter === '11+ Nights') return duration >= 11
  return true
}

// ─── PackageCard ──────────────────────────────────────────────────────────────

function PackageCard({ pkg, onBook }) {
  const discount = pkg.originalPrice
    ? Math.round((1 - Number(pkg.price) / Number(pkg.originalPrice)) * 100) : 0
  const img        = pkg.images?.[0] || `https://picsum.photos/seed/${encodeURIComponent(pkg.title)}/800/500`
  const rating     = pkg.rating      || 4.2
  const reviews    = pkg.reviewCount || 1200
  const inclusions = pkg.inclusions  || ['Hotel', 'Transfer']
  const badge      = pkg.badge       || ''
  const dest       = DESTINATIONS.find(d => d.name === pkg.city)

  const BADGE_STYLE = {
    'BEST SELLER': 'bg-orange-500 text-white',
    'TRENDING':    'bg-pink-500 text-white',
    'NEW':         'bg-green-500 text-white',
    'FEATURED':    'bg-blue-600 text-white',
    'SUPER DEAL':  'bg-red-500 text-white',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col lg:flex-row group">
      {/* Image */}
      <div className="relative lg:w-64 lg:shrink-0 h-52 lg:h-auto overflow-hidden">
        {img ? (
          <img src={img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${DEST_GRADIENT[pkg.city] || 'from-pink-200 to-orange-300'} flex items-center justify-center`}>
            <span className="text-6xl opacity-80">{dest?.emoji || '🌴'}</span>
          </div>
        )}
        {badge && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLE[badge] || 'bg-gray-600 text-white'}`}>
            {badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {discount}% OFF
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent h-14 lg:hidden" />
        <span className="absolute bottom-2 left-3 text-white text-xs font-semibold lg:hidden">📍 {pkg.city}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 font-medium">📍 {pkg.city}</span>
              <span className="text-gray-200">|</span>
              <span className="text-xs text-gray-400 font-medium">{pkg.duration}N / {pkg.duration + 1}D</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors mb-3">
              {pkg.title}
            </h3>

            {/* Inclusions */}
            <div className="flex flex-wrap gap-2 mb-3">
              {inclusions.map(inc => (
                <span key={inc} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                  {INCLUSIONS_ICONS[inc] || '✓'} {inc}
                </span>
              ))}
            </div>

            {/* Highlights */}
            {pkg.highlights?.length > 0 && (
              <ul className="space-y-1.5">
                {pkg.highlights.slice(0, 3).map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 shrink-0 font-bold text-xs">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: rating + price + CTAs */}
          <div className="shrink-0 flex flex-col items-end gap-3 min-w-[140px]">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                {Number(rating).toFixed(1)}
              </span>
              <div>
                <p className="text-yellow-400 text-xs leading-none">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{Number(reviews).toLocaleString()} reviews</p>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              {pkg.originalPrice && (
                <p className="text-xs text-gray-400 line-through">₹{Number(pkg.originalPrice).toLocaleString()}</p>
              )}
              <p className="text-2xl font-extrabold text-gray-900 leading-tight">
                ₹{Number(pkg.price).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">per person</p>
              <p className="text-xs text-green-600 font-semibold mt-0.5">
                EMI ₹{Math.round(pkg.price / 12).toLocaleString()}/mo
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 w-full">
              <button onClick={() => onBook(pkg)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-colors whitespace-nowrap">
                Book Now
              </button>
              <button className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 text-sm font-bold py-2 px-5 rounded-xl transition-colors whitespace-nowrap">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HolidayResultsPage() {
  const navigate      = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const cityParam  = searchParams.get('city')  || ''
  const themeParam = searchParams.get('theme') || 'All'
  const fromParam  = searchParams.get('from')  || ''

  const [apiPackages, setApiPackages]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [theme, setTheme]               = useState(themeParam)
  const [budget, setBudget]             = useState('Any Budget')
  const [durationFilter, setDurFilter]  = useState('Any Duration')
  const [sortBy, setSortBy]             = useState('recommended')
  const [showFilters, setShowFilters]   = useState(false)

  useEffect(() => {
    api.get('/holidays')
      .then(res => setApiPackages(res.data?.packages || []))
      .catch(() => setApiPackages([]))
      .finally(() => setLoading(false))
  }, [])

  const rawPackages = apiPackages.length > 0 ? apiPackages : FALLBACK_PACKAGES

  const filtered = useMemo(() => {
    let list = rawPackages.filter(pkg => {
      if (cityParam && !pkg.city?.toLowerCase().includes(cityParam.toLowerCase()) &&
          !pkg.title?.toLowerCase().includes(cityParam.toLowerCase())) return false
      if (theme !== 'All' && !(pkg.tags || []).some(t => t.toLowerCase().includes(theme.toLowerCase()))) return false
      if (!matchesBudget(Number(pkg.price), budget)) return false
      if (!matchesDuration(Number(pkg.duration), durationFilter)) return false
      return true
    })

    if (sortBy === 'price_asc')    list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc')   list = [...list].sort((a, b) => b.price - a.price)
    if (sortBy === 'duration_asc') list = [...list].sort((a, b) => a.duration - b.duration)
    if (sortBy === 'discount') {
      list = [...list].sort((a, b) => {
        const dA = a.originalPrice ? (1 - a.price / a.originalPrice) : 0
        const dB = b.originalPrice ? (1 - b.price / b.originalPrice) : 0
        return dB - dA
      })
    }
    return list
  }, [rawPackages, cityParam, theme, budget, durationFilter, sortBy])

  const destInfo = DESTINATIONS.find(d => d.name?.toLowerCase() === cityParam?.toLowerCase())
  const activeFilterCount = [
    theme !== 'All', budget !== 'Any Budget', durationFilter !== 'Any Duration',
  ].filter(Boolean).length

  function clearFilters() {
    setTheme('All'); setBudget('Any Budget'); setDurFilter('Any Duration')
  }

  function handleDestClick(name) {
    setSearchParams({ city: name, ...(fromParam ? { from: fromParam } : {}) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Destination hero banner ── */}
      <div className={`relative bg-gradient-to-br ${DEST_GRADIENT[cityParam] || 'from-blue-600 to-blue-900'} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-5">
            <Link to={ROUTES.HOLIDAYS} className="hover:text-white transition-colors">Holidays</Link>
            <span>›</span>
            <span className="text-white font-semibold">
              {cityParam ? `Packages in ${cityParam}` : 'All Packages'}
            </span>
          </nav>

          <div className="flex items-center gap-4">
            {destInfo && <span className="text-5xl">{destInfo.emoji}</span>}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {cityParam ? `Holiday Packages in ${cityParam}` : 'All Holiday Packages'}
              </h1>
              {destInfo && (
                <p className="text-white/80 mt-1 text-sm">
                  {destInfo.tag} destination · {filtered.length} packages available
                  {fromParam && ` · Departing from ${fromParam}`}
                </p>
              )}
              {!destInfo && (
                <p className="text-white/80 mt-1 text-sm">{filtered.length} packages available</p>
              )}
            </div>
          </div>

          {/* Quick destination switcher */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mt-6 pb-1">
            {DESTINATIONS.map(dest => (
              <button key={dest.name} onClick={() => handleDestClick(dest.name)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  cityParam === dest.name
                    ? 'bg-white text-gray-900 border-white'
                    : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                }`}>
                {dest.emoji} {dest.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">

          {/* ── Filter sidebar ── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-blue-600 font-semibold hover:underline">
                    Clear ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Budget */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Budget per person</p>
                <div className="space-y-2">
                  {BUDGET_OPTIONS.map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="budget" value={opt} checked={budget === opt}
                        onChange={() => setBudget(opt)} className="accent-blue-600" />
                      <span className={`text-sm ${budget === opt ? 'text-blue-600 font-semibold' : 'text-gray-600'} group-hover:text-blue-600`}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100 mb-5" />

              {/* Duration */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Duration</p>
                <div className="space-y-2">
                  {DURATION_OPTIONS.map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="duration" value={opt} checked={durationFilter === opt}
                        onChange={() => setDurFilter(opt)} className="accent-blue-600" />
                      <span className={`text-sm ${durationFilter === opt ? 'text-blue-600 font-semibold' : 'text-gray-600'} group-hover:text-blue-600`}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100 mb-5" />

              {/* Theme */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Theme</p>
                <div className="space-y-2">
                  {THEMES.map(t => (
                    <label key={t.label} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="theme" value={t.label} checked={theme === t.label}
                        onChange={() => setTheme(t.label)} className="accent-blue-600" />
                      <span className={`text-sm ${theme === t.label ? 'text-blue-600 font-semibold' : 'text-gray-600'} group-hover:text-blue-600`}>
                        {t.icon} {t.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading…' : `Showing ${filtered.length} package${filtered.length !== 1 ? 's' : ''}`}
                {cityParam && !loading && ` in ${cityParam}`}
              </p>
              <div className="flex items-center gap-2">
                {/* Mobile filter */}
                <button onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 border border-gray-200 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600">
                  ⚙️ Filters {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">{activeFilterCount}</span>}
                </button>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Active filter pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {theme !== 'All' && (
                  <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {theme} <button onClick={() => setTheme('All')} className="ml-1">✕</button>
                  </span>
                )}
                {budget !== 'Any Budget' && (
                  <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {budget} <button onClick={() => setBudget('Any Budget')} className="ml-1">✕</button>
                  </span>
                )}
                {durationFilter !== 'Any Duration' && (
                  <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {durationFilter} <button onClick={() => setDurFilter('Any Duration')} className="ml-1">✕</button>
                  </span>
                )}
              </div>
            )}

            {/* Package list */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse flex h-52">
                    <div className="w-64 bg-gray-200 shrink-0" />
                    <div className="flex-1 p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-4">🏖️</div>
                <p className="text-gray-700 text-lg font-semibold">No packages found</p>
                <p className="text-gray-400 text-sm mt-1 mb-5">
                  {cityParam ? `No packages available for ${cityParam} with selected filters.` : 'Try adjusting your filters.'}
                </p>
                <div className="flex gap-3 justify-center">
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700">
                      Clear Filters
                    </button>
                  )}
                  <Link to={ROUTES.HOLIDAYS}
                    className="border-2 border-blue-600 text-blue-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50">
                    All Destinations
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(pkg => (
                  <PackageCard key={pkg.id} pkg={pkg}
                    onBook={p => navigate(ROUTES.HOLIDAY_BOOKING, { state: { pkg: p } })} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Budget</p>
                <div className="space-y-2">
                  {BUDGET_OPTIONS.map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="budget_m" value={opt} checked={budget === opt} onChange={() => setBudget(opt)} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <hr />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Duration</p>
                <div className="space-y-2">
                  {DURATION_OPTIONS.map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="duration_m" value={opt} checked={durationFilter === opt} onChange={() => setDurFilter(opt)} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <hr />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Theme</p>
                <div className="space-y-2">
                  {THEMES.map(t => (
                    <label key={t.label} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="theme_m" value={t.label} checked={theme === t.label} onChange={() => setTheme(t.label)} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{t.icon} {t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 flex gap-3">
              <button onClick={() => { clearFilters(); setShowFilters(false) }}
                className="flex-1 border-2 border-blue-600 text-blue-600 font-bold py-2.5 rounded-xl text-sm">Clear All</button>
              <button onClick={() => setShowFilters(false)}
                className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
