import { createContext, useContext, useState } from 'react'
import { pods } from '../data/mock'

const AlertsContext = createContext(null)

const activePods = pods.filter(p => p.status === 'running' || p.status === 'starting')

function fmtUptime(hrs) {
  if (hrs < 1)  return `${Math.round(hrs * 60)}m`
  if (hrs < 24) return `${hrs.toFixed(1)}h`
  return `${(hrs / 24).toFixed(1)}d`
}

export function AlertsProvider({ children }) {
  const [alertHistory, setAlertHistory] = useState(() => {
    const now = Date.now()
    const autoAlerts = activePods
      .filter(p => p.uptimeHrs > 48)
      .map(p => ({
        id:      `${p.id}-long-init`,
        ts:      now - Math.round((p.uptimeHrs - 48) * 3600 * 1000),
        podName: p.name,
        type:    'long',
        msg:     `Running ${fmtUptime(p.uptimeHrs)}`,
      }))

    const seedAlerts = [
      { id: 'seed-idle-1', ts: now - 7  * 60 * 1000,        podName: 'llama-finetune-01', type: 'idle', msg: 'GPU utilization at 3% — training loop may be stalled' },
      { id: 'seed-idle-2', ts: now - 22 * 60 * 1000,        podName: 'inference-server',  type: 'idle', msg: 'GPU utilization dropped to 8% for 20 min — low traffic?' },
      { id: 'seed-long-1', ts: now - 55 * 60 * 1000,        podName: 'llama-finetune-01', type: 'long', msg: 'Running 12.5h — consider checkpointing your model' },
      { id: 'seed-idle-3', ts: now - 2.1 * 3600 * 1000,     podName: 'sd-training-v2',    type: 'idle', msg: 'GPU utilization at 6% — dataset loading may be the bottleneck' },
      { id: 'seed-idle-4', ts: now - 3.5 * 3600 * 1000,     podName: 'inference-server',  type: 'idle', msg: 'GPU utilization at 1% for 45 min — no incoming requests?' },
      { id: 'seed-idle-5', ts: now - 5  * 3600 * 1000,      podName: 'llama-finetune-01', type: 'idle', msg: 'GPU utilization dropped to 12% — batch may be waiting on I/O' },
      { id: 'seed-long-2', ts: now - 7  * 3600 * 1000,      podName: 'inference-server',  type: 'long', msg: 'Running 2.0d — verify this deployment is still needed' },
      { id: 'seed-idle-6', ts: now - 10 * 3600 * 1000,      podName: 'sd-training-v2',    type: 'idle', msg: 'GPU utilization at 5% — pipeline idle between epochs' },
    ]

    return [...autoAlerts, ...seedAlerts].sort((a, b) => b.ts - a.ts)
  })

  function addAlerts(newAlerts) {
    setAlertHistory(prev => [...newAlerts, ...prev].slice(0, 50))
  }

  return (
    <AlertsContext.Provider value={{ alertHistory, addAlerts }}>
      {children}
    </AlertsContext.Provider>
  )
}

export function useAlerts() {
  return useContext(AlertsContext)
}
