import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Play, Square, Trash2, Terminal, BookOpen, Code2, Server, Circle, Zap, HardDrive } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { pods as initialPods, networkVolumes } from '../data/mock'

const addonIcon  = { jupyter: BookOpen, vscode: Code2 }
const addonLabel = { jupyter: 'Jupyter', vscode: 'VS Code' }
const addonPort  = { jupyter: 8888,      vscode: 8080 }

const volById = Object.fromEntries(networkVolumes.map(v => [v.id, v]))

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }
function rw(prev, step, min, max) { return clamp(prev + (Math.random() - 0.5) * step, min, max) }

function initMetrics(pod) {
  const base = pod.costPerHr > 2 ? 80 : pod.costPerHr > 1 ? 65 : 45
  return {
    gpuUtil: clamp(base + (Math.random() - 0.5) * 20, 20, 100),
    gpuMem:  clamp(base - 10 + (Math.random() - 0.5) * 15, 15, 100),
    cpuUtil: clamp(30  + (Math.random() - 0.5) * 20,  5,  90),
    ramUtil: clamp(55  + (Math.random() - 0.5) * 15, 20,  95),
    netIn:   100 + Math.random() * 400,
    netOut:  20  + Math.random() * 150,
    elapsed: 0,
  }
}

function MiniBar({ label, value, color, suffix }) {
  const c = {
    indigo: { bar: 'bg-indigo-500', track: 'bg-gray-200', val: 'text-indigo-600' },
    amber:  { bar: 'bg-amber-400',  track: 'bg-gray-200', val: 'text-amber-600'  },
    red:    { bar: 'bg-red-500',    track: 'bg-gray-200', val: 'text-red-600'    },
    sky:    { bar: 'bg-sky-400',    track: 'bg-sky-100',   val: 'text-sky-600'   },
    gray:   { bar: 'bg-gray-400',   track: 'bg-gray-200', val: 'text-gray-600'   },
  }[color] ?? { bar: 'bg-gray-400', track: 'bg-gray-200', val: 'text-gray-600' }
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 shrink-0 text-xs text-gray-400">{label}</span>
      <div className={`flex-1 h-1.5 rounded-full ${c.track}`}>
        <div className={`h-1.5 rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`w-9 shrink-0 text-right text-xs font-semibold ${c.val}`}>
        {suffix ?? `${value.toFixed(0)}%`}
      </span>
    </div>
  )
}

function Sparkline({ data, color = '#6366f1' }) {
  const W = 72, H = 28
  if (data.length < 2) return <div style={{ width: W, height: H }} />
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`
  ).join(' ')
  return (
    <svg width={W} height={H} className="shrink-0 opacity-80">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Active pod — full card with metric sections
function ActivePodCard({ pod, volumes, metrics, history, vramHistory, onToggle, onTerminate }) {
  const isStarting = pod.status === 'starting'
  const totalVram  = pod.gpuCount * 80
  const usedVram   = metrics ? ((metrics.gpuMem / 100) * totalVram).toFixed(0) : '—'
  const borderTop  = isStarting ? 'border-t-2 border-t-gray-300' : 'border-t-2 border-t-indigo-400'

  return (
    <div className={`card overflow-hidden ${borderTop}`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isStarting ? 'bg-gray-100' : 'bg-indigo-100'}`}>
            <Server size={14} className={isStarting ? 'text-gray-400' : 'text-indigo-600'} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 truncate">{pod.name}</p>
              <StatusBadge status={pod.status} />
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {pod.gpuType}{pod.gpuCount > 1 ? ` ×${pod.gpuCount}` : ''} · {pod.template} · {pod.containerDiskGb} GB
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right ml-3">
          <p className="text-sm font-bold text-gray-900">
            ${pod.costPerHr.toFixed(2)}<span className="text-xs font-normal text-gray-400">/hr</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {pod.uptimeHrs > 0 ? `${pod.uptimeHrs}h uptime` : 'just started'}
          </p>
        </div>
      </div>

      {/* ── Metrics body ── */}
      {metrics ? (
        <div className="mx-4 mb-3 rounded-xl bg-gray-50 px-3 py-3">
          <div className="flex gap-4 items-center">
            {/* Hero GPU % + sparkline */}
            <div className="shrink-0 text-center w-20">
              <p className="text-xs text-gray-400 mb-1">GPU</p>
              <p className="text-3xl font-extrabold text-indigo-700 leading-none">
                {metrics.gpuUtil.toFixed(0)}
                <span className="text-sm font-semibold text-indigo-400">%</span>
              </p>
              <div className="mt-2">
                <Sparkline data={history} color="#6366f1" />
              </div>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-gray-200 shrink-0" />

            {/* Hero VRAM */}
            <div className="shrink-0 text-center w-20">
              <p className="text-xs text-gray-400 mb-1">VRAM</p>
              <p className="text-3xl font-extrabold text-sky-700 leading-none">
                {metrics.gpuMem.toFixed(0)}
                <span className="text-sm font-semibold text-sky-400">%</span>
              </p>
              <div className="mt-2">
                <Sparkline data={vramHistory} color="#38bdf8" />
              </div>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-gray-200 shrink-0" />

            {/* 3 bars — CPU / RAM / Disk */}
            <div className="flex-1 space-y-2">
              <MiniBar label="CPU"  value={metrics.cpuUtil}
                color={metrics.cpuUtil > 85 ? 'red' : metrics.cpuUtil > 65 ? 'amber' : 'indigo'} />
              <MiniBar label="RAM"  value={metrics.ramUtil}
                color={metrics.ramUtil > 85 ? 'red' : metrics.ramUtil > 65 ? 'amber' : 'indigo'} />
              {(() => { const diskPct = (pod.diskUsedGb / pod.containerDiskGb) * 100; return (
                <MiniBar label="Disk" value={diskPct}
                  color={diskPct > 85 ? 'red' : diskPct > 65 ? 'amber' : 'indigo'}
                  suffix={`${pod.diskUsedGb}/${pod.containerDiskGb}G`} />
              ) })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-4 mb-3 rounded-xl bg-gray-50 px-3 py-3">
          <div className="flex gap-4 items-center">
            <div className="shrink-0 text-center w-20">
              <p className="text-xs text-gray-400 mb-1">GPU</p>
              <p className="text-3xl font-extrabold text-gray-400 leading-none">
                0<span className="text-sm font-semibold">%</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-1.5">Starting…</p>
            </div>
            <div className="w-px self-stretch bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-9 shrink-0 text-xs text-gray-400">Disk</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-200">
                  <div className="h-1.5 rounded-full bg-gray-300"
                    style={{ width: `${(pod.diskUsedGb / pod.containerDiskGb) * 100}%` }} />
                </div>
                <span className="w-14 shrink-0 text-right text-xs font-semibold text-gray-500">
                  {pod.diskUsedGb}/{pod.containerDiskGb}G
                </span>
              </div>
              <p className="text-[10px] text-gray-400 text-center pt-0.5">Live metrics will appear shortly</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Network Volumes ── */}
      {volumes && volumes.length > 0 && (
        <div className="mx-4 mb-3 flex items-center flex-wrap gap-1.5">
          <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
            <HardDrive size={11} />
            <span>Storage:</span>
          </div>
          {volumes.map(v => (
            <span key={v.id} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
              {v.name}
              <span className="text-indigo-400 font-normal">
                {v.sizeGb >= 1000 ? `${(v.sizeGb / 1024).toFixed(1)} TB` : `${v.sizeGb} GB`}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50 px-4 py-2">
        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {pod.status === 'running' && (
            <>
              {pod.sshEnabled && (
                <button title="SSH" className="btn-secondary py-1 px-2 text-xs gap-1">
                  <Terminal size={11} /> SSH
                </button>
              )}
              {(pod.addons ?? []).map(id => {
                const Icon = addonIcon[id]
                return Icon ? (
                  <button key={id} title={`${addonLabel[id]} port ${addonPort[id]}`} className="btn-secondary py-1 px-2 text-xs gap-1">
                    <Icon size={11} /> {addonLabel[id]}
                  </button>
                ) : null
              })}
            </>
          )}
          <button
            onClick={() => onToggle(pod.id)}
            disabled={isStarting}
            className={`btn-secondary py-1 px-2.5 text-xs ${isStarting ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <Square size={11} /> Stop
          </button>
          <button
            onClick={() => onTerminate(pod.id)}
            className="inline-flex items-center rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Stopped pod — compact single row
function StoppedPodRow({ pod, volumes, onToggle, onTerminate }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Server size={13} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-600 truncate">{pod.name}</p>
          <StatusBadge status={pod.status} />
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {pod.gpuType} · {pod.template}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400">GPU <span className="font-medium text-gray-500">0%</span></span>
          <span className="text-xs text-gray-400">Disk <span className="font-medium text-gray-500">{pod.diskUsedGb}/{pod.containerDiskGb} GB</span></span>
          {volumes && volumes.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <HardDrive size={10} className="shrink-0" />
              <span className="font-medium text-gray-500">
                {volumes.length} vol · {volumes.reduce((s, v) => s + v.sizeGb, 0).toLocaleString()} GB
              </span>
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 text-xs text-gray-400">${pod.costPerHr.toFixed(2)}/hr</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onToggle(pod.id)}
          className="btn-secondary py-1 px-2.5 text-xs"
        >
          <Play size={11} /> Start
        </button>
        <button
          onClick={() => onTerminate(pod.id)}
          className="inline-flex items-center rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

export default function Pods() {
  const [pods, setPods]           = useState(initialPods)
  const [volumeFilter, setVolumeFilter] = useState(null) // null = All, string = volume id
  const [allMetrics, setAllMetrics] = useState(() =>
    Object.fromEntries(
      initialPods
        .filter(p => p.status === 'running' || p.status === 'starting')
        .map(p => [p.id, initMetrics(p)])
    )
  )
  const [allHistory, setAllHistory] = useState(() =>
    Object.fromEntries(initialPods.map(p => [p.id, { gpu: [], vram: [] }]))
  )

  useEffect(() => {
    const activePods = pods.filter(p => p.status === 'running' || p.status === 'starting')
    if (activePods.length === 0) return
    const id = setInterval(() => {
      setAllMetrics(prev => {
        const next = {}
        for (const pod of activePods) {
          const m = prev[pod.id] ?? initMetrics(pod)
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
        setAllHistory(prevH => {
          const nextH = { ...prevH }
          for (const pod of activePods) {
            const prev = prevH[pod.id] ?? { gpu: [], vram: [] }
            nextH[pod.id] = {
              gpu:  [...prev.gpu.slice(-19),  next[pod.id].gpuUtil],
              vram: [...prev.vram.slice(-19), next[pod.id].gpuMem],
            }
          }
          return nextH
        })
        return next
      })
    }, 1500)
    return () => clearInterval(id)
  }, [pods])

  function togglePod(id) {
    setPods(prev => prev.map(p => {
      if (p.id !== id) return p
      if (p.status === 'running') return { ...p, status: 'stopped', uptimeHrs: 0 }
      if (p.status === 'stopped') return { ...p, status: 'starting' }
      return p
    }))
  }

  function terminatePod(id) {
    if (!window.confirm('Terminate this pod? All unsaved data will be lost.')) return
    setPods(prev => prev.filter(p => p.id !== id))
  }

  // Volume tabs — only volumes that have at least one pod
  const volumesWithPods = networkVolumes.filter(v =>
    pods.some(p => p.networkVolumeIds.includes(v.id))
  )
  const visiblePods  = volumeFilter === null ? pods : pods.filter(p => p.networkVolumeIds.includes(volumeFilter))

  const activePods   = visiblePods.filter(p => p.status === 'running' || p.status === 'starting')
  const stoppedPods  = visiblePods.filter(p => p.status === 'stopped')

  return (
    <div className="space-y-5">

      {/* ── Page title + Actions ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pods</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your GPU compute pods</p>
        </div>
        <Link to="/pods/new" className="btn-primary">
          <Plus size={15} /> New Pod
        </Link>
      </div>

      {/* ── Volume filter tabs ── */}
      {volumesWithPods.length > 0 && (
        <div className="flex gap-1">
          <button
            onClick={() => setVolumeFilter(null)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              volumeFilter === null
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            All
            <span className={`ml-1.5 text-xs ${volumeFilter === null ? 'text-indigo-500' : 'text-gray-400'}`}>
              {pods.length}
            </span>
          </button>
          {volumesWithPods.map(vol => {
            const count = pods.filter(p => p.networkVolumeIds.includes(vol.id)).length
            return (
              <button
                key={vol.id}
                onClick={() => setVolumeFilter(vol.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  volumeFilter === vol.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                }`}
              >
                <HardDrive size={11} className="shrink-0" />
                {vol.name}
                <span className={`text-xs ${volumeFilter === vol.id ? 'text-indigo-500' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Active pods grid ── */}
      {activePods.length > 0 && (
        <div className={`grid gap-4 ${activePods.length === 1 ? 'grid-cols-1 max-w-xl' : 'grid-cols-2'}`}>
          {activePods.map(pod => (
            <ActivePodCard
              key={pod.id}
              pod={pod}
              volumes={(pod.networkVolumeIds ?? []).map(id => volById[id]).filter(Boolean)}
              metrics={allMetrics[pod.id] ?? null}
              history={allHistory[pod.id]?.gpu ?? []}
              vramHistory={allHistory[pod.id]?.vram ?? []}
              onToggle={togglePod}
              onTerminate={terminatePod}
            />
          ))}
        </div>
      )}

      {/* ── Stopped pods list ── */}
      {stoppedPods.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Stopped</p>
          <div className="space-y-1.5">
            {stoppedPods.map(pod => (
              <StoppedPodRow
                key={pod.id}
                pod={pod}
                volumes={(pod.networkVolumeIds ?? []).map(id => volById[id]).filter(Boolean)}
                onToggle={togglePod}
                onTerminate={terminatePod}
              />
            ))}
          </div>
        </div>
      )}

      {pods.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <Zap size={20} className="text-indigo-400" />
          </div>
          <p className="font-medium text-gray-600">No pods yet</p>
          <p className="mt-1 text-sm text-gray-400">Deploy a pod to get started</p>
          <Link to="/pods/new" className="btn-primary mt-4">
            <Plus size={16} /> Deploy your first Pod
          </Link>
        </div>
      )}
    </div>
  )
}
