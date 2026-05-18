import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const CAB_TYPES = [
  { value: 'Mini',     label: 'Mini',     desc: 'Up to 4 seats', icon: '🚗', example: 'Wagon R, Alto' },
  { value: 'Sedan',    label: 'Sedan',    desc: 'Up to 4 seats', icon: '🚙', example: 'Swift Dzire, Etios' },
  { value: 'SUV',      label: 'SUV',      desc: 'Up to 6 seats', icon: '🚐', example: 'Innova, Ertiga' },
  { value: 'Luxury',   label: 'Luxury',   desc: 'Up to 4 seats', icon: '🏎️', example: 'Mercedes, BMW' },
]

export default function CabsPage() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ pickup: '', dropoff: '', date: today, cabType: '' })
  const [tripType, setTripType] = useState('one-way')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams(Object.fromEntries(Object.entries({ ...form, tripType }).filter(([, v]) => v))).toString()
    navigate(`/cabs/results?${params}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">🚖</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Book a Cab</h1>
            <p className="mt-3 text-yellow-100 text-lg">Safe, affordable and comfortable cabs at your doorstep.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Trip type toggle */}
              <div className="flex gap-4 text-sm font-medium">
                {['one-way', 'round-trip', 'hourly'].map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={t} checked={tripType === t} onChange={() => setTripType(t)} className="accent-orange-500" />
                    <span className="capitalize text-gray-700">{t}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input label="Pickup Location" placeholder="e.g. Mumbai Airport, Sector 62 Noida" value={form.pickup}
                  onChange={e => set('pickup', e.target.value)} required />
                <Input label="Drop Location" placeholder="e.g. Taj Hotel, Connaught Place" value={form.dropoff}
                  onChange={e => set('dropoff', e.target.value)} required />
                <Input label="Pickup Date" type="date" min={today} value={form.date}
                  onChange={e => set('date', e.target.value)} required />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Cab Type</label>
                  <select value={form.cabType} onChange={e => set('cabType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Any Type</option>
                    {CAB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <Button type="submit" size="lg" className="px-12 bg-orange-500 hover:bg-orange-600">Search Cabs</Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Cab types */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Choose Your Ride</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CAB_TYPES.map(t => (
              <div key={t.value} onClick={() => set('cabType', t.value)}
                className={`cursor-pointer flex flex-col items-center p-5 rounded-xl border-2 transition-all text-center ${form.cabType === t.value ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-orange-200 hover:bg-orange-50'}`}>
                <span className="text-4xl mb-2">{t.icon}</span>
                <span className="font-semibold text-gray-800">{t.label}</span>
                <span className="text-xs text-gray-500 mt-0.5">{t.desc}</span>
                <span className="text-xs text-orange-500 mt-1">{t.example}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '⏱️', title: 'On-Time Pickup', desc: 'Drivers arrive on time, every time.' },
            { icon: '🧾', title: 'Transparent Pricing', desc: 'No hidden charges. Pay what you see.' },
            { icon: '⭐', title: 'Top-Rated Drivers', desc: 'All drivers are verified and highly rated.' },
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