import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  AlertCircle, AlertTriangle, Cpu, Zap, Users, HardDrive,
  TrendingUp, TrendingDown,
  Thermometer, ShieldAlert, UserX, XCircle, CreditCard,
} from 'lucide-react'
import {
  platformStats as ps, revenueHistory, allUsers,
  gpuFleet, networkVolumes, storagePricingByRegion,
} from '../../data/mock'

/* ─── Derived ─────────────────────────────────────────────── */

const totalGpus      = gpuFleet.reduce((s, n) => s + n.total, 0)
const totalGpusInUse = gpuFleet.reduce((s, n) => s + n.inUse, 0)
const utilizationPct = Math.round((totalGpusInUse / totalGpus) * 100)
const totalVolGb     = networkVolumes.reduce((s, v) => s + v.sizeGb, 0)
const TOTAL_CAP_TB   = 1250   // from AdminStorage INITIAL_REGIONS total

// Error events
const now = Date.now()
const errorEvents = [
  { id: 'e1', severity: 'critical', icon: Thermometer,  msg: 'High temperature: node-ro-002',     sub: '83°C — EU-RO-1 · A10G',           ts: now - 7200000  },
  { id: 'e2', severity: 'critical', icon: ShieldAlert,   msg: 'Pod OOM killed: llama-ft-03',        sub: 'Out of memory — A100 80GB × 2',    ts: now - 5400000  },
  { id: 'e3', severity: 'warning',  icon: AlertTriangle, msg: 'Node maintenance: node-ga-002',       sub: 'US-GA-1 · A100 80GB PCIe',         ts: now - 14400000 },
  { id: 'e4', severity: 'warning',  icon: UserX,         msg: 'Account suspended: Maria Garcia',     sub: 'Payment overdue — pods terminated', ts: now - 18000000 },
  { id: 'e5', severity: 'info',     icon: CreditCard,    msg: 'Payment failed: Omar Hassan',         sub: 'Card declined — $50.00 top-up',    ts: now - 32400000 },
  { id: 'e6', severity: 'info',     icon: XCircle,       msg: 'GPU allocation failed: sd-v3-batch',  sub: 'No H100 available in AP-SG-1',     ts: now - 43200000 },
]
const criticalCount = errorEvents.filter(e => e.severity === 'critical').length
const warningCount  = errorEvents.filter(e => e.severity === 'warning').length
const totalErrors   = criticalCount + warningCount

const severityMeta = {
  critical: { dot: 'bg-red-500',   text: 'text-red-600',   bg: 'bg-red-50',   label: 'Critical' },
  warning:  { dot: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Warning'  },
  info:     { dot: 'bg-blue-400',  text: 'text-blue-500',  bg: 'bg-blue-50',  label: 'Info'     },
}

// Revenue
const lastMonthRevenue = revenueHistory[revenueHistory.length - 2].amount
const thisMonthRevenue = revenueHistory[revenueHistory.length - 1].amount
const revDelta         = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)

// User acquisition (mock monthly new-user counts)
const userJoinData = [
  { month: 'Sep', new: 8  },
  { month: 'Oct', new: 12 },
  { month: 'Nov', new: 18 },
  { month: 'Dec', new: 15 },
  { month: 'Jan', new: 22 },
  { month: 'Feb', new: 19 },
  { month: 'Mar', new: ps.newUsersThisMonth },
]

// Storage top5 by region
const storageRanking = Object.entries(
  networkVolumes.reduce((acc, v) => ({ ...acc, [v.region]: (acc[v.region] ?? 0) + v.sizeGb }), {})
).map(([region, gb]) => ({ region, gb }))
  .sort((a, b) => b.gb - a.gb)
  .slice(0, 5)

// GPU top5 by type (inUse)
const gpuRanking = Object.values(
  gpuFleet.reduce((acc, n) => {
    const key = n.gpuType
    if (!acc[key]) acc[key] = { name: n.gpuType.replace('NVIDIA ', ''), inUse: 0, total: 0 }
    acc[key].inUse += n.inUse
    acc[key].total += n.total
    return acc
  }, {})
).map(g => ({ ...g, pct: Math.round((g.inUse / g.total) * 100) }))
  .sort((a, b) => b.inUse - a.inUse)
  .slice(0, 5)

/* ─── Helpers ─────────────────────────────────────────────── */

function timeSince(ts) {
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 60) return `${mins}m ago`
  return `${Math.round(mins / 60)}h ago`
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-indigo-600">${(payload[0].value / 1000).toFixed(0)}K</p>
    </div>
  )
}

function UserTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-violet-600">+{payload[0].value} users</p>
    </div>
  )
}

/* ─── Main ─────────────────────────────────────────────────── */

export default function AdminDashboard() {
  return (
    <div className="flex flex-col flex-1 gap-5">

      {/* ── KPI strip ── */}
      <div className="card p-4">
        <div className="grid grid-cols-5 divide-x divide-gray-100">

          {/* Errors */}
          <div className="pr-5">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle size={13} className={totalErrors > 0 ? 'text-red-500' : 'text-gray-300'} />
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Errors</p>
            </div>
            <p className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-600' : warningCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
              {totalErrors}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {criticalCount > 0 ? `${criticalCount} critical` : warningCount > 0 ? `${warningCount} warning` : 'all clear'}
            </p>
          </div>

          {/* Active Users */}
          <div className="px-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Users size={13} className="text-gray-400" />
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Active Users</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{ps.activeUsers}</p>
            <p className="text-xs text-gray-400 mt-0.5">+{ps.newUsersThisMonth} this month</p>
          </div>

          {/* Active Pods */}
          <div className="px-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={13} className="text-gray-400" />
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Active Pods</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{ps.totalPodsRunning}</p>
            <p className="text-xs text-gray-400 mt-0.5">{allUsers.filter(u => u.activePods > 0).length} users running</p>
          </div>

          {/* GPU Usage */}
          <div className="px-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu size={13} className="text-gray-400" />
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">GPU Usage</p>
            </div>
            <p className={`text-2xl font-bold ${utilizationPct >= 80 ? 'text-indigo-600' : 'text-gray-900'}`}>
              {totalGpusInUse}<span className="text-base font-medium text-gray-400"> / {totalGpus}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{utilizationPct}% utilized</p>
          </div>

          {/* Storage */}
          <div className="pl-5">
            <div className="flex items-center gap-1.5 mb-1">
              <HardDrive size={13} className="text-gray-400" />
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Storage Usage</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(totalVolGb / 1024).toFixed(1)}<span className="text-base font-medium text-gray-400"> / {TOTAL_CAP_TB} TB</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{((totalVolGb / 1024 / TOTAL_CAP_TB) * 100).toFixed(1)}% utilized</p>
          </div>

        </div>
      </div>

      {/* ── Bottom: Error History (left) + 2×2 charts (right) ── */}
      <div className="grid grid-cols-[5fr_8fr] gap-5 items-stretch flex-1">

        {/* Left: Error History */}
        <div className="card overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-semibold text-gray-900">Error History</h2>
              <p className="text-xs text-gray-400 mt-0.5">Recent alerts — last 24h</p>
            </div>
            {totalErrors > 0 && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                {totalErrors} active
              </span>
            )}
          </div>
          <div className="flex-1 divide-y divide-gray-50 overflow-auto">
            {errorEvents.map(ev => {
              const Icon = ev.icon
              const meta = severityMeta[ev.severity]
              return (
                <div key={ev.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                    <Icon size={13} className={meta.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.msg}</p>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.text}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{ev.sub}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400 whitespace-nowrap">{timeSince(ev.ts)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: 2×2 chart grid */}
        <div className="grid grid-cols-2 gap-4">

          {/* User Acquisition */}
          <div className="card p-4 flex flex-col">
            <div className="mb-3 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-semibold text-gray-900">User Acquisition</h2>
                <p className="text-xs text-gray-400 mt-0.5">Monthly new registrations</p>
              </div>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
                +{ps.newUsersThisMonth}
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userJoinData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<UserTooltip />} />
                  <Area type="monotone" dataKey="new" stroke="#8b5cf6" strokeWidth={2}
                    fill="url(#userGrad)" dot={{ r: 2.5, fill: '#8b5cf6', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue */}
          <div className="card p-4 flex flex-col">
            <div className="mb-3 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-semibold text-gray-900">Revenue</h2>
                <p className="text-xs text-gray-400 mt-0.5">Monthly (USD)</p>
              </div>
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                revDelta > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {revDelta > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {revDelta > 0 ? '+' : ''}{revDelta}%
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2}
                    dot={{ r: 2.5, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Storage Top 5 */}
          <div className="card p-4">
            <div className="mb-3">
              <h2 className="font-semibold text-gray-900">Storage Top 5</h2>
              <p className="text-xs text-gray-400 mt-0.5">By region (allocated GB)</p>
            </div>
            <div className="space-y-2.5">
              {storageRanking.map((r, i) => {
                const pct = Math.round((r.gb / storageRanking[0].gb) * 100)
                return (
                  <div key={r.region} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 text-center text-gray-300 font-bold">{i + 1}</span>
                        <span className="font-mono font-semibold text-gray-700">{r.region}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {r.gb >= 1000 ? `${(r.gb / 1024).toFixed(1)} TB` : `${r.gb} GB`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* GPU Top 5 */}
          <div className="card p-4">
            <div className="mb-3">
              <h2 className="font-semibold text-gray-900">GPU Top 5</h2>
              <p className="text-xs text-gray-400 mt-0.5">By type (in-use count)</p>
            </div>
            <div className="space-y-2.5">
              {gpuRanking.map((g, i) => {
                const barColor = g.pct >= 90 ? 'bg-amber-400' : g.pct >= 60 ? 'bg-indigo-500' : 'bg-blue-400'
                return (
                  <div key={g.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-3.5 text-center text-gray-300 font-bold shrink-0">{i + 1}</span>
                        <span className="font-medium text-gray-700 truncate">{g.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-gray-400">{g.inUse}/{g.total}</span>
                        <span className={`font-semibold ${g.pct >= 90 ? 'text-amber-600' : g.pct >= 60 ? 'text-indigo-600' : 'text-blue-500'}`}>
                          {g.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${g.pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
