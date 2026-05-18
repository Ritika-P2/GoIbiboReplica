import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'

const stats = [
  { value: '50M+', label: 'Happy Travellers' },
  { value: '1,200+', label: 'Destinations' },
  { value: '500+', label: 'Airline Partners' },
  { value: '25,000+', label: 'Hotels Listed' },
]

const values = [
  { icon: '🎯', title: 'Customer First', desc: 'Every decision we make starts and ends with what is best for our travellers.' },
  { icon: '🔒', title: 'Trust & Safety', desc: 'Your data and payments are protected with bank-grade encryption and security.' },
  { icon: '⚡', title: 'Speed & Simplicity', desc: 'Book a flight, hotel, or holiday package in under two minutes.' },
  { icon: '💡', title: 'Innovation', desc: 'We continuously invest in technology to make travel planning effortless.' },
]

const team = [
  { name: 'Aarav Mehta',    role: 'CEO & Co-founder',      emoji: '👨‍💼' },
  { name: 'Priya Sharma',   role: 'CTO & Co-founder',      emoji: '👩‍💻' },
  { name: 'Rahul Verma',    role: 'VP Product',            emoji: '👨‍🎨' },
  { name: 'Sneha Kapoor',   role: 'VP Engineering',        emoji: '👩‍🔧' },
  { name: 'Vikram Singh',   role: 'Head of Partnerships',  emoji: '🤝' },
  { name: 'Ananya Bose',    role: 'Head of Customer Care', emoji: '💬' },
]

const milestones = [
  { year: '2012', event: 'Goibibo founded in Gurgaon with a vision to simplify Indian travel.' },
  { year: '2015', event: 'Reached 5 million bookings. Expanded train and bus verticals.' },
  { year: '2017', event: 'Launched Goibibo for Business — corporate travel management.' },
  { year: '2019', event: '10 million app downloads. Introduced AI-powered price predictions.' },
  { year: '2022', event: 'Holiday packages launched. 50M+ happy travellers milestone.' },
  { year: '2024', event: 'Next-gen platform rebuild with real-time inventory and instant confirmation.' },
]

export default function AboutPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-3">Our Story</p>
          <h1 className="text-5xl font-bold mb-4">Travel Made <span className="text-orange-400">Simple</span></h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Goibibo was born from a simple belief — every Indian deserves to travel the world without friction.
            We connect millions of travellers to flights, hotels, trains, buses, and holiday packages every day.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Button onClick={() => navigate(ROUTES.FLIGHTS)} className="bg-orange-500 hover:bg-orange-600 border-0">
              Start Exploring
            </Button>
            <Button variant="secondary" onClick={() => navigate(ROUTES.CAREERS)}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              Join Our Team
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-4xl font-bold text-blue-600">{s.value}</p>
                <p className="text-gray-500 mt-1 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wide mb-2">Our Mission</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Making India Travel More</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We believe travel transforms lives. It broadens perspectives, creates memories, and connects people.
              Our mission is to remove every barrier that stands between a traveller and their next adventure.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From the first search to the final check-out, Goibibo handles the complexity so you can focus on
              what matters — the experience itself.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {values.map(v => (
              <div key={v.title} className="bg-gray-50 rounded-2xl p-5">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px bg-blue-200" />
            <div className="space-y-8">
              {milestones.map(m => (
                <div key={m.year} className="flex gap-6 items-start">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold text-center leading-tight relative z-10">
                    {m.year}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1 shadow-sm">
                    <p className="text-gray-700 text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Meet the Team</h2>
        <p className="text-gray-500 text-center mb-10">The people building India's favourite travel platform</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {team.map(t => (
            <div key={t.name} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl mx-auto mb-3">
                {t.emoji}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to explore the world?</h2>
        <p className="text-blue-100 mb-8">Join 50 million travellers who trust Goibibo for every trip.</p>
        <Button onClick={() => navigate(ROUTES.HOME)} className="bg-orange-500 hover:bg-orange-600 border-0 text-lg px-8 py-3">
          Book Your Next Trip
        </Button>
      </div>
    </div>
  )
}
