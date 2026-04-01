import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react'
import { gpuOptions as initialGpus, gpuFleet } from '../../data/mock'

const TIERS = ['premium', 'high', 'mid', 'entry']

const tierMeta = {
  premium: 'bg-violet-100 text-violet-700',
  high:    'bg-indigo-100 text-indigo-700',
  mid:     'bg-blue-100   text-blue-700',
  entry:   'bg-gray-100   text-gray-600',
}

const EMPTY = { name: '', vram: '', vcpu: '', ram: '', costPerHr: '', tier: 'mid', maxCount: '4' }

// Per-GPU-type fleet utilization aggregated from gpuFleet nodes
const fleetByType = gpuFleet.reduce((acc, node) => {
  if (!acc[node.gpuType]) acc[node.gpuType] = { total: 0, inUse: 0 }
  acc[node.gpuType].total += node.total
  acc[node.gpuType].inUse += node.inUse
  return acc
}, {})

function UtilCell({ gpuName }) {
  const f   = fleetByType[gpuName] ?? { total: 0, inUse: 0 }
  if (f.total === 0) return <span className="text-xs text-gray-300">Not deployed</span>
  const pct = Math.round((f.inUse / f.total) * 100)
  const bar = pct >= 90 ? 'bg-amber-400' : pct >= 70 ? 'bg-indigo-500' : 'bg-blue-400'
  const txt = pct >= 90 ? 'text-amber-600' : pct >= 70 ? 'text-indigo-600' : 'text-gray-600'
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-100">
        <div className={`h-1.5 rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${txt}`}>
        {f.inUse}<span className="font-normal text-gray-400">/{f.total}</span>
      </span>
    </div>
  )
}

function Modal({ title, form, setForm, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">GPU Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input w-full" placeholder="e.g. NVIDIA H100 80GB SXM" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">VRAM (GB)</label>
              <input type="number" value={form.vram} onChange={e => setForm(f => ({ ...f, vram: e.target.value }))}
                className="input w-full" placeholder="80" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">vCPU</label>
              <input type="number" value={form.vcpu} onChange={e => setForm(f => ({ ...f, vcpu: e.target.value }))}
                className="input w-full" placeholder="16" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">RAM (GB)</label>
              <input type="number" value={form.ram} onChange={e => setForm(f => ({ ...f, ram: e.target.value }))}
                className="input w-full" placeholder="64" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cost / hr ($)</label>
              <input type="number" step="0.01" value={form.costPerHr} onChange={e => setForm(f => ({ ...f, costPerHr: e.target.value }))}
                className="input w-full" placeholder="3.89" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tier</label>
              <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                className="input w-full capitalize">
                {TIERS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Count / pod</label>
              <input type="number" value={form.maxCount} onChange={e => setForm(f => ({ ...f, maxCount: e.target.value }))}
                className="input w-full" placeholder="8" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary text-sm py-2">Cancel</button>
          <button onClick={onSave} disabled={!form.name.trim() || !form.costPerHr}
            className="btn-primary text-sm py-2 disabled:opacity-40">Save GPU</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminGpuCatalog() {
  const [gpus, setGpus]             = useState(() => initialGpus.map(g => ({ ...g })))
  const [modal, setModal]           = useState(null)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [deleteId, setDeleteId]     = useState(null)
  const [search, setSearch]         = useState('')
  const [tierFilter, setTierFilter] = useState('all')

  const tierCounts = TIERS.reduce((acc, t) => ({ ...acc, [t]: gpus.filter(g => g.tier === t).length }), {})
  const prices     = gpus.map(g => g.costPerHr)
  const priceMin   = prices.length ? Math.min(...prices) : 0
  const priceMax   = prices.length ? Math.max(...prices) : 0

  const filtered = gpus.filter(g => {
    const matchTier = tierFilter === 'all' || g.tier === tierFilter
    const matchQ = !search || g.name.toLowerCase().includes(search.toLowerCase())
    return matchTier && matchQ
  })

  function openAdd() { setForm(EMPTY); setEditId(null); setModal('add') }

  function openEdit(gpu) {
    setForm({
      name: gpu.name, vram: String(gpu.vram), vcpu: String(gpu.vcpu),
      ram: String(gpu.ram), costPerHr: String(gpu.costPerHr),
      tier: gpu.tier, maxCount: String(gpu.maxCount),
    })
    setEditId(gpu.id); setModal('edit')
  }

  function handleSave() {
    const parsed = {
      name: form.name,
      vram: Number(form.vram), vcpu: Number(form.vcpu), ram: Number(form.ram),
      costPerHr: parseFloat(form.costPerHr), tier: form.tier, maxCount: Number(form.maxCount),
    }
    if (modal === 'add') {
      setGpus(prev => [...prev, { id: `gpu-${Date.now()}`, ...parsed }])
    } else {
      setGpus(prev => prev.map(g => g.id === editId ? { ...g, ...parsed } : g))
    }
    setModal(null)
  }

  function handleDelete(id) {
    if (deleteId === id) { setGpus(prev => prev.filter(g => g.id !== id)); setDeleteId(null) }
    else setDeleteId(id)
  }

  return (
    <div className="space-y-4">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">GPU</h1>
        <p className="text-sm text-gray-400 mt-0.5">Configure available GPU types and pricing</p>
      </div>

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">GPU</p>
          <p className="text-2xl font-bold text-gray-900">{gpus.length}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {TIERS.map(t => tierCounts[t] > 0 ? (
              <span key={t} className="mr-2">
                <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${tierMeta[t]}`}>{t}</span>
                <span className="ml-1 text-gray-500">{tierCounts[t]}</span>
              </span>
            ) : null)}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Price Range</p>
          <p className="text-2xl font-bold text-gray-900">
            ${priceMin.toFixed(2)}
            <span className="text-base font-medium text-gray-400 mx-1">–</span>
            ${priceMax.toFixed(2)}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">per hour</p>
        </div>
      </div>

      {/* ── Tier filter tabs ── */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {['all', ...TIERS].map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              tierFilter === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >{t}</button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search GPUs…"
            className="w-52 rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button onClick={openAdd} className="btn-primary text-xs py-2">
          <Plus size={13} /> Add GPU
        </button>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
              <th className="px-4 py-3 text-left">GPU</th>
              <th className="px-4 py-3 text-left">Tier</th>
              <th className="px-4 py-3 text-right">VRAM</th>
              <th className="px-4 py-3 text-right">vCPU</th>
              <th className="px-4 py-3 text-right">RAM</th>
              <th className="px-4 py-3 text-right">Cost / hr</th>
              <th className="px-4 py-3 text-right">In Use</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(gpu => (
              <tr key={gpu.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {gpu.name.replace('NVIDIA ', '')}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tierMeta[gpu.tier]}`}>
                    {gpu.tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{gpu.vram} GB</td>
                <td className="px-4 py-3 text-right text-gray-600">{gpu.vcpu}</td>
                <td className="px-4 py-3 text-right text-gray-600">{gpu.ram} GB</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">${gpu.costPerHr.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <UtilCell gpuName={gpu.name} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(gpu)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Pencil size={13} />
                    </button>
                    {deleteId === gpu.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-500">Delete?</span>
                        <button onClick={() => handleDelete(gpu.id)}
                          className="rounded-lg px-2 py-1 text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200">Yes</button>
                        <button onClick={() => setDeleteId(null)}
                          className="rounded-lg px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200">No</button>
                      </div>
                    ) : (
                      <button onClick={() => handleDelete(gpu.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {gpus.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No GPU listings.</div>
        )}

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-400 flex justify-between">
          <span>{filtered.length} of {gpus.length} GPUs</span>
          <span>Range: <span className="font-semibold text-gray-700">
            ${priceMin.toFixed(2)} – ${priceMax.toFixed(2)} / hr
          </span></span>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add GPU' : 'Edit GPU'}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
