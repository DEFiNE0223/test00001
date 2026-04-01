const config = {
  running:  { dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  label: 'Running' },
  stopped:  { dot: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200',   label: 'Stopped' },
  starting: { dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  label: 'Starting' },
  terminated:{ dot: 'bg-red-400',   text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'Terminated' },
}

export default function StatusBadge({ status }) {
  const c = config[status] ?? config.stopped
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.border} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} ${status === 'running' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  )
}
