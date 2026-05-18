import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const categories = [
  { icon: '✈️', title: 'Flights',          count: 18 },
  { icon: '🏨', title: 'Hotels',           count: 14 },
  { icon: '🚂', title: 'Trains',           count: 11 },
  { icon: '🚌', title: 'Buses',            count: 9  },
  { icon: '🌴', title: 'Holiday Packages', count: 12 },
  { icon: '💳', title: 'Payments',         count: 16 },
  { icon: '🔄', title: 'Cancellations',    count: 13 },
  { icon: '👤', title: 'My Account',       count: 8  },
]

const faqs = [
  {
    category: 'Flights',
    q: 'How do I cancel or modify my flight booking?',
    a: 'Go to My Bookings → select the booking → click "Cancel Booking". For modifications, cancel and rebook. Refunds are processed within 5–7 business days depending on the airline\'s policy.',
  },
  {
    category: 'Flights',
    q: 'Why is my fare different from what I saw earlier?',
    a: 'Flight prices are dynamic and change in real-time based on demand and seat availability. The price is only locked in once you complete payment. We recommend booking as soon as you find a fare you\'re happy with.',
  },
  {
    category: 'Hotels',
    q: 'Can I check in early or check out late?',
    a: 'Early check-in and late check-out are subject to hotel availability and may involve an additional charge. We recommend contacting the hotel directly at least 24 hours before arrival.',
  },
  {
    category: 'Hotels',
    q: 'What is the cancellation policy for hotel bookings?',
    a: 'Cancellation policies vary by hotel and rate type. Flexible rates typically allow free cancellation up to 24–48 hours before check-in. The exact policy is displayed on the booking confirmation page.',
  },
  {
    category: 'Payments',
    q: 'Which payment methods are accepted?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), UPI, Net Banking, and Goibibo wallet. EMI options are available on bookings above ₹5,000 with select banks.',
  },
  {
    category: 'Payments',
    q: 'When will I receive my refund?',
    a: 'Refunds for cancelled bookings are processed within 24 hours on our end. The amount reflects in your account within 5–7 business days for cards, 2–3 days for UPI, and instantly for Goibibo wallet.',
  },
  {
    category: 'Cancellations',
    q: 'How do I cancel a train booking?',
    a: 'Navigate to My Bookings, find your train booking, and click "Cancel Booking". Cancellation charges follow IRCTC\'s standard rules: 48+ hrs before departure = minimal charges; less than 4 hrs = 50% fare deduction.',
  },
  {
    category: 'Holiday Packages',
    q: 'Can I customise a holiday package?',
    a: 'Absolutely! Click "Talk to a Travel Expert" on the Holiday Packages page or call our holidays helpline at 1800-11-2348 to create a fully custom itinerary.',
  },
  {
    category: 'My Account',
    q: 'How do I reset my password?',
    a: 'On the login page, click "Forgot Password". Enter your registered email address and we\'ll send a reset link within 2 minutes. Check your spam folder if you don\'t see it.',
  },
]

export default function HelpCenterPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [openIdx, setOpenIdx] = useState(null)
  const [catFilter, setCatFilter] = useState('All')

  const filteredFaqs = faqs.filter(f => {
    const matchesCat = catFilter === 'All' || f.category === catFilter
    const matchesSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="min-h-screen">
      {/* Hero with search */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-3">Help Center</p>
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for answers... e.g. cancel flight, refund status"
              className="w-full px-5 py-4 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button onClick={() => setCatFilter('All')}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm transition-colors ${catFilter === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
            <span className="text-xl">📋</span>
            <span className="font-medium text-xs">All</span>
          </button>
          {categories.map(c => (
            <button key={c.title} onClick={() => setCatFilter(c.title)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm transition-colors ${catFilter === c.title ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
              <span className="text-xl">{c.icon}</span>
              <span className="font-medium text-xs text-center leading-tight">{c.title}</span>
              <span className={`text-xs ${catFilter === c.title ? 'text-blue-100' : 'text-gray-400'}`}>{c.count} articles</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
          {search && <span className="text-sm font-normal text-gray-400 ml-2">— {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for "{search}"</span>}
        </h2>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🤔</div>
            <p className="text-gray-500">No results found. Try different keywords or <button onClick={() => navigate(ROUTES.CONTACT)} className="text-blue-600 hover:underline">contact us</button>.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <div>
                    <span className="text-xs text-blue-600 font-medium mr-2">{faq.category}</span>
                    <span className="font-medium text-gray-900 text-sm">{faq.q}</span>
                  </div>
                  <span className="text-gray-400 shrink-0 ml-3">{openIdx === i ? '▲' : '▼'}</span>
                </button>
                {openIdx === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100">
          <p className="text-gray-700 font-semibold mb-1">Still need help?</p>
          <p className="text-sm text-gray-500 mb-4">Our support team is available 24×7 to assist you.</p>
          <button onClick={() => navigate(ROUTES.CONTACT)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
