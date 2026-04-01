import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Server, Zap } from 'lucide-react'
import { templates } from '../data/mock'

const categories = ['all', 'pytorch', 'tensorflow', 'diffusion', 'llm', 'custom']

const categoryColors = {
  pytorch:    'bg-orange-100 text-orange-700',
  tensorflow: 'bg-yellow-100 text-yellow-700',
  diffusion:  'bg-pink-100 text-pink-700',
  llm:        'bg-violet-100 text-violet-700',
  custom:     'bg-gray-100 text-gray-600',
}

const categoryBgLight = {
  pytorch:    'bg-orange-50',
  tensorflow: 'bg-yellow-50',
  diffusion:  'bg-pink-50',
  llm:        'bg-violet-50',
  custom:     'bg-gray-50',
}

export default function Templates() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = templates.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory
    const matchQ = query === '' || t.name.toLowerCase().includes(query.toLowerCase()) ||
                   t.description.toLowerCase().includes(query.toLowerCase()) ||
                   t.tags.some(tag => tag.includes(query.toLowerCase()))
    return matchCat && matchQ
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Templates</h1>
        <p className="text-sm text-gray-400 mt-0.5">Browse and deploy pre-built container environments</p>
      </div>
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
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

      <p className="text-sm text-gray-500">{filtered.length} templates</p>

      {/* Cards grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(tpl => (
          <div key={tpl.id} className="card flex flex-col overflow-hidden hover:shadow-md transition-shadow">
            {/* Card header color strip */}
            <div className={`h-1.5 ${categoryBgLight[tpl.category] ?? 'bg-gray-50'}`} />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                    <Server size={17} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{tpl.name}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[tpl.category]}`}>
                      {tpl.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 flex-1 text-sm text-gray-500 leading-relaxed">{tpl.description}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {tpl.tags.map(tag => (
                  <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                <span className="text-xs text-gray-400">{tpl.deployCount.toLocaleString()} deploys</span>
                <button
                  onClick={() => navigate('/pods/new')}
                  className="btn-primary py-1.5 text-xs"
                >
                  <Zap size={13} /> Deploy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-400">No templates match your search.</p>
        </div>
      )}
    </div>
  )
}
