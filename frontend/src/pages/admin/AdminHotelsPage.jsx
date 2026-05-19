import { useState, useEffect, useCallback } from 'react'
import { adminHotelAPI } from '../../services/adminService'

const EMPTY_HOTEL = {
  name: '', description: '', city: '', address: '',
  starRating: '3', amenities: '', images: '',
}
const EMPTY_ROOM = {
  type: '', description: '', pricePerNight: '',
  capacity: '2', totalRooms: '10', amenities: '', images: '',
}

export default function AdminHotelsPage() {
  const [hotels, setHotels]   = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY_HOTEL)
  const [rooms, setRooms]     = useState([{ ...EMPTY_ROOM }])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminHotelAPI.list({ limit: 50 })
      setHotels(res.data?.hotels || [])
      setMeta(res.meta)
    } catch { setError('Failed to load hotels.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { setEditing(null); setForm(EMPTY_HOTEL); setRooms([{ ...EMPTY_ROOM }]); setError(''); setShowForm(true) }
  function openEdit(h) {
    setEditing(h.id)
    setForm({
      name: h.name, description: h.description || '',
      city: h.city, address: h.address,
      starRating: String(h.starRating),
      amenities: (h.amenities || []).join(', '),
      images: (h.images || []).join(', '),
    })
    setRooms([{ ...EMPTY_ROOM }])
    setError(''); setShowForm(true)
  }

  function setRoom(i, key, val) {
    setRooms(rs => rs.map((r, idx) => idx === i ? { ...r, [key]: val } : r))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = { ...form, ...(editing ? {} : { rooms }) }
      if (editing) await adminHotelAPI.update(editing, payload)
      else await adminHotelAPI.create(payload)
      setSuccess(editing ? 'Hotel updated!' : 'Hotel added!')
      setShowForm(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this hotel and all its rooms?')) return
    try { await adminHotelAPI.remove(id); setSuccess('Deleted.'); load() }
    catch { setError('Delete failed.') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} hotels in database</p>
        </div>
        <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Add Hotel</button>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Hotel' : 'Add New Hotel'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <F label="Hotel Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
              <F label="City *"       value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} required />
              <F label="Address *"    value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} required />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Star Rating *</label>
                <select value={form.starRating} onChange={e => setForm(f => ({ ...f, starRating: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <F label="Amenities (comma-separated)" value={form.amenities} onChange={v => setForm(f => ({ ...f, amenities: v }))} placeholder="Pool, WiFi, Gym" />
              <F label="Image URLs (comma-separated)" value={form.images} onChange={v => setForm(f => ({ ...f, images: v }))} placeholder="https://..." />
            </div>

            {!editing && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-700">Rooms</p>
                  <button type="button" onClick={() => setRooms(rs => [...rs, { ...EMPTY_ROOM }])}
                    className="text-xs text-orange-500 font-semibold hover:underline">+ Add Room Type</button>
                </div>
                {rooms.map((r, i) => (
                  <div key={i} className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg mb-3 border border-gray-200">
                    <div className="col-span-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-600">Room Type {i + 1}</p>
                      {rooms.length > 1 && (
                        <button type="button" onClick={() => setRooms(rs => rs.filter((_, idx) => idx !== i))}
                          className="text-xs text-red-500 hover:underline">Remove</button>
                      )}
                    </div>
                    <F label="Type *"        value={r.type}         onChange={v => setRoom(i, 'type', v)} required placeholder="Deluxe, Suite…" />
                    <F label="Price/Night *" type="number" value={r.pricePerNight} onChange={v => setRoom(i, 'pricePerNight', v)} required />
                    <F label="Capacity"      type="number" value={r.capacity}     onChange={v => setRoom(i, 'capacity', v)} />
                    <F label="Total Rooms"   type="number" value={r.totalRooms}   onChange={v => setRoom(i, 'totalRooms', v)} />
                    <F label="Amenities"     value={r.amenities} onChange={v => setRoom(i, 'amenities', v)} placeholder="AC, TV, Balcony" />
                    <F label="Image URLs"    value={r.images}    onChange={v => setRoom(i, 'images', v)} />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                {saving ? 'Saving…' : editing ? 'Update Hotel' : 'Add Hotel'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No hotels yet. Add one above.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name','City','Stars','Rooms','Amenities','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hotels.map(h => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{h.name}</td>
                  <td className="px-4 py-3 text-gray-600">{h.city}</td>
                  <td className="px-4 py-3">{'★'.repeat(h.starRating)}</td>
                  <td className="px-4 py-3 text-gray-600">{h.rooms?.length ?? 0} types</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(h.amenities || []).slice(0, 3).join(', ')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(h)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(h.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function F({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
    </div>
  )
}
