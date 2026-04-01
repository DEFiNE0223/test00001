import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Search, Server } from 'lucide-react'
import { templates as initialTemplates } from '../../data/mock'

const CATEGORIES = ['pytorch', 'tensorflow', 'diffusion', 'llm', 'custom']

const categoryColors = {
  pytorch:    'bg-orange-100 text-orange-700',
  tensorflow: 'bg-yellow-100 text-yellow-700',
  diffusion:  'bg-pink-100   text-pink-700',
  llm:        'bg-violet-100 text-violet-700',
  custom:     'bg-gray-100   text-gray-600',
}

const EMPTY_FORM = { name: '', category: 'pytorch', image: '', description: '', tags: '' }

function Modal({ title, form, setForm, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Template Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input w-full" placeholder="e.g. PyTorch 2.2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input w-full">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Docker Image</label>
            <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              className="input w-full font-mono text-xs" placeholder="registry/image:tag" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="input w-full resize-none" placeholder="Short description…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className="input w-full" placeholder="pytorch, cuda, training" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary text-sm py-2">Cancel</button>
          <button onClick={onSave} disabled={!form.name.trim() || !form.image.trim()}
            className="btn-primary text-sm py-2 disabled:opacity-40">Save Template</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState(() =>
    initialTemplates.map(t => ({ ...t, tags: Array.isArray(t.tags) ? t.tags : [] }))
  )
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('all')
  const [modal, setModal]           = useState(null) // null | 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [deleteId, setDeleteId]     = useState(null)

  const filtered = templates.filter(t => {
    const matchCat = catFilter === 'all' || t.category === catFilter
    const q = search.toLowerCase()
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    return matchCat && matchQ
  })

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setModal('add')
  }

  function openEdit(tpl) {
    setForm({ name: tpl.name, category: tpl.category, image: tpl.image, description: tpl.description, tags: Array.isArray(tpl.tags) ? tpl.tags.join(', ') : tpl.tags })
    setEditTarget(tpl.id)
    setModal('edit')
  }

  function handleSave() {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    if (modal === 'add') {
      setTemplates(prev => [...prev, {
        id: `tpl-${Date.now()}`, ...form, tags,
        deployCount: 0,
      }])
    } else {
      setTemplates(prev => prev.map(t => t.id === editTarget ? { ...t, ...form, tags } : t))
    }
    setModal(null)
  }

  function handleDelete(id) {
    if (deleteId === id) {
      setTemplates(prev => prev.filter(t => t.id !== id))
      setDeleteId(null)
    } else {
      setDeleteId(id)
    }
  }

  const totalDeploys = templates.reduce((s, t) => s + t.deployCount, 0)

  return (
    <div className="space-y-4">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Templates</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage deployable container templates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Templates</p>
          <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {CATEGORIES.map(c => {
              const cnt = templates.filter(t => t.category === c).length
              return cnt > 0 ? (
                <span key={c} className="mr-2">
                  <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${categoryColors[c]}`}>{c}</span>
                  <span className="ml-1 text-gray-500">{cnt}</span>
                </span>
              ) : null
            })}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Total Deploys</p>
          <p className="text-2xl font-bold text-gray-900">{totalDeploys.toLocaleString()}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            avg <span className="font-semibold text-gray-600">{Math.round(totalDeploys / templates.length).toLocaleString()}</span> per template
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {['all', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              catFilter === c ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >{c}</button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-52 rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button onClick={openAdd} className="btn-primary text-xs py-2">
          <Plus size={13} /> Add Template
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
              <th className="px-4 py-3 text-left">Template</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Docker Image</th>
              <th className="px-4 py-3 text-left">Tags</th>
              <th className="px-4 py-3 text-right">Deploys</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(tpl => (
              <tr key={tpl.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                      <Server size={13} className="text-indigo-600" />
                    </div>
                    <p className="font-medium text-gray-900">{tpl.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[tpl.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {tpl.category}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[220px]">
                  <p className="truncate text-xs font-mono text-gray-500">{tpl.image}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {tpl.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{tag}</span>
                    ))}
                    {tpl.tags.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{tpl.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                  {tpl.deployCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(tpl)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                      <Pencil size={13} />
                    </button>
                    {deleteId === tpl.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-500">Delete?</span>
                        <button onClick={() => handleDelete(tpl.id)}
                          className="rounded-lg px-2 py-1 text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200">Yes</button>
                        <button onClick={() => setDeleteId(null)}
                          className="rounded-lg px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200">No</button>
                      </div>
                    ) : (
                      <button onClick={() => handleDelete(tpl.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No templates found.</div>
        )}

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-400 flex justify-between">
          <span>{filtered.length} of {templates.length} templates</span>
          <span>Total deploys: <span className="font-semibold text-gray-700">{templates.reduce((s, t) => s + t.deployCount, 0).toLocaleString()}</span></span>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add Template' : 'Edit Template'}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
