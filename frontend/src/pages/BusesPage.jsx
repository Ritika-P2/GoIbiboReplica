import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CitySearch from '../components/common/CitySearch'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { ROUTES } from '../constants/routes'

const BUS_TYPES = [
  { value: '',        label: 'All Types' },
  { value: 'Sleeper', label: 'Sleeper' },
  { value: 'Seater',  label: 'Seater' },
  { value: 'AC',      label: 'AC' },
  { value: 'Volvo',   label: 'Volvo' },
]

const popularRoutes = [
  { from: 'Mumbai',    to: 'Pune',      label: 'Mumbai → Pune' },
  { from: 'Bangalore', to: 'Chennai',   label: 'Bangalore → Chennai' },
  { from: 'Delhi',     to: 'Jaipur',    label: 'Delhi → Jaipur' },
  { from: 'Hyderabad', to: 'Bangalore', label: 'Hyderabad → Bangalore' },
  { from: 'Mumbai',    to: 'Goa',       label: 'Mumbai → Goa' },
  { from: 'Delhi',     to: 'Agra',      label: 'Delhi → Agra' },
]

export default function BusesPage() {
  const navigate = useNavigate()
  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const [form, setForm] = useState({ origin: '', destination: '', date: tomorrow, busType: '' })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams(Object.fromEntries(Object.entries(form).filter(([, v]) => v))).toString()
    navigate(`${ROUTES.BUS_RESULTS}?${params}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">🚌</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Book Bus Tickets</h1>
            <p className="mt-3 text-orange-100 text-lg">Comfortable and affordable bus travel across India.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <CitySearch label="From City" placeholder="e.g. Mumbai, Delhi" value={form.origin}
                  onChange={v => set('origin', v)} required />
                <CitySearch label="To City" placeholder="e.g. Pune, Goa" value={form.destination}
                  onChange={v => set('destination', v)} required />
                <Input label="Journey Date" type="date" min={today} value={form.date}
                  onChange={e => set('date', e.target.value)} required />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Bus Type</label>
                  <select value={form.busType} onChange={e => set('busType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {BUS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <Button type="submit" size="lg" className="px-12 bg-orange-500 hover:bg-orange-600">Search Buses</Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Popular routes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Bus Routes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularRoutes.map(r => (
              <button key={r.label} onClick={() => {
                setForm(f => ({ ...f, origin: r.from, destination: r.to }))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
                className="flex flex-col p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all text-left group">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-700">{r.label}</span>
                <span className="text-xs text-orange-500 mt-1">View buses →</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '🛋️', title: 'Comfortable Seating', desc: 'Choose from sleeper, semi-sleeper or seater buses.' },
            { icon: '🌙', title: 'Overnight Journeys',  desc: "Save a night's stay with our overnight bus options." },
            { icon: '📍', title: 'Live Bus Tracking',   desc: 'Track your bus in real-time from boarding point.' },
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
