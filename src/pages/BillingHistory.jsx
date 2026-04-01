import { Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { billingRecords, monthlySpend } from '../data/mock'

const total     = billingRecords.reduce((s, r) => s + r.costUsd, 0)
const thisMonth = billingRecords.reduce((s, r) => s + r.costUsd, 0)

export default function BillingHistory() {
  return (
    <div className="space-y-5">

      {/* Monthly spend chart */}
      <div className="card p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Monthly Spend</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlySpend} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${v}`} />
            <Tooltip
              formatter={(value) => [`$${value}`, 'Spend']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Usage history table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Usage History</h2>
            <p className="text-xs text-gray-400 mt-0.5">{billingRecords.length} records</p>
          </div>
          <button className="btn-secondary py-1.5 text-xs">
            <Download size={13} /> Export CSV
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Detail</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {billingRecords.map(record => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 text-gray-500">{record.date}</td>
                <td className="px-4 py-3.5">
                  {record.type === 'compute'
                    ? <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Compute</span>
                    : <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Storage</span>
                  }
                </td>
                <td className="px-4 py-3.5 font-medium text-gray-900">{record.name}</td>
                <td className="px-4 py-3.5 text-gray-600">{record.detail}</td>
                <td className="px-4 py-3.5 text-gray-600">
                  {record.hours != null ? `${record.hours}h` : 'Monthly'}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                  ${record.costUsd.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-100 bg-gray-50">
              <td colSpan={5} className="px-5 py-3 text-sm font-medium text-gray-700">Total</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                ${total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  )
}
