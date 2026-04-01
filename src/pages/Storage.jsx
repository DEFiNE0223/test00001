import { useState } from 'react'
import { HardDrive, Plus, Trash2, Link, X, Check, MapPin, Server } from 'lucide-react'
import { networkVolumes as initialVolumes, pods, STORAGE_PRICE_PER_GB_MONTH } from '../data/mock'

const REGIONS = ['US-TX-3', 'US-GA-1', 'EU-RO-1', 'EU-SE-1', 'AP-SG-1']
const SIZES   = [50, 100, 200, 500, 1000, 2000]

function getPodName(id)   { return pods.find(p => p.id === id)?.name   ?? id }
function getPodStatus(id) { return pods.find(p => p.id === id)?.status ?? 'unknown' }

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }

// Returns true if this volume has at least one running pod attached
function isActive(vol) {
  return vol.attachedPodIds.some(id => getPodStatus(id) === 'running')
}

function initVolumeMetrics(vol) {
  const active = isActive(vol)
  const usedPct = active
    ? clamp(30 + Math.random() * 50, 20, 90)
    : clamp(10 + Math.random() * 30, 5, 40)
  return { usedPct }
}

const statusDot = {
  running:  'bg-green-500',
  starting: 'bg-yellow-400',
  stopped:  'bg-gray-300',
  unknown:  'bg-gray-200',
}

function VolumeCard({ vol, metrics, onDelete, isConfirming, onConfirmStart, onConfirmCancel }) {
  const costPerMonth   = vol.sizeGb * STORAGE_PRICE_PER_GB_MONTH
  const usedGb         = ((metrics?.usedPct ?? 0) / 100 * vol.sizeGb)
  const freeGb         = vol.sizeGb - usedGb
  const active         = isActive(vol)
  const hasAttached    = vol.attachedPodIds.length > 0
  const usageColor     = (metrics?.usedPct ?? 0) > 85 ? 'bg-red-500'
                       : (metrics?.usedPct ?? 0) > 65 ? 'bg-amber-400'
                       : 'bg-indigo-500'

  return (
    <div className={`card overflow-hidden ${active ? 'border-t-2 border-t-indigo-400' : ''}`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            <HardDrive size={16} className={active ? 'text-indigo-600' : 'text-gray-400'} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{vol.name}</p>
            <p className="mt-0.5 text-xs text-gray-400">{vol.region} · created {vol.createdAt}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-sm">
          <div className="text-right">
            <p className="text-xs text-gray-400">Cost</p>
            <p className="font-semibold text-gray-900">${costPerMonth.toFixed(2)}/mo</p>
          </div>
          {isConfirming ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-red-600">Delete?</span>
              <button onClick={onConfirmStart} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Yes</button>
              <button onClick={onConfirmCancel} className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50">No</button>
            </div>
          ) : (
            <button
              onClick={onConfirmStart}
              disabled={hasAttached}
              title={hasAttached ? 'Detach all pods first' : 'Delete volume'}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── Usage bar ── */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{usedGb.toFixed(0)}</span>
            <span className="text-gray-400"> / {vol.sizeGb} GB</span>
            <span className="ml-2 text-gray-400">({freeGb.toFixed(0)} GB free)</span>
          </span>
          <span className="text-xs font-semibold" style={{ color: (metrics?.usedPct ?? 0) > 85 ? '#ef4444' : (metrics?.usedPct ?? 0) > 65 ? '#f59e0b' : '#6366f1' }}>
            {(metrics?.usedPct ?? 0).toFixed(0)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${usageColor}`}
            style={{ width: `${metrics?.usedPct ?? 0}%` }}
          />
        </div>
      </div>

      {/* ── Attached pods ── */}
      <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 bg-gray-50 px-5 py-2.5">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Server size={11} />
          <span>{hasAttached ? 'Pods:' : 'Not attached to any pod'}</span>
        </div>
        {vol.attachedPodIds.map(podId => {
          const st = getPodStatus(podId)
          return (
            <span key={podId} className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700">
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[st]}`} />
              {getPodName(podId)}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function Storage() {
  const [volumes, setVolumes]           = useState(initialVolumes)
  const [allMetrics, setAllMetrics]     = useState(() =>
    Object.fromEntries(volumes.map(v => [v.id, initVolumeMetrics(v)]))
  )
  const [showCreate, setShowCreate]     = useState(false)
  const [newName, setNewName]           = useState('')
  const [newSize, setNewSize]           = useState(100)
  const [newRegion, setNewRegion]       = useState(REGIONS[0])
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [regionFilter, setRegionFilter]   = useState('All')

  function handleCreate() {
    if (!newName.trim()) return
    const newVol = {
      id: `vol-${Date.now()}`,
      name: newName.trim(),
      sizeGb: newSize,
      region: newRegion,
      attachedPodIds: [],
      status: 'ready',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setVolumes(prev => [...prev, newVol])
    setAllMetrics(prev => ({ ...prev, [newVol.id]: initVolumeMetrics(newVol) }))
    setNewName('')
    setNewSize(100)
    setNewRegion(REGIONS[0])
    setShowCreate(false)
  }

  function handleDelete(id) {
    setVolumes(prev => prev.filter(v => v.id !== id))
    setDeleteConfirm(null)
  }

  const regionTabs      = ['All', ...new Set(volumes.map(v => v.region))]
  const filteredVolumes = regionFilter === 'All' ? volumes : volumes.filter(v => v.region === regionFilter)

  return (
    <div className="space-y-4">

      {/* ── Page title + Actions ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Storage</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your network volumes</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> New Volume
        </button>
      </div>

      {/* ── Region tabs ── */}
      {regionTabs.length > 2 && (
        <div className="flex gap-1">
          {regionTabs.map(tab => {
            const count = tab === 'All' ? volumes.length : volumes.filter(v => v.region === tab).length
            return (
              <button
                key={tab}
                onClick={() => setRegionFilter(tab)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  regionFilter === tab
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                }`}
              >
                {tab !== 'All' && <MapPin size={11} className="shrink-0" />}
                {tab}
                <span className={`text-xs ${regionFilter === tab ? 'text-indigo-500' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Create form ── */}
      {showCreate && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Create Network Volume</h3>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="my-volume"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Region</label>
              <select
                value={newRegion}
                onChange={e => setNewRegion(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              >
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Size: <span className="text-indigo-600 font-semibold">{newSize} GB</span>
                <span className="ml-2 text-gray-400 font-normal">(${(newSize * STORAGE_PRICE_PER_GB_MONTH).toFixed(2)}/mo)</span>
              </label>
              <select
                value={newSize}
                onChange={e => setNewSize(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              >
                {SIZES.map(s => <option key={s} value={s}>{s} GB — ${(s * STORAGE_PRICE_PER_GB_MONTH).toFixed(2)}/mo</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={!newName.trim()} className="btn-primary">
              <Check size={16} /> Create Volume
            </button>
          </div>
        </div>
      )}

      {/* ── Volume cards ── */}
      {filteredVolumes.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <HardDrive size={36} className="mb-3 text-gray-300" />
          {volumes.length === 0
            ? <><p className="text-gray-400">No network volumes yet.</p>
                <p className="mt-1 text-sm text-gray-400">Create a volume to share storage across pods.</p></>
            : <p className="text-gray-400">No volumes in <span className="font-mono font-semibold">{regionFilter}</span>.</p>
          }
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVolumes.map(vol => (
            <VolumeCard
              key={vol.id}
              vol={vol}
              metrics={allMetrics[vol.id] ?? null}
              onDelete={() => handleDelete(vol.id)}
              isConfirming={deleteConfirm === vol.id}
              onConfirmStart={() => setDeleteConfirm(vol.id)}
              onConfirmCancel={() => setDeleteConfirm(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
