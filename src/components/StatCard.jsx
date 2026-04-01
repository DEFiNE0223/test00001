export default function StatCard({ icon: Icon, label, value, sub, accent = 'indigo' }) {
  const accents = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    blue:   'bg-blue-50 text-blue-600',
  }
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`rounded-lg p-2.5 ${accents[accent]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}
