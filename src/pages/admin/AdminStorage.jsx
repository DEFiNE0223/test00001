import { useState } from 'react'
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import { networkVolumes, storagePricingByRegion } from '../../data/mock'

const INITIAL_REGIONS = [
  { id: 'r-tx-3', code: 'US-TX-3', name: 'Texas, US',     capacityTb: 500, usedTb: 312, enabled: true,  pricePerGbMonth: storagePricingByRegion['US-TX-3'] },
  { id: 'r-ro-1', code: 'EU-RO-1', name: 'Bucharest, EU', capacityTb: 300, usedTb: 148, enabled: true,  pricePerGbMonth: storagePricingByRegion['EU-RO-1'] },
  { id: 'r-ga-1', code: 'US-GA-1', name: 'Georgia, US',   capacityTb: 200, usedTb: 87,  enabled: true,  pricePerGbMonth: storagePricingByRegion['US-GA-1'] },
  { id: 'r-sg-1', code: 'AP-SG-1', name: 'Singapore, AP', capacityTb: 150, usedTb: 93,  enabled: true,  pricePerGbMonth: storagePricingByRegion['AP-SG-1'] },
  { id: 'r-ca-1', code: 'NA-CA-1', name: 'Toronto, CA',   capacityTb: 100, usedTb: 0,   enabled: false, pricePerGbMonth: storagePricingByRegion['NA-CA-1'] },
]

const EMPTY_REGION = { code: '', name: '', capacityTb: '', pricePerGbMonth: '0.20', enabled: true }

function RegionModal({ title, form, setForm, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={15} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Region Code</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="input w-full font-mono" placeholder="US-TX-3" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Region Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input w-full" placeholder="Texas, US" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Capacity (TB)</label>
            <input type="number" value={form.capacityTb} onChange={e => setForm(f => ({ ...f, capacityTb: e.target.value }))}
              className="input w-full" placeholder="500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price per GB / month ($)</label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-500">$</span>
              <input type="number" step="0.01" min="0" value={form.pricePerGbMonth}
                onChange={e => setForm(f => ({ ...f, pricePerGbMonth: e.target.value }))}
                className="input w-full" placeholder="0.20" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600" />
            <span className="text-xs font-medium text-gray-600">Enabled</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary text-sm py-2">Cancel</button>
          <button onClick={onSave} disabled={!form.code.trim() || !form.name.trim()}
            className="btn-primary text-sm py-2 disabled:opacity-40">Save Region</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminStorage() {
  const [regions, setRegions]     = useState(INITIAL_REGIONS)
  const [modal, setModal]         = useState(null)
  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState(EMPTY_REGION)
  const [deleteId, setDeleteId]   = useState(null)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredRegions = regions.filter(r => {
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'enabled' ? r.enabled : !r.enabled)
    const q = search.toLowerCase()
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
    return matchStatus && matchQ
  })

  const totalCapacity = regions.reduce((s, r) => s + r.capacityTb, 0)
  const totalUsed     = regions.reduce((s, r) => s + r.usedTb, 0)
  const utilPct       = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0

  const totalVolumes    = networkVolumes.length
  const totalVolGb      = networkVolumes.reduce((s, v) => s + v.sizeGb, 0)
  const attachedVolumes = networkVolumes.filter(v => v.attachedPodIds.length > 0).length

  // Compute monthly revenue using per-region prices
  const monthlyRevenue = networkVolumes.reduce((s, v) => {
    const region = regions.find(r => r.code === v.region)
    return s + v.sizeGb * (region?.pricePerGbMonth ?? 0.20)
  }, 0)

  function toggleRegion(id) {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  function openAdd() {
    setForm(EMPTY_REGION)
    setEditId(null)
    setModal('add')
  }

  function openEdit(r) {
    setForm({ code: r.code, name: r.name, capacityTb: String(r.capacityTb), pricePerGbMonth: String(r.pricePerGbMonth), enabled: r.enabled })
    setEditId(r.id)
    setModal('edit')
  }

  function handleSave() {
    const data = {
      code: form.code,
      name: form.name,
      capacityTb: Number(form.capacityTb),
      pricePerGbMonth: parseFloat(form.pricePerGbMonth) || 0.20,
      enabled: form.enabled,
    }
    if (modal === 'add') {
      setRegions(prev => [...prev, { id: `r-${Date.now()}`, usedTb: 0, ...data }])
    } else {
      setRegions(prev => prev.map(r => r.id === editId ? { ...r, ...data } : r))
    }
    setModal(null)
  }

  function handleDelete(id) {
    if (deleteId === id) {
      setRegions(prev => prev.filter(r => r.id !== id))
      setDeleteId(null)
    } else {
      setDeleteId(id)
    }
  }

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Storage</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage storage regions and pricing</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Regions</p>
          <p className="text-2xl font-bold text-gray-900">{regions.length}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            <span className="mr-2">
              <span className="inline-block rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">enabled</span>
              <span className="ml-1 text-gray-500">{regions.filter(r => r.enabled).length}</span>
            </span>
            {regions.filter(r => !r.enabled).length > 0 && (
              <span className="mr-2">
                <span className="inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">disabled</span>
                <span className="ml-1 text-gray-500">{regions.filter(r => !r.enabled).length}</span>
              </span>
            )}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Capacity</p>
          <p className="text-2xl font-bold text-gray-900">
            <span className="text-indigo-600">{totalUsed}</span>
            <span className="text-base font-medium text-gray-400"> / {totalCapacity} TB</span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-100">
              <div
                className={`h-1.5 rounded-full ${utilPct >= 85 ? 'bg-amber-400' : 'bg-indigo-500'}`}
                style={{ width: `${utilPct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500">{utilPct}% used</span>
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {['all', 'enabled', 'disabled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >{s}</button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search regions…"
            className="w-52 rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button onClick={openAdd} className="btn-primary text-xs py-2">
          <Plus size={13} /> Add Region
        </button>
      </div>

      {/* Regions table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
              <th className="px-4 py-3 text-left">Region</th>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-right">Capacity</th>
              <th className="px-4 py-3 text-right">Used</th>
              <th className="px-4 py-3 text-right">Utilization</th>
              <th className="px-4 py-3 text-right">Price / GB·mo</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRegions.map(r => {
              const pct = r.capacityTb > 0 ? Math.round((r.usedTb / r.capacityTb) * 100) : 0
              const barColor = pct >= 85 ? 'bg-amber-400' : pct >= 60 ? 'bg-indigo-500' : 'bg-emerald-400'
              return (
                <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${!r.enabled ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">{r.code}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{r.capacityTb} TB</td>
                  <td className="px-4 py-3 text-right text-gray-600">{r.usedTb} TB</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-gray-100">
                        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">${r.pricePerGbMonth.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleRegion(r.id)}
                      className={`transition-colors ${r.enabled ? 'text-indigo-500 hover:text-indigo-700' : 'text-gray-300 hover:text-gray-500'}`}>
                      {r.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(r)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <Pencil size={13} />
                      </button>
                      {deleteId === r.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-500">Delete?</span>
                          <button onClick={() => handleDelete(r.id)}
                            className="rounded-lg px-2 py-1 text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200">Yes</button>
                          <button onClick={() => setDeleteId(null)}
                            className="rounded-lg px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200">No</button>
                        </div>
                      ) : (
                        <button onClick={() => handleDelete(r.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredRegions.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No regions match your search.</div>
        )}

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-400 flex justify-between">
          <span>{filteredRegions.length} of {regions.length} regions</span>
          <span>Total capacity: <span className="font-semibold text-gray-700">{totalCapacity} TB</span></span>
        </div>
      </div>

      {modal && (
        <RegionModal
          title={modal === 'add' ? 'Add Region' : 'Edit Region'}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
