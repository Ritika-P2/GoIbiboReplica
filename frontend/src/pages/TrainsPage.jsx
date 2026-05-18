import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StationSearch from '../components/common/StationSearch'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { ROUTES } from '../constants/routes'

const TRAIN_CLASSES = [
  { value: '', label: 'All Classes' },
  { value: 'SL', label: 'Sleeper (SL)' },
  { value: '3A', label: 'AC 3 Tier (3A)' },
  { value: '2A', label: 'AC 2 Tier (2A)' },
  { value: '1A', label: 'AC First Class (1A)' },
  { value: 'CC', label: 'Chair Car (CC)' },
]

const popularRoutes = [
  { from: 'New Delhi',  to: 'Mumbai',    label: 'New Delhi → Mumbai' },
  { from: 'Mumbai',     to: 'Chennai',   label: 'Mumbai → Chennai' },
  { from: 'Delhi',      to: 'Kolkata',   label: 'Delhi → Kolkata' },
  { from: 'Bangalore',  to: 'Hyderabad', label: 'Bangalore → Hyderabad' },
  { from: 'Chennai',    to: 'Delhi',     label: 'Chennai → Delhi' },
  { from: 'Mumbai',     to: 'Goa',       label: 'Mumbai → Goa' },
]

export default function TrainsPage() {
  const navigate = useNavigate()
  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const [form, setForm] = useState({ origin: '', destination: '', date: tomorrow, trainClass: '' })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams(Object.fromEntries(Object.entries(form).filter(([, v]) => v))).toString()
    navigate(`${ROUTES.TRAIN_RESULTS}?${params}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">🚆</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Book Train Tickets</h1>
            <p className="mt-3 text-green-100 text-lg">Check availability and book confirmed rail tickets across India.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StationSearch label="From Station" placeholder="e.g. New Delhi, NDLS" value={form.origin}
                  onChange={v => set('origin', v)} required />
                <StationSearch label="To Station" placeholder="e.g. Mumbai, BCT" value={form.destination}
                  onChange={v => set('destination', v)} required />
                <Input label="Journey Date" type="date" min={today} value={form.date}
                  onChange={e => set('date', e.target.value)} required />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Class</label>
                  <select value={form.trainClass} onChange={e => set('trainClass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    {TRAIN_CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <Button type="submit" size="lg" className="px-12 bg-green-600 hover:bg-green-700">Search Trains</Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Popular routes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Train Routes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularRoutes.map(r => (
              <button key={r.label} onClick={() => {
                setForm(f => ({ ...f, origin: r.from, destination: r.to }))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
                className="flex flex-col p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all text-left group">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700">{r.label}</span>
                <span className="text-xs text-green-600 mt-1">View trains →</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '🎫', title: 'Confirmed Tickets', desc: 'Book confirmed and waitlisted tickets instantly.' },
            { icon: '🔄', title: 'Easy Cancellation', desc: 'Cancel up to 4 hours before departure.' },
            { icon: '📱', title: 'E-Tickets', desc: 'Travel paperless with digital tickets on your phone.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}