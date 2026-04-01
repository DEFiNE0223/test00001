import { useState } from 'react'
import { Search, UserX, ChevronUp, ChevronDown, Users } from 'lucide-react'
import { allUsers } from '../../data/mock'

const USER_STATUS = {
  active:    { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Active'    },
  suspended: { dot: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50',     label: 'Suspended' },
}

export default function AdminUsers() {
  const [search, setSearch]           = useState('')
  const [sortKey, setSortKey]         = useState('totalSpend')
  const [sortAsc, setSortAsc]         = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  function toggleSort(key) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const filtered = allUsers
    .filter(u => {
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      const q = search.toLowerCase()
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      return matchStatus && matchQ
    })
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      return sortAsc
        ? (typeof av === 'string' ? av.localeCompare(bv) : av - bv)
        : (typeof bv === 'string' ? bv.localeCompare(av) : bv - av)
    })

  const countByStatus = Object.fromEntries(
    Object.keys(USER_STATUS).map(s => [s, allUsers.filter(u => u.status === s).length])
  )

  function SortIcon({ k }) {
    if (sortKey !== k) return <span className="ml-1 text-gray-300">↕</span>
    return sortAsc
      ? <ChevronUp size={12} className="ml-1 inline text-indigo-600" />
      : <ChevronDown size={12} className="ml-1 inline text-indigo-600" />
  }

  return (
    <div className="space-y-4">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage platform accounts and access</p>
      </div>

      {/* Summary strip — click to filter */}
      <div className="grid grid-cols-3 gap-4">
        <div onClick={() => setStatusFilter('all')}
          className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${statusFilter === 'all' ? 'ring-2 ring-indigo-400' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Users</p>
            <div className="rounded-md p-1.5 bg-indigo-50"><Users size={14} className="text-indigo-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
          <p className="mt-0.5 text-xs text-gray-400">{allUsers.filter(u => u.activePods > 0).length} with active pods</p>
        </div>

        {Object.entries(USER_STATUS).map(([key, s]) => (
          <div key={key} onClick={() => setStatusFilter(key)}
            className={`card p-4 cursor-pointer transition-all hover:shadow-sm ${statusFilter === key ? 'ring-2 ring-indigo-400' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{s.label}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{countByStatus[key]}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {Math.round((countByStatus[key] / allUsers.length) * 100)}% of total
            </p>
          </div>
        ))}
      </div>

      {/* Alerts */}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">Users</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="w-56 rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
              <th className="px-4 py-3 text-left font-medium">User</th>

              <th className="px-4 py-3 text-right font-medium">Active Pods</th>
              <th className="px-4 py-3 text-right font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort('totalSpend')}>
                Total Spend <SortIcon k="totalSpend" />
              </th>
              <th className="px-4 py-3 text-left font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort('joined')}>
                Joined <SortIcon k="joined" />
              </th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => {
              return (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {u.activePods > 0
                      ? <span className="font-semibold text-indigo-600">{u.activePods}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ${u.totalSpend.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.joined}</td>
                  <td className="px-4 py-3">
                    {u.status === 'suspended' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                        <UserX size={11} /> Suspended
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No users match your search.</div>
        )}

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-400 flex items-center justify-between">
          <span>{filtered.length} of {allUsers.length} users</span>
          <span>Total spend: <span className="font-semibold text-gray-700">
            ${filtered.reduce((s, u) => s + u.totalSpend, 0).toLocaleString()}
          </span></span>
        </div>
      </div>
    </div>
  )
}
