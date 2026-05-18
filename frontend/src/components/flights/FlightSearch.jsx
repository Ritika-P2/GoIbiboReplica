import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AirportSearch from '../common/AirportSearch'
import Input from '../common/Input'
import Button from '../common/Button'
import { ROUTES } from '../../constants/routes'

export default function FlightSearch() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ origin: '', destination: '', date: today, passengers: 1, cabin: 'ECONOMY' })
  const [tripType, setTripType] = useState('one-way')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams({ ...form }).toString()
    navigate(`${ROUTES.FLIGHT_RESULTS}?${params}`)
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="flex gap-4 text-sm font-medium">
        {['one-way', 'round-trip'].map(t => (
          <label key={t} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" value={t} checked={tripType === t} onChange={() => setTripType(t)}
              className="accent-blue-600" />
            <span className="capitalize text-gray-700">{t}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <AirportSearch
          label="From"
          placeholder="City or Airport"
          value={form.origin}
          onChange={v => set('origin', v)}
          required
        />
        <AirportSearch
          label="To"
          placeholder="City or Airport"
          value={form.destination}
          onChange={v => set('destination', v)}
          required
        />
        <Input label="Departure" type="date" min={today} value={form.date}
          onChange={e => set('date', e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Travellers & Class</label>
          <div className="flex gap-2">
            <input type="number" min={1} max={9} value={form.passengers}
              onChange={e => set('passengers', e.target.value)}
              className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.cabin} onChange={e => set('cabin', e.target.value)}
              className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button type="submit" size="lg" className="px-12">Search Flights</Button>
      </div>
    </form>
  )
}