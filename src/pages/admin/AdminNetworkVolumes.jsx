import { useState } from 'react'
import { HardDrive, Search } from 'lucide-react'
import { networkVolumes, allUsers, storagePricingByRegion } from '../../data/mock'

const userMap = Object.fromEntries(allUsers.map(u => [u.id, u]))

const enriched = networkVolumes.map(v => ({
  ...v,
  owner: userMap[v.userId] ?? { name: 'Unknown', email: '' },
  pricePerGbMonth: storagePricingByRegion[v.region] ?? 0.20,
  costPerMonth: v.sizeGb * (storagePricingByRegion[v.region] ?? 0.20),
}))

const totalGb      = enriched.reduce((s, v) => s + v.sizeGb, 0)
const totalRevenue = enriched.reduce((s, v) => s + v.costPerMonth, 0)
const regionCount  = new Set(enriched.map(v => v.region)).size

const STATUS_META = {
  attached: { label: 'Attached', color: 'text-indigo-600', dot: 'bg-indigo-500', bg: 'bg-indigo-50' },
  ready:    { label: 'Ready',    color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
  error:    { label: 'Error',    color: 'text-red-500',     dot: 'bg-red-500',     bg: 'bg-red-50' },
}

const STATUS_ORDER = ['attached', 'ready', 'error']
const activeStatuses = STATUS_ORDER.filter(s => enriched.some(v => v.status === s))

const TODAY = new Date('2026-04-01')
function daysActive(createdAt) {
  return Math.max(0, Math.floor((TODAY - new Date(createdAt)) / 86400000))
}
function fmtDuration(days) {
  if (days < 1)  return '< 1d'
  if (days < 30) return `${days}d`
  const mo = Math.floor(days / 30), rem = days % 30
  return rem > 0 ? `${mo}mo ${rem}d` : `${mo}mo`
}

const countByStatus = Object.fromEntries(
  STATUS_ORDER.map(s => [s, enriched.filter(v => v.status === s).length])
)
const gbByStatus = Object.fromEntries(
  STATUS_ORDER.map(s => [s, enriched.filter(v => v.status === s).reduce((sum, v) => sum + v.sizeGb, 0)])
)

export default function AdminNetworkVolumes() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const visible = enriched.filter(v => {
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    const q = search.toLowerCase()
    const matchQ = !q || v.name.toLowerCase().includes(q) || v.owner.name.toLowerCase().includes(q) || v.region.toLowerCase().includes(q)
    return matchStatus && matchQ
  })
  const visibleGb      = visible.reduce((s, v) => s + v.sizeGb, 0)
  const visibleRevenue = visible.reduce((s, v) => s + v.costPerMonth, 0)

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Network Volumes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitor all network volumes across the platform</p>
      </div>

      {/* KPI strip — click to filter */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Volumes */}
        <div onClick={() => setStatusFilter('all')}
          className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${statusFilter === 'all' ? 'ring-2 ring-indigo-400' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Volumes</p>
            <div className="rounded-md p-1.5 bg-indigo-50"><HardDrive size={14} className="text-indigo-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{enriched.length}</p>
          <p className="mt-0.5 text-xs text-gray-400">{(totalGb / 1024).toFixed(1)} TB · {regionCount} regions</p>
        </div>

        {/* Per-status */}
        {STATUS_ORDER.map(st => {
          const meta = STATUS_META[st]
          return (
            <div key={st} onClick={() => setStatusFilter(st)}
              className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${statusFilter === st ? 'ring-2 ring-indigo-400' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{meta.label}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{countByStatus[st]}</p>
              <p className="mt-0.5 text-xs text-gray-400">{gbByStatus[st].toLocaleString()} GB</p>
            </div>
          )
        })}
      </div>

      {/* Volumes table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">Network Volumes</h2>
            <p className="text-xs text-gray-400 mt-0.5">{visible.length} volume{visible.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, owner, region…"
              className="w-56 rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
              <th className="px-4 py-3 text-left">Volume</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Region</th>
              <th className="px-4 py-3 text-right">Size</th>
              <th className="px-4 py-3 text-center">Attached Pods</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">$/mo</th>
              <th className="px-4 py-3 text-right">Duration</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{v.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{v.id}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-900">{v.owner.name}</p>
                  <p className="text-xs text-gray-400">{v.owner.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">{v.region}</span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {v.sizeGb >= 1000
                    ? `${(v.sizeGb / 1024).toFixed(1)} TB`
                    : `${v.sizeGb} GB`}
                </td>
                <td className="px-4 py-3 text-center">
                  {v.attachedPodIds.length > 0
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                        {v.attachedPodIds.length} pod{v.attachedPodIds.length > 1 ? 's' : ''}
                      </span>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const meta = STATUS_META[v.status] ?? { label: v.status, color: 'text-gray-500', dot: 'bg-gray-400' }
                    return (
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${meta.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}
                      </span>
                    )
                  })()}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  ${v.costPerMonth.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-600">
                  {fmtDuration(daysActive(v.createdAt))}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  ${(v.costPerMonth * daysActive(v.createdAt) / 30).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-100 bg-gray-50">
              <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-700">
                {visible.length} of {enriched.length} volumes
              </td>
              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                {visibleGb.toLocaleString()} GB
              </td>
              <td />
              <td />
              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                ${visibleRevenue.toFixed(2)}
              </td>
              <td />
              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                ${visible.reduce((s, v) => s + v.costPerMonth * daysActive(v.createdAt) / 30, 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  )
}
