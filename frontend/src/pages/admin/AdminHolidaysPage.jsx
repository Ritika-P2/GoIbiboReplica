import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { adminHolidayAPI, approvalAPI } from '../../services/adminService'

const EMPTY = {
  title: '', description: '', duration: '', price: '',
  originalPrice: '', city: '', images: '', tags: '', highlights: '', isActive: true,
}

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

function StatusBadge({ status }) {
  const styles = {
    PENDING:  'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

export default function AdminHolidaysPage() {
  const user = useSelector(s => s.auth.user)
  const isAdmin = user?.role === 'ADMIN'

  const [packages, setPackages]       = useState([])
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
      const res = await adminHolidayAPI.list(params)
      setPackages(res.data?.packages || [])
      setMeta(res.meta)
    } catch { setError('Failed to load packages.') }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  function openAdd() { setEditing(null); setForm(EMPTY); setError(''); setShowForm(true) }
  function openEdit(p) {
    setEditing(p.id)
    setForm({
      title: p.title, description: p.description || '',
      duration: String(p.duration), price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      city: p.city,
      images:     (p.images     || []).join(', '),
      tags:       (p.tags       || []).join(', '),
      highlights: (p.highlights || []).join(', '),
      isActive: p.isActive,
    })
    setError(''); setShowForm(true)
  }

  const fld = (key) => (v) => setForm(p => ({ ...p, [key]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editing) await adminHolidayAPI.update(editing, form)
      else await adminHolidayAPI.create(form)
      setSuccess(editing ? 'Package updated!' : 'Package added! Pending approval.')
      setShowForm(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  async function handleToggle(pkg) {
    try {
      await adminHolidayAPI.update(pkg.id, { isActive: !pkg.isActive })
      setSuccess(`Package ${pkg.isActive ? 'deactivated' : 'activated'}.`)
      load()
    } catch { setError('Update failed.') }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this package?')) return
    try { await adminHolidayAPI.remove(id); setSuccess('Deleted.'); load() }
    catch { setError('Delete failed.') }
  }

  async function handleApprove(id) {
    try { await approvalAPI.approve('holidays', id); setSuccess('Package approved.'); load() }
    catch { setError('Approval failed.') }
  }

  async function handleReject() {
    try {
      await approvalAPI.reject('holidays', rejectModal.id, rejectReason)
      setSuccess('Package rejected.')
      setRejectModal(null)
      load()
    } catch { setError('Rejection failed.') }
  }

  const discount = (form.originalPrice && form.price)
    ? Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)
    : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Holiday Packages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} entries</p>
        </div>
        <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Add Package</button>
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
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Package' : 'Add Holiday Package'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <F label="Package Title *" value={form.title} onChange={fld('title')} required placeholder="e.g. Goa Beach Escape" />
            </div>
            <F label="City / Destination *" value={form.city} onChange={fld('city')} required placeholder="e.g. Goa" />
            <F label="Duration (nights) *" type="number" value={form.duration} onChange={fld('duration')} required />
            <F label="Price (₹) *"          type="number" value={form.price}         onChange={fld('price')}         required />
            <div>
              <F label="Original Price (₹)" type="number" value={form.originalPrice} onChange={fld('originalPrice')} placeholder="For showing strikethrough" />
              {discount > 0 && <p className="text-xs text-green-600 mt-1 font-semibold">{discount}% off</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea value={form.description} onChange={e => fld('description')(e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Short description of the package…" />
            </div>
            <F label="Tags (comma-separated)"       value={form.tags}       onChange={fld('tags')}       placeholder="Beach, Goa, Relaxation" />
            <F label="Highlights (comma-separated)" value={form.highlights} onChange={fld('highlights')} placeholder="Flight included, 4-star hotel, Day trips" />
            <div className="col-span-2">
              <F label="Image URLs (comma-separated)" value={form.images} onChange={fld('images')} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">Active (visible after approval)</label>
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                {saving ? 'Saving…' : editing ? 'Update Package' : 'Add Package'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No packages found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Title','City','Duration','Price','Active','Approval','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packages.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{p.title}</td>
                  <td className="px-4 py-3 text-gray-600">{p.city}</td>
                  <td className="px-4 py-3 text-gray-600">{p.duration}N</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">₹{Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(p)}
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={p.status} />
                      {p.status === 'REJECTED' && p.rejectionReason && (
                        <span className="text-xs text-red-500 italic">{p.rejectionReason}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                      {isAdmin && p.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(p.id)} className="text-xs text-green-600 hover:underline font-medium">Approve</button>
                          <button onClick={() => { setRejectModal(p); setRejectReason('') }} className="text-xs text-red-600 hover:underline font-medium">Reject</button>
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
            <h3 className="font-bold text-gray-900 mb-2">Reject Package</h3>
            <p className="text-sm text-gray-500 mb-3">{rejectModal.title} — {rejectModal.city}</p>
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
