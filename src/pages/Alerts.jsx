import { useAlerts } from '../context/AlertsContext'
import { AlertTriangle, Clock, Circle } from 'lucide-react'

function timeSince(ts) {
  const secs = Math.round((Date.now() - ts) / 1000)
  if (secs < 60)  return `${secs}s ago`
  const mins = Math.round(secs / 60)
  if (mins < 60)  return `${mins}m ago`
  return `${Math.round(mins / 60)}h ago`
}

function alertMeta(type) {
  if (type === 'long') return { border: 'border-l-orange-400', text: 'text-orange-500', icon: Clock,         label: 'Long Running' }
  return                      { border: 'border-l-amber-400',  text: 'text-amber-500',  icon: AlertTriangle, label: 'GPU Idle' }
}

const TYPE_LABELS = { idle: 'GPU Idle', long: 'Long Running' }

export default function AlertsPage() {
  const { alertHistory } = useAlerts()

  const counts = alertHistory.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Alerts</h1>
        <p className="text-sm text-gray-400 mt-0.5">Real-time notifications from your pods</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{alertHistory.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">GPU Idle</p>
          <p className="text-2xl font-bold text-amber-600">{counts.idle ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Long Running</p>
          <p className="text-2xl font-bold text-orange-600">{counts.long ?? 0}</p>
        </div>
      </div>

      {/* List */}
      {alertHistory.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-3">
          <Circle size={12} className="fill-emerald-500 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-600">No alerts</p>
          <p className="text-xs text-gray-400">All systems are operating normally.</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {alertHistory.map(alert => {
            const { border, text, icon: Icon, label } = alertMeta(alert.type)
            return (
              <div key={alert.id} className={`flex items-center gap-3 border-l-2 ${border} pl-4 pr-5 py-3 bg-gray-50 first:rounded-t-xl last:rounded-b-xl`}>
                <Icon size={14} className={`shrink-0 ${text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 truncate">{alert.podName}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 ${text}`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{alert.msg}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{timeSince(alert.ts)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
