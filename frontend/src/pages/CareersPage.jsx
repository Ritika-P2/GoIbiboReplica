import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'

const perks = [
  { icon: '🏥', title: 'Health Insurance', desc: 'Comprehensive medical, dental and vision coverage for you and your family.' },
  { icon: '🌴', title: 'Unlimited PTO', desc: 'Take the time you need to recharge. We trust you to manage your time.' },
  { icon: '🏠', title: 'Remote-Friendly', desc: 'Work from anywhere in India. Flexibility is core to how we operate.' },
  { icon: '📚', title: 'Learning Budget', desc: '₹50,000 / year for courses, conferences, and books of your choice.' },
  { icon: '✈️', title: 'Travel Credits', desc: '₹1,00,000 annual Goibibo credits to explore the world yourself.' },
  { icon: '🍽️', title: 'Daily Meals', desc: 'Free breakfast and lunch at our offices in Gurgaon and Bangalore.' },
]

const openings = [
  { id: 1, title: 'Senior Frontend Engineer',      team: 'Engineering', location: 'Gurgaon / Remote', type: 'Full-time', level: 'Senior' },
  { id: 2, title: 'Backend Engineer (Node.js)',     team: 'Engineering', location: 'Gurgaon / Remote', type: 'Full-time', level: 'Mid–Senior' },
  { id: 3, title: 'Product Manager — Flights',      team: 'Product',     location: 'Gurgaon',          type: 'Full-time', level: 'Senior' },
  { id: 4, title: 'Data Scientist',                 team: 'Data',        location: 'Bangalore / Remote', type: 'Full-time', level: 'Mid-level' },
  { id: 5, title: 'UX Designer',                   team: 'Design',      location: 'Gurgaon',          type: 'Full-time', level: 'Mid-level' },
  { id: 6, title: 'Growth Marketing Manager',       team: 'Marketing',   location: 'Gurgaon',          type: 'Full-time', level: 'Senior' },
  { id: 7, title: 'Customer Experience Lead',       team: 'Support',     location: 'Gurgaon / Remote', type: 'Full-time', level: 'Mid-level' },
  { id: 8, title: 'DevOps / Cloud Engineer',        team: 'Engineering', location: 'Remote',           type: 'Full-time', level: 'Senior' },
  { id: 9, title: 'Finance Analyst',                team: 'Finance',     location: 'Gurgaon',          type: 'Full-time', level: 'Mid-level' },
  { id: 10, title: 'Frontend Intern',               team: 'Engineering', location: 'Gurgaon',          type: 'Internship', level: 'Intern' },
]

const TEAM_COLORS = {
  Engineering: 'bg-blue-100 text-blue-700',
  Product:     'bg-purple-100 text-purple-700',
  Design:      'bg-pink-100 text-pink-700',
  Data:        'bg-green-100 text-green-700',
  Marketing:   'bg-orange-100 text-orange-700',
  Support:     'bg-yellow-100 text-yellow-700',
  Finance:     'bg-teal-100 text-teal-700',
}

export default function CareersPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const teams = ['All', ...Array.from(new Set(openings.map(o => o.team)))]
  const filtered = filter === 'All' ? openings : openings.filter(o => o.team === filter)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest mb-3">We're Hiring</p>
          <h1 className="text-5xl font-bold mb-4">Build the Future of <span className="text-orange-400">Travel</span></h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            Join a team of 2,000+ passionate people working to make every journey seamless for millions of Indians.
          </p>
          <div className="flex justify-center gap-3 mt-8 text-sm">
            <span className="bg-white/10 px-4 py-2 rounded-full">🏢 Gurgaon HQ</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">🏢 Bangalore Office</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">🌍 Remote-Friendly</span>
          </div>
        </div>
      </div>

      {/* Perks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Why Goibibo?</h2>
        <p className="text-gray-500 text-center mb-10">We invest in our people as much as we invest in our product.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map(p => (
            <div key={p.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job listings */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Open Positions</h2>

          {/* Team filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
            {teams.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(job => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TEAM_COLORS[job.team] || 'bg-gray-100 text-gray-600'}`}>{job.team}</span>
                    {job.type === 'Internship' && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">Internship</span>}
                  </div>
                  <p className="text-sm text-gray-500">📍 {job.location} · {job.level}</p>
                </div>
                <Button size="sm" className="shrink-0" onClick={() => navigate(ROUTES.CONTACT)}>Apply Now</Button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't see a role that fits? <button onClick={() => navigate(ROUTES.CONTACT)} className="text-indigo-600 hover:underline">Send us your resume</button> — we're always looking for great people.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to make an impact?</h2>
        <p className="text-indigo-100 mb-8">Great missions attract great people. Come build with us.</p>
        <Button onClick={() => navigate(ROUTES.CONTACT)} className="bg-orange-500 hover:bg-orange-600 border-0 text-lg px-8 py-3">
          Get in Touch
        </Button>
      </div>
    </div>
  )
}
