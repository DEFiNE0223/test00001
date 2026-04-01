import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  AlertTriangle, Circle, ChevronRight, Clock, Key, Copy, Check,
  Server, HardDrive,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { pods, user, networkVolumes, STORAGE_PRICE_PER_GB_MONTH } from '../data/mock'
import { useAlerts } from '../context/AlertsContext'

// ── Derived data ──────────────────────────────────────────────
const runningPods    = pods.filter(p => p.status === 'running')
const activePods     = pods.filter(p => p.status === 'running' || p.status === 'starting')
const totalCostPerHr = runningPods.reduce((s, p) => s + p.costPerHr, 0)
const totalStorageGb = networkVolumes.reduce((s, v) => s + v.sizeGb, 0)

const recentPods = [...pods].sort((a, b) => {
  const aActive = a.status !== 'stopped' ? 1 : 0
  const bActive = b.status !== 'stopped' ? 1 : 0
  return aActive !== bActive ? bActive - aActive : b.uptimeHrs - a.uptimeHrs
})

// ── Helpers ───────────────────────────────────────────────────
function rw(prev, step, min, max) {
  return Math.min(max, Math.max(min, prev + (Math.random() - 0.5) * step * 2))
}


function fmtUptime(hrs) {
  if (hrs < 1)  return `${Math.round(hrs * 60)}m`
  if (hrs < 24) return `${hrs.toFixed(1)}h`
  return `${(hrs / 24).toFixed(1)}d`
}

function podLastSeen(pod) {
  if (pod.status === 'starting') return `${Math.round(pod.uptimeHrs * 60)}m ago`
  if (pod.status === 'running')  return `${fmtUptime(pod.uptimeHrs)} running`
  return '2 days ago'
}

function timeSince(ts) {
  const secs = Math.round((Date.now() - ts) / 1000)
  if (secs < 60)  return `${secs}s ago`
  const mins = Math.round(secs / 60)
  if (mins < 60)  return `${mins}m ago`
  return `${Math.round(mins / 60)}h ago`
}

const LINE_COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

// ── Components ────────────────────────────────────────────────


function ApiKeyCard() {
  const [copied, setCopied] = useState(false)
  const display = `${user.apiKey.slice(0, 14)}...${user.apiKey.slice(-4)}`

  function handleCopy() {
    navigator.clipboard.writeText(user.apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">API Key</p>
        <div className="rounded-md bg-gray-50 p-1.5"><Key size={14} className="text-gray-500" /></div>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <code className="flex-1 min-w-0 font-mono text-xs text-gray-700 bg-gray-50 rounded-md px-2 py-1.5 truncate">
          {display}
        </code>
        <button
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy API key'}
          className={`shrink-0 rounded-md p-1.5 transition-colors ${
            copied ? 'bg-emerald-50' : 'hover:bg-gray-100'
          }`}
        >
          {copied
            ? <Check size={13} className="text-emerald-500" />
            : <Copy size={13} className="text-gray-400" />
          }
        </button>
      </div>
      {copied && <p className="text-[11px] text-emerald-600 mt-0.5">Copied to clipboard</p>}
    </div>
  )
}

const ALERT_PREVIEW = 4

function AlertHistoryPanel({ alerts }) {
  function alertStyle(type) {
    if (type === 'long') return { border: 'border-l-orange-400', text: 'text-orange-500', icon: Clock }
    return                      { border: 'border-l-amber-400',  text: 'text-amber-500',  icon: AlertTriangle }
  }

  function AlertRow({ alert }) {
    const { border, text, icon: Icon } = alertStyle(alert.type)
    return (
      <div className={`flex items-start gap-2.5 rounded-r-lg bg-gray-50 border-l-2 ${border} pl-2.5 pr-3 py-2`}>
        <Icon size={11} className={`shrink-0 mt-0.5 ${text}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">{alert.podName}</p>
          <p className="text-xs text-gray-500">{alert.msg}</p>
        </div>
        <span className="shrink-0 text-[10px] text-gray-400 whitespace-nowrap">{timeSince(alert.ts)}</span>
      </div>
    )
  }

  return (
    <div className="card p-5 flex flex-col flex-1 min-h-0">
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">Server Alerts</h2>
          {alerts.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{alerts.length} events</p>
          )}
        </div>
        <Link to="/alerts" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
          View all <ChevronRight size={12} />
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2">
          <Circle size={10} className="fill-emerald-500 text-emerald-500" />
          <p className="text-sm text-emerald-600 font-medium">No alerts</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto space-y-1.5">
          {alerts.map(alert => <AlertRow key={alert.id} alert={alert} />)}
        </div>
      )}
    </div>
  )
}

const RANK_TABS = [
  { id: 'gpu',  label: 'GPU %' },
  { id: 'vram', label: 'VRAM'  },
]

function PodRankingPanel({ heatPods }) {
  const [tab, setTab] = useState('gpu')

  const chartPods = heatPods.slice(0, 5)
  const slotKey   = tab === 'vram' ? 'vramSlots' : 'gpuSlots'
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const point = { hour: `${i}h` }
    chartPods.forEach((hp, j) => { point[`p${j}`] = hp[slotKey][i] })
    return point
  })
  const yDomain = [0, 100]
  const yFormat  = v => `${v}%`

  return (
    <div className="card p-5 flex flex-col flex-1 min-h-0">
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">Pod Metrics</h2>
          <p className="text-xs text-gray-400 mt-0.5">24h trend · active pods</p>
        </div>
        <Link to="/pods" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
          Manage <ChevronRight size={12} />
        </Link>
      </div>

      {/* Tab */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mb-3">
        {RANK_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {chartPods.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-gray-400">No active pods</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={148}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#d1d5db' }}
                axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false}
                domain={yDomain} tickFormatter={yFormat} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm text-xs">
                      <p className="text-gray-400 mb-1">{label}</p>
                      {payload.map((entry, i) => (
                        <p key={i} style={{ color: entry.color }}>
                          {chartPods[i]?.name}: {Math.round(entry.value)}%
                        </p>
                      ))}
                    </div>
                  ) : null
                }
                cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              />
              {chartPods.map((hp, i) => (
                <Line key={hp.id} type="monotone" dataKey={`p${i}`}
                  stroke={LINE_COLORS[i]} strokeWidth={1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {chartPods.map((hp, i) => (
              <span key={hp.id} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="h-1.5 w-3 rounded-full inline-block" style={{ background: LINE_COLORS[i] }} />
                {hp.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function RecentServers() {
  return (
    <div className="card p-5 flex flex-col flex-1 min-h-0">
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">Recent Servers</h2>
          <p className="text-xs text-gray-400 mt-0.5">Last used pods</p>
        </div>
        <Link to="/pods" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
          All pods <ChevronRight size={12} />
        </Link>
      </div>
      <div className="flex-1 min-h-0 overflow-auto divide-y divide-gray-100">
        {recentPods.map(pod => (
          <div key={pod.id} className={`flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 ${pod.status === 'stopped' ? 'opacity-60' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-900 truncate">{pod.name}</p>
                <StatusBadge status={pod.status} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {pod.gpuType.replace('NVIDIA ', '')}
                {pod.gpuCount > 1 ? ` ×${pod.gpuCount}` : ''}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {pod.status !== 'stopped'
                ? <p className="text-xs font-semibold text-gray-700">${pod.costPerHr.toFixed(2)}/hr</p>
                : <p className="text-xs text-gray-400">${pod.costPerHr.toFixed(2)}/hr</p>
              }
              <p className="text-[11px] text-gray-400">{podLastSeen(pod)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const { alertHistory, addAlerts } = useAlerts()

  const [heatPods, setHeatPods] = useState(() =>
    activePods.map(pod => ({
      id:        pod.id,
      name:      pod.name,
      gpuSlots:  Array.from({ length: 24 }, () => Math.round(40 + Math.random() * 50)),
      vramSlots: Array.from({ length: 24 }, () => Math.round(30 + Math.random() * 65)),
    }))
  )

  // Track previous alert states to detect transitions
  const prevAlertRef = useRef({})

  // Metric simulation interval
  useEffect(() => {
    const timer = setInterval(() => {
      setHeatPods(prev => prev.map(pod => ({
        ...pod,
        gpuSlots:  pod.gpuSlots.map((v, i)  => i === 23 ? Math.round(rw(v, 10, 0, 100)) : v),
        vramSlots: pod.vramSlots.map((v, i) => i === 23 ? Math.round(rw(v, 8, 0, 100))  : v),
      })))
    }, 1500)
    return () => clearInterval(timer)
  }, [])

  // Alert detection: fire on condition transitions (false → true)
  useEffect(() => {
    const newAlerts = []
    const now = Date.now()

    heatPods.forEach(hp => {
      const isIdle = hp.gpuSlots[23] < 20
      const prev   = prevAlertRef.current[hp.id] || {}

      if (isIdle && !prev.idle) {
        newAlerts.push({
          id: `${hp.id}-idle-${now}`, ts: now,
          podName: hp.name, type: 'idle',
          msg: `GPU idle · ${hp.gpuSlots[23]}%`,
        })
      }
      prevAlertRef.current[hp.id] = { idle: isIdle }
    })

    if (newAlerts.length > 0) addAlerts(newAlerts)
  }, [heatPods])

  // KPI: alert count from current conditions
  const idleCount   = heatPods.filter(hp => hp.gpuSlots[23] < 20).length
  const longCount   = activePods.filter(p => p.uptimeHrs > 48).length
  const alertCount  = idleCount + longCount

  return (
    <div className="flex flex-col flex-1 gap-5">

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-4 gap-4 shrink-0">

        {/* 1. Alerts */}
        <div className="card p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Alerts</p>
            <div className={`rounded-md p-1.5 ${alertCount > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
              <AlertTriangle size={14} className={alertCount > 0 ? 'text-amber-500' : 'text-gray-400'} />
            </div>
          </div>
          <p className={`text-2xl font-bold leading-none ${alertCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
            {alertCount}
          </p>
          {alertCount === 0 ? (
            <p className="text-xs text-gray-400">All systems normal</p>
          ) : (
            <div className="flex flex-col gap-1">
              {idleCount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">GPU Idle</span>
                  <span className="rounded-full bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-600">{idleCount}</span>
                </div>
              )}
              {longCount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Long Running</span>
                  <span className="rounded-full bg-orange-50 px-1.5 py-0.5 font-semibold text-orange-600">{longCount}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Active Pods */}
        <div className="card p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Active Pods</p>
            <div className="rounded-md bg-indigo-50 p-1.5"><Server size={14} className="text-indigo-600" /></div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900">{activePods.length}</p>
            <p className="mb-0.5 text-sm text-gray-400">pods</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Circle size={7} className="fill-green-500 text-green-500" />
            <span>{runningPods.length} running · {pods.filter(p => p.status === 'starting').length} starting</span>
          </div>
        </div>

        {/* 3. Storage Usage */}
        <div className="card p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Storage</p>
            <div className="rounded-md bg-sky-50 p-1.5"><HardDrive size={14} className="text-sky-600" /></div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {totalStorageGb >= 1024
                ? (totalStorageGb / 1024).toFixed(1)
                : totalStorageGb}
            </p>
            <p className="mb-0.5 text-sm text-gray-400">
              {totalStorageGb >= 1024 ? 'TB' : 'GB'}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            {networkVolumes.length} volumes · ${(totalStorageGb * STORAGE_PRICE_PER_GB_MONTH).toFixed(0)}/mo
          </p>
        </div>

        {/* 4. API Key */}
        <ApiKeyCard />

      </div>

      {/* ── Bottom: Alert History (left) + Pod Metrics + Recent Servers (right) ── */}
      <div className="grid grid-cols-[5fr_8fr] gap-5 items-stretch flex-1 min-h-0">
        <AlertHistoryPanel alerts={alertHistory} />
        <div className="flex flex-col gap-4 min-h-0">
          <PodRankingPanel heatPods={heatPods} />
          <RecentServers />
        </div>
      </div>

    </div>
  )
}
