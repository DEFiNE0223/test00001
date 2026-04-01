import { useState } from 'react'
import { Cpu, Thermometer, AlertTriangle, Wrench } from 'lucide-react'
import { gpuFleet } from '../../data/mock'

const STATUS = {
  healthy:     { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  label: 'Healthy'     },
  warning:     { dot: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50',    label: 'Warning'     },
  maintenance: { dot: 'bg-gray-400',    text: 'text-gray-600',    bg: 'bg-gray-100',    label: 'Maintenance' },
  idle:        { dot: 'bg-blue-300',    text: 'text-blue-600',    bg: 'bg-blue-50',     label: 'Idle'        },
}

function UtilBar({ inUse, total }) {
  const pct  = total > 0 ? (inUse / total) * 100 : 0
  const color = pct >= 90 ? 'bg-amber-400' : pct >= 70 ? 'bg-indigo-500' : pct > 0 ? 'bg-blue-400' : 'bg-gray-200'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 shrink-0 text-right text-xs font-semibold text-gray-600">
        {inUse}/{total} <span className="font-normal text-gray-400">GPU</span>
      </span>
    </div>
  )
}

function TempBadge({ temp, status }) {
  if (status === 'maintenance' || status === 'idle') return <span className="text-xs text-gray-400">—</span>
  const color = temp > 80 ? 'text-red-600' : temp > 70 ? 'text-amber-500' : 'text-emerald-600'
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
      <Thermometer size={11} />
      {temp}°C
    </span>
  )
}

// Group nodes by region
const regions = [...new Set(gpuFleet.map(n => n.region))]

export default function AdminGpuFleet() {
  const [statusFilter, setStatusFilter] = useState('all')

  const totalGpus    = gpuFleet.reduce((s, n) => s + n.total, 0)
  const inUseGpus    = gpuFleet.reduce((s, n) => s + n.inUse, 0)
  const utilPct      = Math.round((inUseGpus / totalGpus) * 100)
  const gpusByStatus = Object.fromEntries(
    Object.keys(STATUS).map(s => [s, gpuFleet.filter(n => n.status === s).reduce((sum, n) => sum + n.total, 0)])
  )
  const nodesByStatus = Object.fromEntries(
    Object.keys(STATUS).map(s => [s, gpuFleet.filter(n => n.status === s).length])
  )

  const visibleNodes   = statusFilter === 'all' ? gpuFleet : gpuFleet.filter(n => n.status === statusFilter)
  const visibleRegions = [...new Set(visibleNodes.map(n => n.region))]

  return (
    <div className="space-y-5">

      {/* Summary strip — click to filter */}
      <div className="grid grid-cols-5 gap-4">
        {/* Total GPUs */}
        <div onClick={() => setStatusFilter('all')}
          className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${statusFilter === 'all' ? 'ring-2 ring-indigo-400' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total GPUs</p>
            <div className="rounded-md p-1.5 bg-indigo-50"><Cpu size={14} className="text-indigo-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalGpus}</p>
          <p className="mt-0.5 text-xs text-gray-400">{inUseGpus} in use · {utilPct}%</p>
        </div>

        {/* Per-status GPU counts */}
        {Object.entries(STATUS).map(([key, s]) => (
          <div key={key} onClick={() => setStatusFilter(key)}
            className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${statusFilter === key ? 'ring-2 ring-indigo-400' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{s.label}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{gpusByStatus[key]}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {nodesByStatus[key]} node{nodesByStatus[key] !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>

      {/* Nodes by region */}
      {visibleRegions.map(region => {
        const nodes = visibleNodes.filter(n => n.region === region)
        const regionUtil = Math.round(
          nodes.reduce((s, n) => s + n.inUse, 0) /
          Math.max(1, nodes.reduce((s, n) => s + n.total, 0)) * 100
        )
        return (
          <div key={region} className="card overflow-hidden">
            {/* Region header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{region}</span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {nodes.length} node{nodes.length > 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Utilization <span className="font-semibold text-gray-800">{regionUtil}%</span>
              </span>
            </div>

            {/* Node rows */}
            <div className="divide-y divide-gray-100">
              {nodes.map(node => {
                const st = STATUS[node.status]
                return (
                  <div key={node.id} className={`flex items-center gap-5 px-5 py-3.5 ${
                    node.status === 'warning' ? 'bg-amber-50/40' :
                    node.status === 'maintenance' ? 'bg-gray-50' : ''
                  }`}>
                    {/* Status dot + node id */}
                    <div className="flex items-center gap-2 w-36 shrink-0">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${st.dot}`} />
                      <span className="text-xs font-mono text-gray-500 truncate">{node.id}</span>
                    </div>

                    {/* GPU type */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {node.gpuType.replace('NVIDIA ', '')}
                      </p>
                    </div>

                    {/* Utilization bar */}
                    <div className="w-48 shrink-0">
                      <UtilBar inUse={node.inUse} total={node.total} />
                    </div>

                    {/* Temp */}
                    <div className="w-16 shrink-0 text-right">
                      <TempBadge temp={node.temp} status={node.status} />
                    </div>

                    {/* Status badge */}
                    <div className="w-24 shrink-0 text-right">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${st.bg} ${st.text}`}>
                        {node.status === 'warning'     && <AlertTriangle size={9} />}
                        {node.status === 'maintenance' && <Wrench size={9} />}
                        {st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
