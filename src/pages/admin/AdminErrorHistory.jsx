import { useState } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import { systemErrors } from '../../data/mock'

const SEVERITY = {
  critical: { label: 'Critical', dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700'    },
  warning:  { label: 'Warning',  dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700'  },
  info:     { label: 'Info',     dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700'    },
}

const ERROR_TYPE = {
  pod_failed:   'Pod Failure',
  gpu_error:    'GPU Error',
  volume_error: 'Volume Error',
  node_offline: 'Node Offline',
}

const countBySeverity = Object.fromEntries(
  Object.keys(SEVERITY).map(s => [s, systemErrors.filter(e => e.severity === s).length])
)

export default function AdminErrorHistory() {
  const [search, setSearch]             = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')

  const filtered = systemErrors.filter(e => {
    const matchSev = severityFilter === 'all' || e.severity === severityFilter
    const q = search.toLowerCase()
    const matchQ = !q || e.source.toLowerCase().includes(q) || e.message.toLowerCase().includes(q) || e.region.toLowerCase().includes(q)
    return matchSev && matchQ
  })

  return (
    <div className="space-y-4">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Error History</h1>
        <p className="text-sm text-gray-400 mt-0.5">Review past incidents and platform errors</p>
      </div>

      {/* KPI strip — click to filter */}
      <div className="grid grid-cols-4 gap-4">
        <div onClick={() => setSeverityFilter('all')}
          className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${severityFilter === 'all' ? 'ring-2 ring-indigo-400' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Errors</p>
            <div className="rounded-md p-1.5 bg-gray-100"><AlertTriangle size={14} className="text-gray-500" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{systemErrors.length}</p>
          <p className="mt-0.5 text-xs text-gray-400">last 7 days</p>
        </div>

        {Object.entries(SEVERITY).map(([key, s]) => (
          <div key={key} onClick={() => setSeverityFilter(key)}
            className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${severityFilter === key ? 'ring-2 ring-indigo-400' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{s.label}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{countBySeverity[key]}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {Math.round((countBySeverity[key] / systemErrors.length) * 100)}% of total
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search source, region, message…"
            className="w-72 rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <span className="text-xs text-gray-400">{filtered.length} events</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
              <th className="px-4 py-3 text-left">Timestamp</th>
              <th className="px-4 py-3 text-left">Severity</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Region</th>
              <th className="px-4 py-3 text-left">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(e => {
              const sev = SEVERITY[e.severity] ?? SEVERITY.info
              return (
                <tr key={e.id} className={`hover:bg-gray-50 transition-colors ${e.severity === 'critical' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{e.ts}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sev.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                      {sev.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {ERROR_TYPE[e.type] ?? e.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{e.source}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">{e.region}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{e.message}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No errors match your filter.</div>
        )}

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-400 flex justify-between">
          <span>{filtered.length} of {systemErrors.length} events</span>
          <span>Critical: <span className="font-semibold text-red-600">{countBySeverity.critical}</span></span>
        </div>
      </div>

    </div>
  )
}
