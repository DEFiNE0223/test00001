import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Check, ChevronRight, Server, Zap, HardDrive, Link as LinkIcon, Terminal, Monitor, ToggleLeft, ToggleRight } from 'lucide-react'
import { templates, gpuOptions, networkVolumes, podAddons, STORAGE_PRICE_PER_GB_MONTH } from '../data/mock'

const STEPS = ['Configure Server', 'Select Template', 'Review & Deploy']

const tierColors = {
  premium: 'border-violet-200 bg-violet-50',
  high:    'border-indigo-200 bg-indigo-50',
  mid:     'border-blue-100 bg-white',
  entry:   'border-gray-200 bg-white',
}

const categoryColors = {
  pytorch:    'bg-orange-100 text-orange-700',
  tensorflow: 'bg-yellow-100 text-yellow-700',
  diffusion:  'bg-pink-100 text-pink-700',
  llm:        'bg-violet-100 text-violet-700',
  custom:     'bg-gray-100 text-gray-600',
}

const GPU_COUNTS = [1, 2, 4, 8]

export default function PodCreate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  // Step 1: server config
  const [selectedGpu, setSelectedGpu] = useState(null)
  const [gpuCount, setGpuCount] = useState(1)
  const [containerDiskGb, setContainerDiskGb] = useState(20)
  const [attachedVolumeId, setAttachedVolumeId] = useState('')  // '' = none

  // Step 1: access & add-ons
  const [sshEnabled, setSshEnabled] = useState(true)
  const [selectedAddons, setSelectedAddons] = useState([])

  // Step 2: template
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // Step 3: name + deploy
  const [podName, setPodName] = useState('')
  const [deployed, setDeployed] = useState(false)

  function toggleAddon(id) {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  // Computed price
  const gpuCostPerHr = selectedGpu
    ? selectedGpu.costPerHr * gpuCount
    : null
  const containerDiskCostPerHr = containerDiskGb * STORAGE_PRICE_PER_GB_MONTH / 730
  const attachedVolume = networkVolumes.find(v => v.id === attachedVolumeId) ?? null
  const unitPrice = gpuCostPerHr !== null ? gpuCostPerHr + containerDiskCostPerHr : null

  function handleSelectGpu(gpu) {
    setSelectedGpu(gpu)
    // Reset count if current count exceeds this GPU's max
    if (gpuCount > gpu.maxCount) setGpuCount(gpu.maxCount)
  }

  function handleDeploy() {
    setDeployed(true)
    setTimeout(() => navigate('/pods'), 2000)
  }

  if (deployed) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Pod is starting!</h2>
        <p className="mt-1 text-sm text-gray-500">Redirecting to Pods page…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">New Pod</h1>
        <p className="text-sm text-gray-400 mt-0.5">Deploy a new GPU compute pod</p>
      </div>
      {/* Step indicator */}
      <div className="card p-4">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <div key={i} className="flex flex-1 items-center">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2 transition-colors ${
                  i < step   ? 'bg-indigo-600 border-indigo-600 text-white' :
                  i === step ? 'border-indigo-600 text-indigo-600 bg-white' :
                               'border-gray-200 text-gray-400 bg-white'
                }`}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-4 flex-1 h-0.5 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Step 1: Configure Server ─── */}
      {step === 0 && (
        <div className="card p-5 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Configure Server</h2>
            <p className="text-sm text-gray-500 mt-0.5">Select GPU type, count, and storage.</p>
          </div>

          {/* GPU Type */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">GPU Type</p>
            <div className="space-y-2">
              {gpuOptions.map(gpu => (
                <button
                  key={gpu.id}
                  onClick={() => handleSelectGpu(gpu)}
                  className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                    selectedGpu?.id === gpu.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : `${tierColors[gpu.tier]} hover:border-gray-300`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Zap size={16} className={selectedGpu?.id === gpu.id ? 'text-indigo-600' : 'text-gray-400'} />
                    <div>
                      <p className="font-medium text-gray-900">{gpu.name}</p>
                      <p className="text-xs text-gray-500">
                        {gpu.vram} GB VRAM · {gpu.vcpu} vCPU · {gpu.ram} GB RAM
                        <span className="ml-2 text-gray-400">· up to {gpu.maxCount}× GPUs</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">${gpu.costPerHr}/hr</span>
                    {selectedGpu?.id === gpu.id && <Check size={16} className="text-indigo-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* GPU Count */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">GPU Count</p>
            <div className="flex gap-2">
              {GPU_COUNTS.map(count => {
                const disabled = selectedGpu && count > selectedGpu.maxCount
                return (
                  <button
                    key={count}
                    onClick={() => !disabled && setGpuCount(count)}
                    disabled={disabled}
                    className={`flex h-10 w-14 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-colors ${
                      disabled
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : gpuCount === count
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    ×{count}
                  </button>
                )
              })}
              {selectedGpu && (
                <p className="ml-2 self-center text-xs text-gray-400">
                  {selectedGpu.name} supports up to ×{selectedGpu.maxCount}
                </p>
              )}
            </div>
          </div>

          {/* Container Disk */}
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">
              <HardDrive size={14} className="inline mr-1" />
              Container Disk: <span className="text-indigo-600 font-semibold">{containerDiskGb} GB</span>
            </p>
            <p className="mb-2 text-xs text-gray-400">Ephemeral disk — deleted when pod stops.</p>
            <input
              type="range" min={10} max={200} step={10}
              value={containerDiskGb}
              onChange={e => setContainerDiskGb(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10 GB</span><span>200 GB</span>
            </div>
          </div>

          {/* Network Volume */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-700">
                <LinkIcon size={14} className="inline mr-1" />
                Network Volume
              </p>
              <Link to="/storage" className="text-xs text-indigo-500 hover:underline">Manage volumes →</Link>
            </div>
            <p className="mb-2 text-xs text-gray-400">Persistent storage shared across pods. Billed separately per GB/month.</p>
            <div className="space-y-2">
              {/* None option */}
              <button
                onClick={() => setAttachedVolumeId('')}
                className={`flex w-full items-center justify-between rounded-lg border-2 px-3 py-2.5 text-sm text-left transition-all ${
                  attachedVolumeId === ''
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-gray-600">No network volume</span>
                {attachedVolumeId === '' && <Check size={14} className="text-indigo-600" />}
              </button>
              {/* Existing volumes */}
              {networkVolumes.map(vol => (
                <button
                  key={vol.id}
                  onClick={() => setAttachedVolumeId(vol.id)}
                  className={`flex w-full items-center justify-between rounded-lg border-2 px-3 py-2.5 text-sm text-left transition-all ${
                    attachedVolumeId === vol.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HardDrive size={14} className="text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-900">{vol.name}</span>
                    <span className="text-gray-400">{vol.sizeGb} GB · {vol.region}</span>
                    {vol.attachedPodIds.length > 0 && (
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">
                        {vol.attachedPodIds.length} pod{vol.attachedPodIds.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>${(vol.sizeGb * STORAGE_PRICE_PER_GB_MONTH).toFixed(2)}/mo</span>
                    {attachedVolumeId === vol.id && <Check size={14} className="text-indigo-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Access & Add-ons */}
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">
              <Terminal size={14} className="inline mr-1" />
              Access & Add-ons
            </p>

            {/* SSH toggle */}
            <div className="mb-3 flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">SSH Access</p>
                <p className="text-xs text-gray-400 mt-0.5">Connect via terminal — <code className="bg-gray-100 px-1 rounded text-xs">ssh user@pod-ip -p 22</code></p>
              </div>
              <button
                onClick={() => setSshEnabled(v => !v)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  sshEnabled
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {sshEnabled
                  ? <><ToggleRight size={16} /> Enabled</>
                  : <><ToggleLeft size={16} /> Disabled</>
                }
              </button>
            </div>

            {/* IDE Add-ons */}
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">IDE Add-ons (optional)</p>
            <div className="space-y-2">
              {podAddons.map(addon => {
                const active = selectedAddons.includes(addon.id)
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Monitor size={15} className={active ? 'text-indigo-600' : 'text-gray-400'} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                        <p className="text-xs text-gray-400">{addon.description} · port {addon.port}</p>
                      </div>
                    </div>
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      active ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white'
                    }`}>
                      {active && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price preview */}
          {unitPrice !== null && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-sm text-indigo-700">
                <span>GPU ×{gpuCount}</span>
                <span>${gpuCostPerHr.toFixed(4)}/hr</span>
              </div>
              <div className="flex items-center justify-between text-sm text-indigo-700">
                <span>Container disk ({containerDiskGb} GB)</span>
                <span>${containerDiskCostPerHr.toFixed(4)}/hr</span>
              </div>
              {attachedVolume && (
                <div className="flex items-center justify-between text-sm text-indigo-700">
                  <span>Network volume "{attachedVolume.name}" ({attachedVolume.sizeGb} GB)</span>
                  <span className="text-indigo-400">${(attachedVolume.sizeGb * STORAGE_PRICE_PER_GB_MONTH).toFixed(2)}/mo*</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-indigo-200 pt-2">
                <span className="font-semibold text-indigo-800">Total (compute)</span>
                <span className="text-lg font-bold text-indigo-800">${unitPrice.toFixed(4)}/hr</span>
              </div>
              <p className="text-xs text-indigo-400">≈ ${(unitPrice * 24).toFixed(2)}/day · ${(unitPrice * 720).toFixed(2)}/mo
                {attachedVolume && ' + volume storage billed separately'}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={!selectedGpu}
              className="btn-primary"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Select Template ─── */}
      {step === 1 && (
        <div className="card p-5">
          <h2 className="mb-1 text-base font-semibold text-gray-900">Select Template</h2>
          <p className="mb-4 text-sm text-gray-500">Choose a pre-built container environment.</p>
          <div className="grid grid-cols-2 gap-3">
            {templates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  selectedTemplate?.id === tpl.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                  <Server size={15} className="text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{tpl.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[tpl.category]}`}>
                      {tpl.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{tpl.description}</p>
                  <p className="mt-1 text-xs text-gray-400">{tpl.deployCount.toLocaleString()} deploys</p>
                </div>
                {selectedTemplate?.id === tpl.id && (
                  <Check size={16} className="ml-auto shrink-0 text-indigo-600" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(0)} className="btn-secondary">Back</button>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedTemplate}
              className="btn-primary"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Review & Deploy ─── */}
      {step === 2 && (
        <div className="card p-5 space-y-5">
          <div>
            <h2 className="mb-1 text-base font-semibold text-gray-900">Review & Deploy</h2>
            <p className="text-sm text-gray-500">Confirm your configuration before deploying.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Pod Name</label>
            <input
              type="text"
              value={podName}
              onChange={e => setPodName(e.target.value)}
              placeholder="my-pod-name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100 overflow-hidden text-sm">
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">GPU</span>
              <span className="font-medium text-gray-900">{selectedGpu?.name}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">GPU Count</span>
              <span className="font-medium text-gray-900">×{gpuCount}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">Template</span>
              <span className="font-medium text-gray-900">{selectedTemplate?.name}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">vCPU / RAM</span>
              <span className="font-medium text-gray-900">
                {(selectedGpu?.vcpu ?? 0) * gpuCount} vCPU · {(selectedGpu?.ram ?? 0) * gpuCount} GB
              </span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">Container Disk</span>
              <span className="font-medium text-gray-900">{containerDiskGb} GB (ephemeral)</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">Network Volume</span>
              <span className="font-medium text-gray-900">
                {attachedVolume ? `${attachedVolume.name} (${attachedVolume.sizeGb} GB)` : 'None'}
              </span>
            </div>
            <div className="flex justify-between px-4 py-3 text-sm">
              <span className="text-gray-500">GPU Cost</span>
              <span className="font-medium text-gray-900">${gpuCostPerHr?.toFixed(4)}/hr</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-sm">
              <span className="text-gray-500">Container Disk Cost</span>
              <span className="font-medium text-gray-900">${containerDiskCostPerHr.toFixed(4)}/hr</span>
            </div>
            {attachedVolume && (
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-gray-500">Network Volume Cost</span>
                <span className="font-medium text-gray-900">${(attachedVolume.sizeGb * STORAGE_PRICE_PER_GB_MONTH).toFixed(2)}/mo</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">SSH Access</span>
              <span className={`font-medium ${sshEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                {sshEnabled ? 'Enabled (port 22)' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">IDE Add-ons</span>
              <span className="font-medium text-gray-900">
                {selectedAddons.length === 0
                  ? 'None'
                  : selectedAddons.map(id => podAddons.find(a => a.id === id)?.name).join(', ')
                }
              </span>
            </div>
            <div className="flex justify-between px-4 py-3 font-semibold bg-indigo-50">
              <span className="text-indigo-700">Total</span>
              <span className="text-indigo-700">${unitPrice?.toFixed(4)}/hr</span>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button onClick={handleDeploy} className="btn-primary">
              <Zap size={16} /> Deploy Pod
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
