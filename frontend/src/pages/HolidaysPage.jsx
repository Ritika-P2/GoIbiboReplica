import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import api from '../services/api'

// ─── Static data ──────────────────────────────────────────────────────────────

const INDIAN_CITIES = [
  'New Delhi','Mumbai','Bengaluru','Chennai','Kolkata','Hyderabad',
  'Pune','Ahmedabad','Jaipur','Surat','Lucknow','Kanpur','Nagpur',
  'Indore','Thane','Bhopal','Visakhapatnam','Patna','Vadodara','Ghaziabad',
]

const DESTINATIONS = [
  { name: 'Goa',        emoji: '🏖️', tag: 'Beach',        desc: 'Sun, sand & sea' },
  { name: 'Kerala',     emoji: '🌿', tag: 'Nature',        desc: 'God\'s own country' },
  { name: 'Manali',     emoji: '🏔️', tag: 'Hill Station',  desc: 'Snow & adventure' },
  { name: 'Rajasthan',  emoji: '🏰', tag: 'Heritage',      desc: 'Royal forts & palaces' },
  { name: 'Andaman',    emoji: '🐠', tag: 'Beach',         desc: 'Pristine island beaches' },
  { name: 'Shimla',     emoji: '❄️', tag: 'Hill Station',  desc: 'Queen of hills' },
  { name: 'Ooty',       emoji: '🌸', tag: 'Nature',        desc: 'Nilgiri mountains' },
  { name: 'Kashmir',    emoji: '⛰️', tag: 'Hill Station',  desc: 'Paradise on earth' },
  { name: 'Varanasi',   emoji: '🙏', tag: 'Spiritual',     desc: 'City of temples' },
  { name: 'Coorg',      emoji: '☕', tag: 'Nature',        desc: 'Coffee & waterfalls' },
  { name: 'Rishikesh',  emoji: '🧘', tag: 'Adventure',     desc: 'Yoga & rafting' },
  { name: 'Udaipur',    emoji: '💧', tag: 'Heritage',      desc: 'City of lakes' },
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

const DURATIONS_FILTER = ['Any Duration','1–3 Nights','4–6 Nights','7–10 Nights','11+ Nights']
const BUDGET_OPTIONS   = ['Any Budget','Under ₹10,000','₹10,000–₹20,000','₹20,000–₹50,000','₹50,000+']
const SORT_OPTIONS     = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'duration_asc',label: 'Duration: Shortest' },
  { value: 'discount',    label: 'Best Discount' },
]

const INCLUSIONS_ICONS = { Flight:'✈️', Hotel:'🏨', Transfer:'🚌', Meals:'🍽️', Sightseeing:'🗺️', Guide:'👤' }

const DEST_GRADIENT = {
  'Goa':'from-amber-300 to-orange-400','Kerala':'from-green-300 to-teal-400',
  'Manali':'from-blue-300 to-indigo-400','Rajasthan':'from-orange-300 to-red-400',
  'Andaman':'from-cyan-300 to-blue-400','Shimla':'from-slate-300 to-blue-300',
  'Ooty':'from-pink-200 to-rose-300','Kashmir':'from-violet-300 to-indigo-400',
  'Varanasi':'from-yellow-300 to-amber-400','Coorg':'from-green-400 to-emerald-500',
  'Rishikesh':'from-teal-300 to-cyan-400','Udaipur':'from-blue-200 to-indigo-300',
}

const FALLBACK_PACKAGES = [
  { id:'f1', title:'Goa Beach Getaway', city:'Goa', duration:4, price:12999, originalPrice:18999, images:[], tags:['Beach','Honeymoon'], highlights:['Stay at 4-star beachside resort','North & South Goa sightseeing','Ferry ride to Divar Island'], inclusions:['Hotel','Transfer','Meals'], rating:4.5, reviewCount:2340, badge:'BEST SELLER' },
  { id:'f2', title:'Kerala Backwaters & Ayurveda', city:'Kerala', duration:6, price:22500, originalPrice:30000, images:[], tags:['Nature','Wellness'], highlights:['Houseboat stay in Alleppey backwaters','Ayurvedic spa & wellness package','Munnar tea garden visit'], inclusions:['Hotel','Transfer','Meals','Sightseeing'], rating:4.7, reviewCount:1820, badge:'TRENDING' },
  { id:'f3', title:'Manali Snow Adventure', city:'Manali', duration:5, price:15999, originalPrice:20000, images:[], tags:['Adventure','Hill Station'], highlights:['Solang Valley snow activities','Rohtang Pass day trip','Beas river rafting'], inclusions:['Hotel','Transfer','Sightseeing'], rating:4.4, reviewCount:3100, badge:'TRENDING' },
  { id:'f4', title:'Royal Rajasthan Heritage Tour', city:'Rajasthan', duration:7, price:28999, originalPrice:38000, images:[], tags:['Heritage','Culture'], highlights:['Jaipur–Jodhpur–Udaipur circuit','Camel safari in Thar Desert','Palace hotel stay experience'], inclusions:['Hotel','Transfer','Meals','Guide'], rating:4.6, reviewCount:980, badge:'BEST SELLER' },
  { id:'f5', title:'Andaman Island Escape', city:'Andaman', duration:5, price:32000, originalPrice:42000, images:[], tags:['Beach','Adventure'], highlights:["Radhanagar Beach – Asia's best beach",'Scuba diving & snorkelling','Cellular Jail light & sound show'], inclusions:['Flight','Hotel','Transfer','Sightseeing'], rating:4.8, reviewCount:1540, badge:'NEW' },
  { id:'f6', title:'Shimla–Manali Honeymoon', city:'Shimla', duration:6, price:19999, originalPrice:26000, images:[], tags:['Honeymoon','Hill Station'], highlights:['Snow-covered Kufri valley stay','Romantic candlelit dinner','Mall Road & Jakhu Temple visit'], inclusions:['Hotel','Transfer','Meals'], rating:4.3, reviewCount:2760, badge:'' },
]

const SUPER_DEALS = [
  { id:'sd1', title:'Last Minute Goa Deal', city:'Goa', duration:3, price:8999, originalPrice:14999, images:[], tags:['Beach'], highlights:['Hotel with pool','Airport transfers','Welcome drink'], inclusions:['Hotel','Transfer'], rating:4.2, reviewCount:890, badge:'SUPER DEAL' },
  { id:'sd2', title:'Kerala Monsoon Special', city:'Kerala', duration:4, price:11499, originalPrice:18000, images:[], tags:['Nature'], highlights:['Backwater houseboat 1 night','Kovalam beach resort','Ayurveda session'], inclusions:['Hotel','Transfer','Meals'], rating:4.5, reviewCount:560, badge:'SUPER DEAL' },
  { id:'sd3', title:'Rajasthan Flash Sale', city:'Rajasthan', duration:5, price:14999, originalPrice:24000, images:[], tags:['Heritage'], highlights:['Jaipur & Jodhpur','Desert camp night stay','All transfers included'], inclusions:['Hotel','Transfer','Sightseeing'], rating:4.4, reviewCount:430, badge:'SUPER DEAL' },
  { id:'sd4', title:'Manali Budget Getaway', city:'Manali', duration:4, price:9999, originalPrice:16000, images:[], tags:['Adventure'], highlights:['Snow activities at Solang','Hotel & breakfast','Hadimba temple visit'], inclusions:['Hotel','Transfer'], rating:4.1, reviewCount:1200, badge:'SUPER DEAL' },
]

const FEATURED_PACKAGES = [
  { id:'ft1', title:'Kashmir Great Lakes Trek', city:'Kashmir', duration:8, price:45000, originalPrice:58000, images:[], tags:['Adventure','Hill Station'], highlights:['Alpine lakes circuit','Camping under stars','Expert trekking guide'], inclusions:['Hotel','Transfer','Meals','Guide','Sightseeing'], rating:4.9, reviewCount:380, badge:'FEATURED' },
  { id:'ft2', title:'Andaman Luxury Escape', city:'Andaman', duration:6, price:52000, originalPrice:68000, images:[], tags:['Beach','Luxury'], highlights:['5-star resort on Havelock Island','Private snorkelling tour','Seaplane experience'], inclusions:['Flight','Hotel','Transfer','Meals','Sightseeing'], rating:4.8, reviewCount:290, badge:'FEATURED' },
  { id:'ft3', title:'Rajasthan Palace Tour', city:'Rajasthan', duration:9, price:65000, originalPrice:85000, images:[], tags:['Heritage','Luxury'], highlights:['Palace hotel stays throughout','Private guided heritage walks','Elephant safari in Amer Fort'], inclusions:['Flight','Hotel','Transfer','Meals','Guide'], rating:4.7, reviewCount:210, badge:'FEATURED' },
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

// ─── CityDropdown ─────────────────────────────────────────────────────────────

function CityDropdown({ label, sublabel, value, onChange, placeholder, options }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(c => c.toLowerCase().includes(input.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <p className="text-xs text-blue-500 font-semibold mb-0.5">{label}</p>
      <button type="button" onClick={() => setOpen(o => !o)} className="text-left w-full">
        <p className="text-2xl font-bold text-gray-900 leading-tight truncate">
          {value || <span className="text-gray-400 text-xl">{placeholder}</span>}
        </p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus value={input} onChange={e => setInput(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400" />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(city => (
              <button key={city} type="button"
                onClick={() => { onChange(city); setOpen(false); setInput('') }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors ${value === city ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'}`}>
                📍 {city}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No cities found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── GuestDropdown ────────────────────────────────────────────────────────────

function GuestDropdown({ rooms, setRooms, adults, setAdults, children, setChildren }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const label = `${rooms} Room${rooms > 1 ? 's' : ''}, ${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}`
  return (
    <div ref={ref} className="relative">
      <p className="text-xs text-blue-500 font-semibold mb-0.5">Rooms & Guests</p>
      <button type="button" onClick={() => setOpen(o => !o)} className="text-left w-full">
        <p className="text-2xl font-bold text-gray-900 leading-tight">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 invisible">x</p>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4">
          {[
            { label:'Rooms', val:rooms, set:setRooms, min:1, max:8 },
            { label:'Adults', val:adults, set:setAdults, min:1, max:12 },
            { label:'Children (0–12 yrs)', val:children, set:setChildren, min:0, max:6 },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between mb-4 last:mb-2">
              <span className="text-sm font-semibold text-gray-700">{row.label}</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => row.set(v => Math.max(row.min, v - 1))}
                  className="w-8 h-8 rounded-full border-2 border-blue-500 text-blue-500 font-bold text-lg leading-none flex items-center justify-center hover:bg-blue-50 disabled:opacity-30"
                  disabled={row.val <= row.min}>−</button>
                <span className="w-6 text-center font-bold text-gray-900">{row.val}</span>
                <button type="button" onClick={() => row.set(v => Math.min(row.max, v + 1))}
                  className="w-8 h-8 rounded-full border-2 border-blue-500 text-blue-500 font-bold text-lg leading-none flex items-center justify-center hover:bg-blue-50 disabled:opacity-30"
                  disabled={row.val >= row.max}>+</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setOpen(false)}
            className="w-full mt-2 bg-blue-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-blue-700">
            Done
          </button>
        </div>
      )}
    </div>
  )
}

// ─── FiltersDropdown ──────────────────────────────────────────────────────────

function FiltersDropdown({ budget, setBudget, durationFilter, setDurFilter, theme, setTheme }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const count = [budget !== 'Any Budget', durationFilter !== 'Any Duration', theme !== 'All'].filter(Boolean).length
  return (
    <div ref={ref} className="relative">
      <p className="text-xs text-blue-500 font-semibold mb-0.5">Filters</p>
      <button type="button" onClick={() => setOpen(o => !o)} className="text-left w-full">
        <p className="text-2xl font-bold text-gray-900 leading-tight flex items-center gap-2">
          {count > 0 ? `${count} Filter${count > 1 ? 's' : ''}` : 'Select Filters'}
          <span className="text-sm font-normal text-gray-400">(Optional)</span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5 invisible">x</p>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4">
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Budget per person</p>
            <div className="flex flex-wrap gap-1.5">
              {BUDGET_OPTIONS.map(opt => (
                <button key={opt} type="button" onClick={() => setBudget(budget === opt ? 'Any Budget' : opt)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${budget === opt ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</p>
            <div className="flex flex-wrap gap-1.5">
              {DURATIONS_FILTER.map(opt => (
                <button key={opt} type="button" onClick={() => setDurFilter(durationFilter === opt ? 'Any Duration' : opt)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${durationFilter === opt ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Theme</p>
            <div className="flex flex-wrap gap-1.5">
              {THEMES.map(t => (
                <button key={t.label} type="button" onClick={() => setTheme(theme === t.label ? 'All' : t.label)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${theme === t.label ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)}
            className="w-full mt-4 bg-blue-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-blue-700">
            Apply Filters
          </button>
        </div>
      )}
    </div>
  )
}

// ─── PackageCard ──────────────────────────────────────────────────────────────

function PackageCard({ pkg, onBook }) {
  const discount = pkg.originalPrice
    ? Math.round((1 - Number(pkg.price) / Number(pkg.originalPrice)) * 100) : 0
  const img = pkg.images?.[0] || null
  const rating  = pkg.rating      || 4.2
  const reviews = pkg.reviewCount || 1200
  const inclusions = pkg.inclusions || ['Hotel', 'Transfer']
  const badge = pkg.badge || ''
  const BADGE_STYLE = { 'BEST SELLER':'bg-orange-500 text-white', 'TRENDING':'bg-pink-500 text-white', 'NEW':'bg-green-500 text-white', 'FEATURED':'bg-blue-600 text-white', 'SUPER DEAL':'bg-red-500 text-white' }
  const dest = DESTINATIONS.find(d => d.name === pkg.city)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      <div className="relative h-48 overflow-hidden shrink-0">
        {img ? (
          <img src={img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${DEST_GRADIENT[pkg.city] || 'from-pink-200 to-orange-300'} flex items-center justify-center`}>
            <span className="text-6xl opacity-80">{dest?.emoji || '🌴'}</span>
          </div>
        )}
        {badge && <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLE[badge] || 'bg-gray-600 text-white'}`}>{badge}</span>}
        {discount > 0 && <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{discount}% OFF</span>}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent h-16" />
        <span className="absolute bottom-2 left-3 text-white text-xs font-semibold">📍 {pkg.city}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">{pkg.title}</h3>
        <p className="text-xs text-gray-500 font-medium mb-3">{pkg.duration}N / {pkg.duration + 1}D</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {inclusions.map(inc => (
            <span key={inc} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
              {INCLUSIONS_ICONS[inc] || '✓'} {inc}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">{Number(rating).toFixed(1)}</span>
          <span className="text-yellow-400 text-xs">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>
          <span className="text-xs text-gray-400">({Number(reviews).toLocaleString()})</span>
        </div>
        {pkg.highlights?.length > 0 && (
          <ul className="space-y-1 mb-3 flex-1">
            {pkg.highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                <span className="text-green-500 mt-0.5 shrink-0 font-bold">✓</span>
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-gray-100 pt-3 mt-auto">
          <div className="flex items-end justify-between mb-3">
            <div>
              {pkg.originalPrice && <p className="text-xs text-gray-400 line-through">₹{Number(pkg.originalPrice).toLocaleString()}</p>}
              <p className="text-xl font-extrabold text-gray-900">₹{Number(pkg.price).toLocaleString()}</p>
              <p className="text-xs text-gray-400">per person</p>
            </div>
            <p className="text-xs text-green-600 font-semibold">EMI ₹{Math.round(pkg.price / 12).toLocaleString()}/mo</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onBook(pkg)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2 rounded-xl transition-colors">Book Now</button>
            <button className="flex-1 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 text-sm font-bold py-2 rounded-xl transition-colors">View Details</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HolidaysPage() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab]       = useState('search')
  const [apiPackages, setApiPackages]   = useState([])
  const [loading, setLoading]           = useState(true)

  // Search form state
  const [fromCity, setFromCity]         = useState('New Delhi')
  const [toCity, setToCity]             = useState('')
  const [depDate, setDepDate]           = useState('')
  const [rooms, setRooms]               = useState(1)
  const [adults, setAdults]             = useState(2)
  const [children, setChildren]         = useState(0)

  // Filter state
  const [budget, setBudget]             = useState('Any Budget')
  const [durationFilter, setDurFilter]  = useState('Any Duration')
  const [theme, setTheme]               = useState('All')
  const [sortBy, setSortBy]             = useState('recommended')
  const [destFilter, setDestFilter]     = useState('')
  const [hasSearched, setHasSearched]   = useState(false)

  useEffect(() => {
    api.get('/holidays')
      .then(res => setApiPackages(res.data?.data?.packages || []))
      .catch(() => setApiPackages([]))
      .finally(() => setLoading(false))
  }, [])

  const rawPackages = apiPackages.length > 0 ? apiPackages : FALLBACK_PACKAGES

  const displayPackages = useMemo(() => {
    let source = rawPackages
    if (activeTab === 'superdeals') source = SUPER_DEALS
    if (activeTab === 'featured')   source = FEATURED_PACKAGES

    let list = source.filter(pkg => {
      const dest = destFilter || toCity
      if (dest && !pkg.city?.toLowerCase().includes(dest.toLowerCase()) &&
          !pkg.title?.toLowerCase().includes(dest.toLowerCase())) return false
      if (theme !== 'All' && !(pkg.tags || []).some(t => t.toLowerCase().includes(theme.toLowerCase()))) return false
      if (!matchesBudget(Number(pkg.price), budget)) return false
      if (!matchesDuration(Number(pkg.duration), durationFilter)) return false
      return true
    })

    if (sortBy === 'price_asc')    list = [...list].sort((a,b) => a.price - b.price)
    if (sortBy === 'price_desc')   list = [...list].sort((a,b) => b.price - a.price)
    if (sortBy === 'duration_asc') list = [...list].sort((a,b) => a.duration - b.duration)
    if (sortBy === 'discount') {
      list = [...list].sort((a,b) => {
        const dA = a.originalPrice ? (1 - a.price/a.originalPrice) : 0
        const dB = b.originalPrice ? (1 - b.price/b.originalPrice) : 0
        return dB - dA
      })
    }
    return list
  }, [rawPackages, activeTab, toCity, destFilter, theme, budget, durationFilter, sortBy])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (toCity) params.set('city', toCity)
    if (fromCity) params.set('from', fromCity)
    if (depDate) params.set('date', depDate)
    if (theme !== 'All') params.set('theme', theme)
    if (budget !== 'Any Budget') params.set('budget', budget)
    if (durationFilter !== 'Any Duration') params.set('duration', durationFilter)
    navigate(`${ROUTES.HOLIDAY_RESULTS}?${params.toString()}`)
  }

  function handleDestClick(destName) {
    const params = new URLSearchParams()
    params.set('city', destName)
    if (fromCity) params.set('from', fromCity)
    navigate(`${ROUTES.HOLIDAY_RESULTS}?${params.toString()}`)
  }

  const TABS = [
    { id:'search',     label:'Search',     icon:'🔍' },
    { id:'destinations',label:'Destinations',icon:'🗺️' },
    { id:'superdeals', label:'Super Deals', icon:'🏷️' },
    { id:'featured',   label:'Featured',   icon:'⭐' },
  ]

  const activeFilterCount = [budget !== 'Any Budget', durationFilter !== 'Any Duration', theme !== 'All'].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header branding ── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <span className="text-2xl font-extrabold">
            <span className="text-blue-600">goibibo</span>
            <span className="text-gray-800 font-bold"> Holidays</span>
          </span>
        </div>
      </div>

      {/* ── Hero with search card ── */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-blue-400/30 rounded-full" />
          <div className="absolute top-0 left-0 w-72 h-60 bg-blue-500/20 rounded-br-[80px]" />
          <div className="absolute top-8 right-0 w-48 h-48 bg-blue-300/20 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Search card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search tab */}
            {activeTab === 'search' && (
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                  {/* From City */}
                  <div className="px-5 py-5">
                    <CityDropdown label="From City" sublabel="India"
                      value={fromCity} onChange={setFromCity}
                      placeholder="Select city" options={INDIAN_CITIES} />
                  </div>

                  {/* To City */}
                  <div className="px-5 py-5">
                    <CityDropdown label="To City/Country/Category"
                      sublabel={toCity ? 'India' : ''}
                      value={toCity} onChange={setToCity}
                      placeholder="Goa, Kerala, Manali…"
                      options={DESTINATIONS.map(d => d.name)} />
                  </div>

                  {/* Departure Date */}
                  <div className="px-5 py-5">
                    <p className="text-xs text-blue-500 font-semibold mb-0.5">Departure Date</p>
                    <input type="date" value={depDate} onChange={e => setDepDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-transparent text-2xl font-bold text-gray-900 focus:outline-none cursor-pointer" />
                    {!depDate && <p className="text-xs text-gray-400 mt-0.5">Select Date</p>}
                  </div>

                  {/* Rooms & Guests */}
                  <div className="px-5 py-5">
                    <GuestDropdown rooms={rooms} setRooms={setRooms} adults={adults} setAdults={setAdults} children={children} setChildren={setChildren} />
                  </div>

                  {/* Filters + label */}
                  <div className="px-5 py-5 flex flex-col justify-between">
                    <FiltersDropdown budget={budget} setBudget={setBudget} durationFilter={durationFilter} setDurFilter={setDurFilter} theme={theme} setTheme={setTheme} />
                    <p className="text-xs text-gray-400 text-right mt-1 font-medium">Holiday Packages</p>
                  </div>
                </div>

                {/* Search button */}
                <div className="px-6 pb-6 pt-2 flex justify-center">
                  <button type="submit"
                    className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-lg px-20 py-3.5 rounded-full shadow-lg transition-all tracking-widest uppercase">
                    Search
                  </button>
                </div>
              </form>
            )}

            {/* Destinations tab */}
            {activeTab === 'destinations' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Popular Destinations in India</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {DESTINATIONS.map(dest => (
                    <button key={dest.name} onClick={() => handleDestClick(dest.name)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                        destFilter === dest.name ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200 bg-white'
                      }`}>
                      <span className="text-3xl">{dest.emoji}</span>
                      <span className={`text-xs font-bold ${destFilter === dest.name ? 'text-blue-600' : 'text-gray-700'}`}>{dest.name}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">{dest.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Super Deals tab */}
            {activeTab === 'superdeals' && (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Super Deals</h2>
                    <p className="text-xs text-gray-500">Limited time offers — book before they expire!</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {SUPER_DEALS.map(deal => {
                    const disc = Math.round((1 - deal.price / deal.originalPrice) * 100)
                    const dest = DESTINATIONS.find(d => d.name === deal.city)
                    return (
                      <div key={deal.id} className="relative bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(ROUTES.HOLIDAY_BOOKING, { state: { pkg: deal } })}>
                        <div className="text-3xl mb-2">{dest?.emoji || '🌴'}</div>
                        <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">{deal.title}</p>
                        <p className="text-xs text-gray-500 mb-2">{deal.duration}N/{deal.duration+1}D · {deal.city}</p>
                        <p className="text-xs text-gray-400 line-through">₹{deal.originalPrice.toLocaleString()}</p>
                        <p className="text-lg font-extrabold text-gray-900">₹{deal.price.toLocaleString()}</p>
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{disc}% OFF</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Featured tab */}
            {activeTab === 'featured' && (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Featured Packages</h2>
                    <p className="text-xs text-gray-500">Handpicked premium holiday experiences</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {FEATURED_PACKAGES.map(pkg => {
                    const disc = Math.round((1 - pkg.price / pkg.originalPrice) * 100)
                    const dest = DESTINATIONS.find(d => d.name === pkg.city)
                    return (
                      <div key={pkg.id} className={`rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group`} onClick={() => navigate(ROUTES.HOLIDAY_BOOKING, { state: { pkg } })}>
                        <div className={`h-32 bg-gradient-to-br ${DEST_GRADIENT[pkg.city] || 'from-blue-200 to-indigo-300'} flex items-center justify-center relative`}>
                          <span className="text-5xl">{dest?.emoji || '🌟'}</span>
                          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">FEATURED</span>
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{disc}% OFF</span>
                        </div>
                        <div className="p-3">
                          <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 line-clamp-1">{pkg.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{pkg.duration}N/{pkg.duration+1}D · {pkg.city}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <p className="text-xs text-gray-400 line-through">₹{pkg.originalPrice.toLocaleString()}</p>
                              <p className="font-extrabold text-gray-900">₹{pkg.price.toLocaleString()}</p>
                            </div>
                            <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">{pkg.rating}⭐</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Results section ── */}
      {(activeTab === 'search' || hasSearched) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Theme chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
            {THEMES.map(t => (
              <button key={t.label} onClick={() => setTheme(t.label)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  theme === t.label ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {toCity || destFilter ? `Holiday Packages in ${toCity || destFilter}` : 'All Holiday Packages'}
              </h2>
              {!loading && <p className="text-sm text-gray-500 mt-0.5">{displayPackages.length} packages found</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {(activeFilterCount > 0 || toCity || destFilter) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {(toCity || destFilter) && (
                <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  📍 {toCity || destFilter}
                  <button onClick={() => { setToCity(''); setDestFilter('') }} className="ml-1 hover:text-blue-900">✕</button>
                </span>
              )}
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

          {/* Package grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayPackages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-6xl mb-4">🏖️</div>
              <p className="text-gray-700 text-lg font-semibold">No packages match your filters</p>
              <p className="text-gray-400 text-sm mt-1 mb-5">Try adjusting your search or filters</p>
              <button onClick={() => { setTheme('All'); setBudget('Any Budget'); setDurFilter('Any Duration'); setToCity(''); setDestFilter('') }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayPackages.map(pkg => (
                <PackageCard key={pkg.id} pkg={pkg}
                  onBook={p => navigate(ROUTES.HOLIDAY_BOOKING, { state: { pkg: p } })} />
              ))}
            </div>
          )}

          {/* Why book section */}
          {!loading && displayPackages.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-8 text-white">
              <h2 className="text-xl font-bold text-center mb-8">Why Book Holiday Packages with Goibibo?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                {[
                  { icon:'💰', title:'Best Price Guarantee', desc:'Lowest prices + exclusive deals' },
                  { icon:'🏨', title:'Handpicked Hotels',    desc:'Verified & rated accommodations' },
                  { icon:'📞', title:'24/7 Support',         desc:'Dedicated holiday experts' },
                  { icon:'🔒', title:'Safe Payments',        desc:'100% secure transactions' },
                ].map(item => (
                  <div key={item.title} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">{item.icon}</div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-blue-200">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
