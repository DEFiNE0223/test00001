import { useState, useEffect } from 'react'
import { Activity, Wifi, DollarSign, Server, Circle } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { pods } from '../data/mock'

const activePods = pods.filter(p => p.status === 'running' || p.status === 'starting')

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }
function rw(prev, step, min, max) { return clamp(prev + (Math.random() - 0.5) * step, min, max) }

function initMetrics(pod) {
  // Each pod gets slightly different baseline based on its workload
  const base = pod.costPerHr > 2 ? 80 : pod.costPerHr > 1 ? 65 : 45
  return {
    gpuUtil: clamp(base + (Math.random() - 0.5) * 20, 20, 100),
    gpuMem:  clamp(base - 10 + (Math.random() - 0.5) * 15, 15, 100),
    cpuUtil: clamp(30 + (Math.random() - 0.5) * 20, 5, 90),
    ramUtil: clamp(55 + (Math.random() - 0.5) * 15, 20, 95),
    netIn:   100 + Math.random() * 400,
    netOut:  20 + Math.random() * 150,
    elapsed: 0,
  }
}

// Compact horizontal bar
function MiniBar({ value, color, label }) {
  const bars = {
    indigo: { bar: 'bg-indigo-500', track: 'bg-indigo-100', text: 'text-indigo-600' },
    blue:   { bar: 'bg-blue-500',   track: 'bg-blue-100',   text: 'text-blue-600' },
    green:  { bar: 'bg-green-500',  track: 'bg-green-100',  text: 'text-green-600' },
    amber:  { bar: 'bg-amber-400',  track: 'bg-amber-100',  text: 'text-amber-600' },
  }
  const c = bars[color]
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-gray-500">{label}</span>
      <div className={`flex-1 h-1.5 rounded-full ${c.track}`}>
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${c.bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`w-10 shrink-0 text-right text-xs font-semibold ${c.text}`}>
        {value.toFixed(0)}%
      </span>
    </div>
  )
}

// Sparkline SVG
function Sparkline({ data, color = '#6366f1' }) {
  const W = 80, H = 24
  if (data.length < 2) return <div style={{ width: W, height: H }} />
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 2) - 1}`
  ).join(' ')
  return (
    <svg width={W} height={H}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} opacity={0.7} />
    </svg>
  )
}

function PodCard({ pod, metrics, history }) {
  const totalVram = pod.gpuCount * 80  // assume 80GB per card
  const usedVram = ((metrics.gpuMem / 100) * totalVram).toFixed(1)
  const accrued = pod.costPerHr * (pod.uptimeHrs + metrics.elapsed / 3600)

  return (
    <div className="card p-4 flex flex-col gap-3">
      {/* Card header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
            <Server size={15} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-none">{pod.name}</p>
            <p className="mt-0.5 text-xs text-gray-400">{pod.gpuType} · ×{pod.gpuCount}</p>
          </div>
        </div>
        <StatusBadge status={pod.status} />
      </div>

      {/* GPU Util with sparkline */}
      <div className="flex items-center justify-between gap-3 rounded-lg bg-indigo-50 px-3 py-2">
        <div className="flex-1">
          <p className="text-xs text-indigo-500 mb-1">GPU Compute</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-indigo-700">{metrics.gpuUtil.toFixed(0)}</span>
            <span className="text-sm text-indigo-400">%</span>
          </div>
        </div>
        <Sparkline data={history} color="#6366f1" />
      </div>

      {/* Metric bars */}
      <div className="space-y-2">
        <MiniBar value={metrics.gpuMem}  color="blue"   label={`VRAM ${usedVram}/${totalVram}G`} />
        <MiniBar value={metrics.cpuUtil} color="green"  label={`CPU ${pod.vcpu}vCPU`} />
        <MiniBar value={metrics.ramUtil} color="amber"  label={`RAM ${pod.ram}GB`} />
      </div>

      {/* Bottom stats row */}
      <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs">
        <div>
          <p className="text-gray-400">Net In/Out</p>
          <p className="font-semibold text-gray-700">
            {metrics.netIn.toFixed(0)}<span className="text-gray-400">↓</span>{' '}
            {metrics.netOut.toFixed(0)}<span className="text-gray-400">↑</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-400">Accrued</p>
          <p className="font-semibold text-gray-700">${accrued.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

export default function Monitor() {
  const [allMetrics, setAllMetrics] = useState(() =>
    Object.fromEntries(activePods.map(p => [p.id, initMetrics(p)]))
  )
  const [allHistory, setAllHistory] = useState(() =>
    Object.fromEntries(activePods.map(p => [p.id, []]))
  )

  // Single interval — ticks all pods together
  useEffect(() => {
    if (activePods.length === 0) return
    const id = setInterval(() => {
      setAllMetrics(prev => {
        const next = {}
        for (const pod of activePods) {
          const m = prev[pod.id]
          next[pod.id] = {
            gpuUtil: rw(m.gpuUtil, 8, 20, 100),
            gpuMem:  rw(m.gpuMem,  3, 10, 100),
            cpuUtil: rw(m.cpuUtil, 6,  5,  95),
            ramUtil: rw(m.ramUtil, 3, 20,  95),
            netIn:   Math.abs(rw(m.netIn,  80, 10, 800)),
            netOut:  Math.abs(rw(m.netOut, 40,  5, 400)),
            elapsed: m.elapsed + 1.5,
          }
        }
        return next
      })
      setAllHistory(prev => {
        const next = {}
        for (const pod of activePods) {
          next[pod.id] = [...(prev[pod.id] ?? []).slice(-19),
            allMetrics[pod.id]?.gpuUtil ?? 50]
        }
        return next
      })
    }, 1500)
    return () => clearInterval(id)
  }, [])

  if (activePods.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-24 text-center">
        <Activity size={36} className="mb-3 text-gray-300" />
        <p className="text-gray-400">No running pods to monitor.</p>
        <p className="mt-1 text-sm text-gray-400">Start a pod to see live metrics.</p>
      </div>
    )
  }

  // Aggregate stats
  const totalCost = activePods.reduce((s, p) => s + p.costPerHr, 0)
  const totalGpus  = activePods.reduce((s, p) => s + p.gpuCount, 0)
  const avgGpuUtil = activePods.reduce((s, p) =>
    s + (allMetrics[p.id]?.gpuUtil ?? 0), 0) / activePods.length

  const cols = activePods.length === 1 ? 'grid-cols-1 max-w-lg' :
               activePods.length <= 2 ? 'grid-cols-2' :
               activePods.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className="space-y-4">
      {/* Fleet summary bar */}
      <div className="card px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Circle size={8} className="fill-green-500 text-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-900">
              {activePods.length} pod{activePods.length > 1 ? 's' : ''} running
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{totalGpus}</span> total GPUs
          </div>
          <div className="text-sm text-gray-500">
            Avg GPU util{' '}
            <span className="font-semibold text-indigo-600">{avgGpuUtil.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <DollarSign size={13} />
            <span className="font-semibold text-gray-900">${totalCost.toFixed(2)}/hr</span>
            <span>total</span>
          </div>
        </div>
        <span className="text-xs text-gray-400">Live · 1.5s refresh</span>
      </div>

      {/* Pod cards grid */}
      <div className={`grid gap-4 ${cols}`}>
        {activePods.map(pod => (
          <PodCard
            key={pod.id}
            pod={pod}
            metrics={allMetrics[pod.id] ?? initMetrics(pod)}
            history={allHistory[pod.id] ?? []}
          />
        ))}
      </div>
    </div>
  )
}
