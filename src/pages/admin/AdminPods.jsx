import { useState } from 'react'
import { Server, Search } from 'lucide-react'
import { adminPods, allUsers } from '../../data/mock'

const userMap = Object.fromEntries(allUsers.map(u => [u.id, u]))

const enriched = adminPods.map(p => ({
  ...p,
  owner: userMap[p.userId] ?? { name: 'Unknown', email: '' },
}))

const STATUS = {
  running:  { label: 'Running',  dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50'  },
  starting: { label: 'Starting', dot: 'bg-blue-400',    text: 'text-blue-700',    bg: 'bg-blue-50'     },
  stopped:  { label: 'Stopped',  dot: 'bg-gray-400',    text: 'text-gray-600',    bg: 'bg-gray-100'    },
  error:    { label: 'Error',    dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50'      },
}

const STATUS_ORDER = ['running', 'starting', 'stopped', 'error']

const countByStatus = Object.fromEntries(
  STATUS_ORDER.map(s => [s, enriched.filter(p => p.status === s).length])
)

function fmt(hrs) {
  if (hrs === 0) return '—'
  if (hrs < 1) return `${Math.round(hrs * 60)}m`
  if (hrs < 24) return `${hrs.toFixed(1)}h`
  return `${(hrs / 24).toFixed(1)}d`
}

export default function AdminPods() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const visible = enriched.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const q = search.toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.owner.name.toLowerCase().includes(q) || p.region.toLowerCase().includes(q)
    return matchStatus && matchQ
  })

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Pods</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitor all pods across the platform</p>
      </div>

      {/* KPI strip — click to filter */}
      <div className="grid grid-cols-5 gap-4">
        <div onClick={() => setStatusFilter('all')}
          className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${statusFilter === 'all' ? 'ring-2 ring-indigo-400' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Pods</p>
            <div className="rounded-md p-1.5 bg-indigo-50"><Server size={14} className="text-indigo-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{enriched.length}</p>
          <p className="mt-0.5 text-xs text-gray-400">{new Set(enriched.map(p => p.userId)).size} owners</p>
        </div>

        {STATUS_ORDER.map(st => {
          const s = STATUS[st]
          return (
            <div key={st} onClick={() => setStatusFilter(st)}
              className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${statusFilter === st ? 'ring-2 ring-indigo-400' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{s.label}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{countByStatus[st]}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {Math.round((countByStatus[st] / enriched.length) * 100)}% of total
              </p>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">All Pods</h2>
            <p className="text-xs text-gray-400 mt-0.5">{visible.length} pod{visible.length !== 1 ? 's' : ''}</p>
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
              <th className="px-4 py-3 text-left">Pod</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">GPU</th>
              <th className="px-4 py-3 text-right">GPU Util</th>
              <th className="px-4 py-3 text-right">Disk</th>
              <th className="px-4 py-3 text-left">Region</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Uptime</th>
              <th className="px-4 py-3 text-right">$/hr</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map(p => {
              const st = STATUS[p.status] ?? STATUS.stopped
              return (
                <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.status === 'error' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{p.owner.name}</p>
                    <p className="text-xs text-gray-400">{p.owner.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{p.gpuType.replace('NVIDIA ', '')}</p>
                    <p className="text-xs text-gray-400">× {p.gpuCount}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.gpuUtilPct > 0 ? (
                      <span className={`text-xs font-semibold ${p.gpuUtilPct >= 80 ? 'text-amber-600' : p.gpuUtilPct >= 50 ? 'text-indigo-600' : 'text-blue-500'}`}>
                        {p.gpuUtilPct}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-xs font-mono text-gray-700">{p.diskUsedGb} / {p.containerDiskGb} GB</p>
                    <p className="text-xs text-gray-400">{Math.round((p.diskUsedGb / p.containerDiskGb) * 100)}%</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">{p.region}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${st.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />{st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-mono text-gray-600">{fmt(p.uptimeHrs)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">${p.costPerHr.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {p.uptimeHrs > 0
                      ? `$${(p.costPerHr * p.uptimeHrs).toFixed(2)}`
                      : <span className="text-gray-400 font-normal">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No pods match your filter.</div>
        )}

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-400 flex justify-between">
          <span>{visible.length} of {enriched.length} pods</span>
          <span>Running: <span className="font-semibold text-emerald-600">{countByStatus.running}</span></span>
        </div>
      </div>

    </div>
  )
}
