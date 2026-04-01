import { useState } from 'react'
import { TrendingUp, Download, ChevronDown, ChevronRight, Server, HardDrive } from 'lucide-react'
import { billingRecords, CONTAINER_DISK_PRICE_PER_GB_MONTH, STORAGE_PRICE_PER_GB_MONTH } from '../data/mock'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function monthLabel(key) {
  const [y, m] = key.split('-')
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`
}

function monthRange(key) {
  const [y, m] = key.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  const short = MONTH_NAMES[m - 1].slice(0, 3)
  return `${short} 1 – ${short} ${lastDay}`
}

// Group by YYYY-MM, sorted newest first
const byMonth = billingRecords.reduce((acc, r) => {
  const key = r.date.slice(0, 7)
  if (!acc[key]) acc[key] = []
  acc[key].push(r)
  return acc
}, {})
const monthKeys = Object.keys(byMonth).sort().reverse()

const thisMonthSpend = (byMonth[monthKeys[0]] ?? []).reduce((s, r) => s + r.costUsd, 0)
const allTimeSpend   = billingRecords.reduce((s, r) => s + r.costUsd, 0)

const STATUS_STYLE = {
  terminated: { label: 'Terminated', cls: 'bg-gray-100 text-gray-500' },
  running:    { label: 'Running',    cls: 'bg-green-100 text-green-700' },
  active:     { label: 'Active',     cls: 'bg-blue-100 text-blue-700'  },
  deleted:    { label: 'Deleted',    cls: 'bg-red-50 text-red-400'     },
}

function CurrentMonthUsage({ monthKey, records }) {
  const podRecords     = records.filter(r => r.type === 'compute').sort((a, b) => b.costUsd - a.costUsd)
  const storageRecords = records.filter(r => r.type === 'storage').sort((a, b) => b.costUsd - a.costUsd)
  const podTotal       = podRecords.reduce((s, r) => s + r.costUsd, 0)
  const storageTotal   = storageRecords.reduce((s, r) => s + r.costUsd, 0)

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold text-gray-900">Current Month Usage</h2>
        <p className="text-xs text-gray-400 mt-0.5">{monthLabel(monthKey)}</p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-100">

        {/* ── Left: Pods ── */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-indigo-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-700">Pods</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-500">
                {podRecords.length}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-base font-bold text-indigo-700">${podTotal.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-2">
            {podRecords.map(r => {
              const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.terminated
              const gpuRate = (r.gpuCostUsd / r.hours).toFixed(2)
              return (
                <div key={r.id} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3.5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {r.gpu}<span className="mx-1 text-gray-300">·</span>${gpuRate}/hr<span className="mx-1 text-gray-300">·</span>{r.hours}h
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Disk {r.containerDiskGb} GB<span className="mx-1 text-gray-300">·</span>${CONTAINER_DISK_PRICE_PER_GB_MONTH}/GB/mo
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-gray-800">${r.costUsd.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right: Storage ── */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive size={14} className="text-sky-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-700">Storage</span>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-500">
                {storageRecords.length}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-base font-bold text-sky-700">${storageTotal.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-2">
            {storageRecords.map(r => {
              const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.active
              return (
                <div key={r.id} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3.5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {r.detail}<span className="mx-1 text-gray-300">·</span>${STORAGE_PRICE_PER_GB_MONTH}/GB/mo<span className="mx-1 text-gray-300">·</span>Monthly
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-gray-800">${r.costUsd.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

function RecordRow({ record }) {
  const gpuRatePerHr = record.type === 'compute' ? (record.gpuCostUsd / record.hours).toFixed(2) : null
  const st = STATUS_STYLE[record.status] ?? STATUS_STYLE.terminated
  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-5 py-3">
        {record.type === 'compute'
          ? <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Compute</span>
          : <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Storage</span>
        }
      </td>
      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{record.name}</td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
      </td>
      <td className="px-4 py-3 text-sm">
        {record.type === 'compute' ? (
          <div className="space-y-0.5">
            <p className="text-gray-800">
              {record.gpu}
              <span className="ml-1.5 text-xs text-gray-400">(${gpuRatePerHr}/hr · {record.hours}h)</span>
            </p>
            <p className="text-gray-400 text-xs">
              Container Disk {record.containerDiskGb} GB
              <span className="ml-1">(${CONTAINER_DISK_PRICE_PER_GB_MONTH}/GB/mo)</span>
            </p>
          </div>
        ) : (
          <p className="text-gray-800 text-sm">
            Network Volume {record.detail}
            <span className="ml-1.5 text-xs text-gray-400">(${STORAGE_PRICE_PER_GB_MONTH}/GB/mo · Monthly)</span>
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
        ${record.costUsd.toFixed(2)}
      </td>
    </tr>
  )
}

function MonthSection({ monthKey, records, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const total     = records.reduce((s, r) => s + r.costUsd, 0)
  const computes  = records.filter(r => r.type === 'compute')
  const storages  = records.filter(r => r.type === 'storage')
  // sort: compute by date desc, then storage
  const sorted = [
    ...computes.sort((a, b) => b.date.localeCompare(a.date)),
    ...storages.sort((a, b) => b.date.localeCompare(a.date)),
  ]

  return (
    <div>
      {/* Month header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {open
            ? <ChevronDown size={14} className="text-gray-400 shrink-0" />
            : <ChevronRight size={14} className="text-gray-400 shrink-0" />
          }
          <span className="font-semibold text-gray-900">{monthLabel(monthKey)}</span>
          <span className="text-xs text-gray-400">{monthRange(monthKey)}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {computes.length} pod{computes.length !== 1 ? 's' : ''} · {storages.length} storage
          </span>
        </div>
        <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
      </button>

      {/* Detail table */}
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-2.5">Type</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Spec</th>
                <th className="px-4 py-2.5 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map(r => <RecordRow key={r.id} record={r} />)}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={4} className="px-5 py-2.5 text-xs font-medium text-gray-500">
                  {monthLabel(monthKey)} subtotal
                </td>
                <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-900">
                  ${total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitor your usage and spending</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">${thisMonthSpend.toFixed(2)}</p>
          <p className="mt-1 text-xs text-gray-400">{monthLabel(monthKeys[0])}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp size={15} />
            <span>20% lower than last month</span>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Spent (all time)</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">${allTimeSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="mt-1 text-xs text-gray-400">since Jan 2026</p>
        </div>
      </div>

      {/* Current Month Usage */}
      <CurrentMonthUsage monthKey={monthKeys[0]} records={byMonth[monthKeys[0]] ?? []} />

      {/* Usage History — monthly accordion */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Usage History</h2>
          <button className="btn-secondary py-1.5 text-xs">
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {monthKeys.map((key, i) => (
            <MonthSection
              key={key}
              monthKey={key}
              records={byMonth[key]}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
