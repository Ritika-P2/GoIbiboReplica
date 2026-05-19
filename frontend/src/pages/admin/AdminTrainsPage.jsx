import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { adminTrainAPI, approvalAPI } from '../../services/adminService'

const EMPTY = {
  trainNumber: '', trainName: '', origin: '', destination: '',
  departureTime: '', arrivalTime: '', duration: '',
  totalSeats: '', availableSeats: '',
  sleeperPrice: '', acThreePrice: '', acTwoPrice: '', acFirstPrice: '',
}

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status }) {
  const styles = {
    PENDING:  'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

export default function AdminTrainsPage() {
  const user = useSelector(s => s.auth.user)
  const isAdmin = user?.role === 'ADMIN'

  const [trains, setTrains]           = useState([])
  const [meta, setMeta]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showForm, setShowForm]       = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 50 }
      if (statusFilter !== 'ALL') params.status = statusFilter
      const res = await adminTrainAPI.list(params)
      setTrains(res.data?.trains || [])
      setMeta(res.meta)
    } catch { setError('Failed to load trains.') }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  function openAdd() { setEditing(null); setForm(EMPTY); setError(''); setShowForm(true) }
  function openEdit(t) {
    const c = t.classes || {}
    setEditing(t.id)
    setForm({
      trainNumber: t.trainNumber, trainName: t.trainName,
      origin: t.origin, destination: t.destination,
      departureTime: t.departureTime?.slice(0, 16) || '',
      arrivalTime:   t.arrivalTime?.slice(0, 16) || '',
      duration: String(t.duration),
      totalSeats: String(t.totalSeats), availableSeats: String(t.availableSeats),
      sleeperPrice:  String(c.Sleeper?.price  || ''),
      acThreePrice:  String(c['3A']?.price    || ''),
      acTwoPrice:    String(c['2A']?.price    || ''),
      acFirstPrice:  String(c['1A']?.price    || ''),
    })
    setError(''); setShowForm(true)
  }

  function buildClasses() {
    const c = {}
    if (form.sleeperPrice) c['Sleeper'] = { price: Number(form.sleeperPrice), available: Number(form.availableSeats) }
    if (form.acThreePrice) c['3A']      = { price: Number(form.acThreePrice), available: Math.floor(Number(form.availableSeats) * 0.4) }
    if (form.acTwoPrice)   c['2A']      = { price: Number(form.acTwoPrice),   available: Math.floor(Number(form.availableSeats) * 0.3) }
    if (form.acFirstPrice) c['1A']      = { price: Number(form.acFirstPrice), available: Math.floor(Number(form.availableSeats) * 0.1) }
    return c
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = {
        trainNumber: form.trainNumber, trainName: form.trainName,
        origin: form.origin, destination: form.destination,
        departureTime: form.departureTime, arrivalTime: form.arrivalTime,
        duration: form.duration, totalSeats: form.totalSeats,
        availableSeats: form.availableSeats,
        classes: buildClasses(),
      }
      if (editing) await adminTrainAPI.update(editing, payload)
      else await adminTrainAPI.create(payload)
      setSuccess(editing ? 'Train updated!' : 'Train added! Pending approval.')
      setShowForm(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this train?')) return
    try { await adminTrainAPI.remove(id); setSuccess('Deleted.'); load() }
    catch { setError('Delete failed.') }
  }

  async function handleApprove(id) {
    try { await approvalAPI.approve('trains', id); setSuccess('Train approved.'); load() }
    catch { setError('Approval failed.') }
  }

  async function handleReject() {
    try {
      await approvalAPI.reject('trains', rejectModal.id, rejectReason)
      setSuccess('Train rejected.')
      setRejectModal(null)
      load()
    } catch { setError('Rejection failed.') }
  }

  const fld = (key) => (v) => setForm(p => ({ ...p, [key]: v }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Train Schedules</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} entries</p>
        </div>
        <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Add Train</button>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${statusFilter === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Train' : 'Add New Train'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <F label="Train Number *" value={form.trainNumber} onChange={fld('trainNumber')} required placeholder="e.g. 12301" />
            <F label="Train Name *"   value={form.trainName}   onChange={fld('trainName')}   required placeholder="e.g. Rajdhani Express" />
            <F label="Origin *"       value={form.origin}      onChange={fld('origin')}       required placeholder="e.g. New Delhi" />
            <F label="Destination *"  value={form.destination} onChange={fld('destination')}  required placeholder="e.g. Mumbai CST" />
            <F label="Departure *" type="datetime-local" value={form.departureTime} onChange={fld('departureTime')} required />
            <F label="Arrival *"   type="datetime-local" value={form.arrivalTime}   onChange={fld('arrivalTime')}   required />
            <F label="Duration (mins) *" type="number" value={form.duration}      onChange={fld('duration')}       required />
            <F label="Total Seats *"     type="number" value={form.totalSeats}    onChange={fld('totalSeats')}     required />
            <F label="Available Seats *" type="number" value={form.availableSeats} onChange={fld('availableSeats')} required />
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-600 mb-2 mt-1">Class Prices (₹) — leave blank to skip that class</p>
              <div className="grid grid-cols-4 gap-3">
                <F label="Sleeper" type="number" value={form.sleeperPrice} onChange={fld('sleeperPrice')} placeholder="e.g. 450" />
                <F label="3A (AC 3-Tier)" type="number" value={form.acThreePrice} onChange={fld('acThreePrice')} placeholder="e.g. 900" />
                <F label="2A (AC 2-Tier)" type="number" value={form.acTwoPrice}   onChange={fld('acTwoPrice')}   placeholder="e.g. 1350" />
                <F label="1A (AC First)"  type="number" value={form.acFirstPrice} onChange={fld('acFirstPrice')} placeholder="e.g. 2200" />
              </div>
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                {saving ? 'Saving…' : editing ? 'Update Train' : 'Add Train'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : trains.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No trains found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Train No.','Name','Route','Departure','Seats','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trains.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-800">{t.trainNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{t.trainName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.origin} → {t.destination}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(t.departureTime)}</td>
                  <td className="px-4 py-3 text-gray-600">{t.availableSeats}/{t.totalSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={t.status} />
                      {t.status === 'REJECTED' && t.rejectionReason && (
                        <span className="text-xs text-red-500 italic">{t.rejectionReason}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEdit(t)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(t.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                      {isAdmin && t.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(t.id)} className="text-xs text-green-600 hover:underline font-medium">Approve</button>
                          <button onClick={() => { setRejectModal(t); setRejectReason('') }} className="text-xs text-red-600 hover:underline font-medium">Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Reject Train</h3>
            <p className="text-sm text-gray-500 mb-3">{rejectModal.trainNumber} — {rejectModal.trainName}</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-red-400" />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Reject</button>
              <button onClick={() => setRejectModal(null)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
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
