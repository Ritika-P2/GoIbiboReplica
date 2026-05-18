import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CitySearch from '../common/CitySearch'
import Input from '../common/Input'
import Button from '../common/Button'
import { ROUTES } from '../../constants/routes'

export default function HotelSearch() {
  const navigate = useNavigate()
  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const [form, setForm] = useState({ city: '', checkIn: today, checkOut: tomorrow, guests: 1, rooms: 1 })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams({ ...form }).toString()
    navigate(`${ROUTES.HOTEL_RESULTS}?${params}`)
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div className="sm:col-span-2 lg:col-span-1">
          <CitySearch label="City or Area" placeholder="e.g. Mumbai, Goa, Delhi" value={form.city}
            onChange={v => set('city', v)} required />
        </div>
        <Input label="Check-in" type="date" min={today} value={form.checkIn}
          onChange={e => set('checkIn', e.target.value)} required />
        <Input label="Check-out" type="date" min={form.checkIn || today} value={form.checkOut}
          onChange={e => set('checkOut', e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Guests & Rooms</label>
          <div className="flex gap-2">
            <input type="number" min={1} max={20} value={form.guests}
              onChange={e => set('guests', e.target.value)}
              placeholder="Guests"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" min={1} max={10} value={form.rooms}
              onChange={e => set('rooms', e.target.value)}
              placeholder="Rooms"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-2">
        <Button type="submit" size="lg" className="px-12">Search Hotels</Button>
      </div>
    </form>
  )
}