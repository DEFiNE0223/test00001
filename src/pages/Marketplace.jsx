import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Zap, Server, Cpu } from 'lucide-react'
import { templates, gpuOptions } from '../data/mock'

/* ─── GPU catalog ─────────────────────────────────────────── */

const tierMeta = {
  premium: { label: 'Premium',  color: 'bg-violet-100 text-violet-700', bar: 'bg-violet-500' },
  high:    { label: 'High-End', color: 'bg-indigo-100 text-indigo-700', bar: 'bg-indigo-500' },
  mid:     { label: 'Mid-Range',color: 'bg-blue-100  text-blue-700',    bar: 'bg-blue-400'   },
  entry:   { label: 'Entry',    color: 'bg-gray-100  text-gray-600',    bar: 'bg-gray-400'   },
}

function GpuCard({ gpu, onDeploy }) {
  const meta = tierMeta[gpu.tier] ?? tierMeta.entry
  return (
    <div className="card flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1 ${meta.bar}`} />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-snug">{gpu.name}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.color}`}>
              {meta.label}
            </span>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-gray-900">${gpu.costPerHr.toFixed(2)}</p>
            <p className="text-[11px] text-gray-400">/ hr</p>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'VRAM', value: `${gpu.vram}GB` },
            { label: 'vCPU', value: gpu.vcpu },
            { label: 'RAM',  value: `${gpu.ram}GB` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-gray-50 py-2">
              <p className="text-xs font-semibold text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </dl>

        <p className="text-[11px] text-gray-400">Up to {gpu.maxCount}× per pod</p>

        <button onClick={() => onDeploy(gpu)} className="btn-primary mt-auto py-2 text-xs w-full justify-center">
          <Zap size={12} /> Deploy Pod
        </button>
      </div>
    </div>
  )
}

/* ─── Template catalog ────────────────────────────────────── */

const categories = ['all', 'pytorch', 'tensorflow', 'diffusion', 'llm', 'custom']

const categoryColors = {
  pytorch:    'bg-orange-100 text-orange-700',
  tensorflow: 'bg-yellow-100 text-yellow-700',
  diffusion:  'bg-pink-100   text-pink-700',
  llm:        'bg-violet-100 text-violet-700',
  custom:     'bg-gray-100   text-gray-600',
}

const categoryBar = {
  pytorch:    'bg-orange-400',
  tensorflow: 'bg-yellow-400',
  diffusion:  'bg-pink-400',
  llm:        'bg-violet-500',
  custom:     'bg-gray-300',
}

function TemplateCard({ tpl, onDeploy }) {
  return (
    <div className="card flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1 ${categoryBar[tpl.category] ?? 'bg-gray-300'}`} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
            <Server size={16} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 leading-tight">{tpl.name}</p>
            <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${categoryColors[tpl.category]}`}>
              {tpl.category}
            </span>
          </div>
        </div>

        <p className="mt-3 flex-1 text-sm text-gray-500 leading-relaxed">{tpl.description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tpl.tags.map(tag => (
            <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{tag}</span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
          <span className="text-xs text-gray-400">{tpl.deployCount.toLocaleString()} deploys</span>
          <button onClick={() => onDeploy(tpl)} className="btn-primary py-1.5 text-xs">
            <Zap size={12} /> Deploy
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────── */

const TABS = [
  { id: 'gpu',       label: 'GPU Catalog',    icon: Cpu    },
  { id: 'templates', label: 'Templates',       icon: Server },
]

export default function Marketplace() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('gpu')
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')

  const filteredTemplates = templates.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory
    const matchQ   = query === '' ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.tags.some(tag => tag.includes(query.toLowerCase()))
    return matchCat && matchQ
  })

  function handleDeployGpu(gpu) {
    navigate('/pods/new')
  }
  function handleDeployTemplate(tpl) {
    navigate('/pods/new')
  }

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400 mb-1">neurostack marketplace</p>
        <h2 className="text-xl font-bold text-gray-900">GPU & Templates</h2>
        <p className="mt-1 text-sm text-gray-500">Browse available GPU hardware and pre-built container templates. Deploy in seconds.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-100 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === id
                ? 'border-indigo-500 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* GPU Catalog */}
      {tab === 'gpu' && (
        <div className="grid grid-cols-3 gap-4">
          {gpuOptions.map(gpu => (
            <GpuCard key={gpu.id} gpu={gpu} onDeploy={handleDeployGpu} />
          ))}
        </div>
      )}

      {/* Template Catalog */}
      {tab === 'templates' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search templates…"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-400">{filteredTemplates.length} templates</p>

          <div className="grid grid-cols-3 gap-4">
            {filteredTemplates.map(tpl => (
              <TemplateCard key={tpl.id} tpl={tpl} onDeploy={handleDeployTemplate} />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-gray-400">No templates match your search.</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
