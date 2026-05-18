import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'

const pressReleases = [
  {
    date: 'May 12, 2026',
    title: 'Goibibo Crosses 50 Million Traveller Milestone',
    excerpt: 'Goibibo today announced it has surpassed 50 million unique travellers on its platform, marking a decade of democratising travel for Indians.',
    tag: 'Milestone',
  },
  {
    date: 'March 28, 2026',
    title: 'Goibibo Launches AI-Powered Price Prediction for Flights',
    excerpt: 'The new feature uses machine learning models trained on 3 years of fare data to recommend the best time to book domestic flights.',
    tag: 'Product',
  },
  {
    date: 'February 10, 2026',
    title: 'Goibibo Partners with 50 New Budget Hotel Chains Across Tier-2 Cities',
    excerpt: 'The partnership expands Goibibo\'s hotel inventory to over 25,000 properties, with a focus on making quality stays accessible in smaller Indian cities.',
    tag: 'Partnership',
  },
  {
    date: 'January 5, 2026',
    title: 'Goibibo Named "Most Trusted Travel App 2025" by Consumer Voice India',
    excerpt: 'The annual Consumer Voice India survey ranked Goibibo first in traveller satisfaction across booking speed, pricing transparency, and customer support.',
    tag: 'Award',
  },
  {
    date: 'November 18, 2025',
    title: 'Goibibo Raises ₹800 Crore Series E to Accelerate International Expansion',
    excerpt: 'The funding round was led by Tiger Global and existing investors, valuing Goibibo at approximately ₹12,000 crore.',
    tag: 'Funding',
  },
  {
    date: 'September 3, 2025',
    title: 'Goibibo Introduces Carbon Offset Programme for Flight Bookings',
    excerpt: 'Travellers can now opt-in to offset the carbon footprint of their flights directly at checkout, partnering with verified reforestation projects across India.',
    tag: 'Sustainability',
  },
]

const coverage = [
  { outlet: 'Economic Times', headline: "“Goibibo’s AI fare predictor sets a new benchmark for Indian OTAs”", date: 'April 2026' },
  { outlet: 'TechCrunch India', headline: "“How Goibibo is winning the travel wars in India”", date: 'March 2026' },
  { outlet: 'Business Standard', headline: "“Goibibo crosses ₹5,000 crore in annual GMV”", date: 'February 2026' },
  { outlet: 'YourStory',        headline: "“The Goibibo story: From startup to 50M users”", date: 'January 2026' },
  { outlet: 'Mint',             headline: "“Series E puts Goibibo in elite club of Indian travel unicorns”", date: 'November 2025' },
]

const TAG_COLORS = {
  Milestone:     'bg-blue-100 text-blue-700',
  Product:       'bg-purple-100 text-purple-700',
  Partnership:   'bg-green-100 text-green-700',
  Award:         'bg-yellow-100 text-yellow-700',
  Funding:       'bg-orange-100 text-orange-700',
  Sustainability:'bg-teal-100 text-teal-700',
}

export default function PressPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-3">Newsroom</p>
          <h1 className="text-5xl font-bold mb-4">Goibibo <span className="text-orange-400">Press</span></h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Latest news, press releases, and media resources from India's favourite travel platform.
          </p>
          <p className="mt-6 text-gray-400 text-sm">
            Media enquiries: <a href="mailto:press@goibibo.com" className="text-orange-400 hover:underline">press@goibibo.com</a>
          </p>
        </div>
      </div>

      {/* Press releases */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Press Releases</h2>
        <div className="space-y-5">
          {pressReleases.map((pr, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[pr.tag] || 'bg-gray-100 text-gray-600'}`}>{pr.tag}</span>
                    <span className="text-xs text-gray-400">{pr.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors mb-2">{pr.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{pr.excerpt}</p>
                </div>
                <span className="text-gray-300 group-hover:text-blue-400 transition-colors text-xl shrink-0">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media coverage */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">In the News</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coverage.map((c, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{c.outlet} · {c.date}</p>
                <p className="text-gray-800 font-medium text-sm leading-snug italic">"{c.headline}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media kit */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Media Kit & Brand Assets</h2>
            <p className="text-blue-100 text-sm">Download our logo, brand guidelines, executive headshots, and fact sheet.</p>
          </div>
          <Button onClick={() => navigate(ROUTES.CONTACT)}
            className="bg-white text-blue-700 hover:bg-blue-50 border-0 shrink-0">
            Request Media Kit
          </Button>
        </div>
      </div>
    </div>
  )
}
