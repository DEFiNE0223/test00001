export const networkVolumes = [
  { id: 'vol-001', userId: 'u-001', name: 'training-data-storage',  sizeGb: 500,  region: 'US-TX-3', attachedPodIds: ['pod-a1b2c3', 'pod-g7h8i9'], status: 'attached',  createdAt: '2026-03-15' },
  { id: 'vol-002', userId: 'u-001', name: 'model-weights-storage',   sizeGb: 200,  region: 'US-TX-3', attachedPodIds: ['pod-a1b2c3'],               status: 'attached',  createdAt: '2026-03-20' },
  { id: 'vol-003', userId: 'u-001', name: 'checkpoints-storage',     sizeGb: 100,  region: 'EU-RO-1', attachedPodIds: [],                           status: 'ready',     createdAt: '2026-03-28' },
  { id: 'vol-004', userId: 'u-002', name: 'datasets-v2-storage',     sizeGb: 300,  region: 'US-TX-3', attachedPodIds: [],                           status: 'ready',     createdAt: '2026-02-10' },
  { id: 'vol-005', userId: 'u-003', name: 'llm-weights-storage',     sizeGb: 800,  region: 'US-TX-3', attachedPodIds: ['pod-a1b2c3'],               status: 'attached',  createdAt: '2026-01-20' },
  { id: 'vol-006', userId: 'u-003', name: 'inference-cache-storage', sizeGb: 400,  region: 'AP-SG-1', attachedPodIds: [],                           status: 'ready',     createdAt: '2026-02-05' },
  { id: 'vol-007', userId: 'u-007', name: 'training-runs-storage',   sizeGb: 1200, region: 'US-TX-3', attachedPodIds: ['pod-g7h8i9'],               status: 'attached',  createdAt: '2025-12-01' },
  { id: 'vol-008', userId: 'u-006', name: 'eval-data-storage',       sizeGb: 150,  region: 'EU-RO-1', attachedPodIds: [],                           status: 'error',     createdAt: '2026-03-10' },
]

// Storage pricing per region ($/GB/month)
export const storagePricingByRegion = {
  'US-TX-3': 0.20,
  'US-GA-1': 0.18,
  'EU-RO-1': 0.22,
  'EU-SE-1': 0.25,
  'AP-SG-1': 0.28,
  'NA-CA-1': 0.24,
}

export const pods = [
  {
    id: 'pod-a1b2c3',
    name: 'llama-finetune-01',
    status: 'running',
    gpuType: 'NVIDIA A100 80GB',
    gpuCount: 1,
    vcpu: 8,
    ram: 32,
    containerDiskGb: 20,
    diskUsedGb: 12,
    networkVolumeIds: ['vol-001', 'vol-002'],
    costPerHr: 2.49,
    template: 'PyTorch 2.1',
    uptimeHrs: 12.5,
    sshEnabled: true,
    addons: ['jupyter', 'vscode'],
  },
  {
    id: 'pod-d4e5f6',
    name: 'sd-training-v2',
    status: 'stopped',
    gpuType: 'NVIDIA RTX 4090',
    gpuCount: 1,
    vcpu: 6,
    ram: 24,
    containerDiskGb: 20,
    diskUsedGb: 8,
    networkVolumeIds: [],
    costPerHr: 0.74,
    template: 'Stable Diffusion',
    uptimeHrs: 0,
    sshEnabled: true,
    addons: ['vscode'],
  },
  {
    id: 'pod-g7h8i9',
    name: 'inference-server',
    status: 'running',
    gpuType: 'NVIDIA A10G',
    gpuCount: 2,
    vcpu: 8,
    ram: 32,
    containerDiskGb: 20,
    diskUsedGb: 15,
    networkVolumeIds: ['vol-001'],
    costPerHr: 1.52,
    template: 'vLLM',
    uptimeHrs: 48.2,
    sshEnabled: true,
    addons: [],
  },
  {
    id: 'pod-j0k1l2',
    name: 'jupyter-dev',
    status: 'starting',
    gpuType: 'NVIDIA RTX 3090',
    gpuCount: 1,
    vcpu: 4,
    ram: 16,
    containerDiskGb: 20,
    diskUsedGb: 4,
    networkVolumeIds: [],
    costPerHr: 0.44,
    template: 'PyTorch 2.1',
    uptimeHrs: 0.1,
    sshEnabled: false,
    addons: ['jupyter', 'vscode'],
  },
]

export const templates = [
  {
    id: 'tpl-pytorch',
    name: 'PyTorch 2.1',
    category: 'pytorch',
    image: 'runpod/pytorch:2.1.0-py3.10-cuda12.1',
    description: 'PyTorch 2.1 with CUDA 12.1, cuDNN 8.9. Ideal for training and fine-tuning.',
    deployCount: 45230,
    tags: ['pytorch', 'cuda', 'training'],
  },
  {
    id: 'tpl-tf',
    name: 'TensorFlow 2.14',
    category: 'tensorflow',
    image: 'tensorflow/tensorflow:2.14.0-gpu',
    description: 'TensorFlow 2.14 with GPU support and Keras 2 preinstalled.',
    deployCount: 28100,
    tags: ['tensorflow', 'keras', 'gpu'],
  },
  {
    id: 'tpl-sd',
    name: 'Stable Diffusion WebUI',
    category: 'diffusion',
    image: 'ashleykza/stable-diffusion-webui:latest',
    description: 'AUTOMATIC1111 WebUI with popular models and extensions preloaded.',
    deployCount: 89420,
    tags: ['stable-diffusion', 'image-gen', 'webui'],
  },
  {
    id: 'tpl-vllm',
    name: 'vLLM',
    category: 'llm',
    image: 'vllm/vllm-openai:latest',
    description: 'High-throughput LLM inference engine with OpenAI-compatible API.',
    deployCount: 12600,
    tags: ['vllm', 'llm', 'inference'],
  },
  {
    id: 'tpl-comfy',
    name: 'ComfyUI',
    category: 'diffusion',
    image: 'yanwk/comfyui-boot:cu121',
    description: 'ComfyUI with popular node packs preinstalled for advanced workflows.',
    deployCount: 34100,
    tags: ['comfyui', 'stable-diffusion', 'nodes'],
  },
  {
    id: 'tpl-ollama',
    name: 'Ollama',
    category: 'llm',
    image: 'ollama/ollama:latest',
    description: 'Run open-source LLMs locally with a simple REST API.',
    deployCount: 19800,
    tags: ['ollama', 'llm', 'local'],
  },
  {
    id: 'tpl-whisper',
    name: 'Whisper ASR',
    category: 'custom',
    image: 'onerahmet/openai-whisper-asr-webservice:latest',
    description: 'OpenAI Whisper speech-to-text with REST API interface.',
    deployCount: 8900,
    tags: ['whisper', 'asr', 'speech'],
  },
]

export const gpuOptions = [
  { id: 'h100', name: 'NVIDIA H100 80GB SXM', vram: 80, vcpu: 16, ram: 64, costPerHr: 3.89, tier: 'premium', maxCount: 8 },
  { id: 'a100-80', name: 'NVIDIA A100 80GB PCIe', vram: 80, vcpu: 8, ram: 32, costPerHr: 2.49, tier: 'high', maxCount: 8 },
  { id: 'a100-40', name: 'NVIDIA A100 40GB PCIe', vram: 40, vcpu: 8, ram: 32, costPerHr: 1.49, tier: 'high', maxCount: 8 },
  { id: 'a10g', name: 'NVIDIA A10G', vram: 24, vcpu: 4, ram: 16, costPerHr: 0.76, tier: 'mid', maxCount: 4 },
  { id: '4090', name: 'NVIDIA RTX 4090', vram: 24, vcpu: 6, ram: 24, costPerHr: 0.74, tier: 'mid', maxCount: 4 },
  { id: '3090', name: 'NVIDIA RTX 3090', vram: 24, vcpu: 4, ram: 16, costPerHr: 0.44, tier: 'entry', maxCount: 4 },
  { id: '3080', name: 'NVIDIA RTX 3080', vram: 10, vcpu: 4, ram: 16, costPerHr: 0.28, tier: 'entry', maxCount: 4 },
]

// type: 'compute' = GPU + Container Disk / 'storage' = Network Volume (monthly)
// diskCostUsd = containerDiskGb × hours × (CONTAINER_DISK_PRICE_PER_GB_MONTH / 720)
export const billingRecords = [
  // March 2026
  { id: 'bill-001',     type: 'compute', status: 'terminated', name: 'llama-finetune-01',  gpu: 'A100 80GB', containerDiskGb: 20, hours: 48,  gpuCostUsd: 119.52, diskCostUsd: 0.13, costUsd: 119.65, date: '2026-03-28' },
  { id: 'bill-002',     type: 'compute', status: 'terminated', name: 'sd-training-run',    gpu: 'RTX 4090',  containerDiskGb: 20, hours: 72,  gpuCostUsd:  53.28, diskCostUsd: 0.20, costUsd:  53.48, date: '2026-03-25' },
  { id: 'bill-003',     type: 'compute', status: 'terminated', name: 'inference-server',   gpu: 'A10G ×2',   containerDiskGb: 20, hours: 168, gpuCostUsd: 255.36, diskCostUsd: 0.47, costUsd: 255.83, date: '2026-03-20' },
  { id: 'bill-004',     type: 'compute', status: 'terminated', name: 'jupyter-dev',        gpu: 'RTX 3090',  containerDiskGb: 20, hours: 24,  gpuCostUsd:  10.56, diskCostUsd: 0.07, costUsd:  10.63, date: '2026-03-18' },
  { id: 'bill-005',     type: 'compute', status: 'terminated', name: 'gpt-finetune',       gpu: 'A100 80GB', containerDiskGb: 20, hours: 120, gpuCostUsd: 298.80, diskCostUsd: 0.33, costUsd: 299.13, date: '2026-03-10' },
  { id: 'bill-vol-001', type: 'storage', status: 'active',     name: 'training-data-storage', detail: '500 GB', hours: null, costUsd: 100.00, date: '2026-03-01' },
  { id: 'bill-vol-002', type: 'storage', status: 'active',     name: 'model-weights-storage', detail: '200 GB', hours: null, costUsd:  40.00, date: '2026-03-01' },
  { id: 'bill-vol-003', type: 'storage', status: 'deleted',    name: 'checkpoints-storage',   detail: '100 GB', hours: null, costUsd:  20.00, date: '2026-03-01' },
  // February 2026
  { id: 'bill-feb-001', type: 'compute', status: 'terminated', name: 'llama-ft-v2',        gpu: 'A100 80GB', containerDiskGb: 20, hours: 96,  gpuCostUsd: 239.04, diskCostUsd: 0.27, costUsd: 239.31, date: '2026-02-24' },
  { id: 'bill-feb-002', type: 'compute', status: 'terminated', name: 'sd-xl-train',        gpu: 'RTX 4090',  containerDiskGb: 20, hours: 144, gpuCostUsd: 106.56, diskCostUsd: 0.40, costUsd: 106.96, date: '2026-02-17' },
  { id: 'bill-feb-003', type: 'compute', status: 'terminated', name: 'inference-cluster',  gpu: 'A10G ×2',   containerDiskGb: 20, hours: 240, gpuCostUsd: 364.80, diskCostUsd: 0.67, costUsd: 365.47, date: '2026-02-10' },
  { id: 'bill-feb-004', type: 'compute', status: 'terminated', name: 'jupyter-lab',        gpu: 'RTX 3090',  containerDiskGb: 20, hours: 48,  gpuCostUsd:  21.12, diskCostUsd: 0.13, costUsd:  21.25, date: '2026-02-05' },
  { id: 'bill-fvol-001', type: 'storage', status: 'active',    name: 'training-data-storage', detail: '500 GB', hours: null, costUsd: 100.00, date: '2026-02-01' },
  { id: 'bill-fvol-002', type: 'storage', status: 'active',    name: 'model-weights-storage', detail: '200 GB', hours: null, costUsd:  40.00, date: '2026-02-01' },
  { id: 'bill-fvol-003', type: 'storage', status: 'active',    name: 'checkpoints-storage',   detail: '100 GB', hours: null, costUsd:  20.00, date: '2026-02-01' },
  // January 2026
  { id: 'bill-jan-001', type: 'compute', status: 'terminated', name: 'gpt-finetune-v1',   gpu: 'A100 80GB', containerDiskGb: 20, hours: 120, gpuCostUsd: 298.80, diskCostUsd: 0.33, costUsd: 299.13, date: '2026-01-25' },
  { id: 'bill-jan-002', type: 'compute', status: 'terminated', name: 'diffusion-xl',      gpu: 'RTX 4090',  containerDiskGb: 20, hours: 96,  gpuCostUsd:  71.04, diskCostUsd: 0.27, costUsd:  71.31, date: '2026-01-18' },
  { id: 'bill-jan-003', type: 'compute', status: 'terminated', name: 'api-server',        gpu: 'A10G ×2',   containerDiskGb: 20, hours: 168, gpuCostUsd: 255.36, diskCostUsd: 0.47, costUsd: 255.83, date: '2026-01-10' },
  { id: 'bill-jvol-001', type: 'storage', status: 'active',    name: 'training-data-storage', detail: '500 GB', hours: null, costUsd: 100.00, date: '2026-01-01' },
  { id: 'bill-jvol-002', type: 'storage', status: 'active',    name: 'model-weights-storage', detail: '200 GB', hours: null, costUsd:  40.00, date: '2026-01-01' },
  { id: 'bill-jvol-003', type: 'storage', status: 'deleted',   name: 'checkpoints-storage',   detail: '100 GB', hours: null, costUsd:  20.00, date: '2026-01-01' },
]

export const monthlySpend = [
  { month: 'Oct', amount: 450 },
  { month: 'Nov', amount: 680 },
  { month: 'Dec', amount: 520 },
  { month: 'Jan', amount: 890 },
  { month: 'Feb', amount: 1120 },
  { month: 'Mar', amount: 897 },
]

export const podAddons = [
  {
    id: 'jupyter',
    name: 'JupyterLab',
    description: 'Interactive notebook environment accessible via browser',
    port: 8888,
  },
  {
    id: 'vscode',
    name: 'VS Code Server',
    description: 'Full VS Code editor in browser (code-server)',
    port: 8080,
  },
]

// Storage: $0.20 per GB per month (= $0.000274/GB/hr)
export const STORAGE_PRICE_PER_GB_MONTH = 0.20

// Container Disk: $0.10 per GB per month (= $0.000139/GB/hr)
export const CONTAINER_DISK_PRICE_PER_GB_MONTH = 0.10

export const user = {
  name: 'Ji-yeon',
  email: 'jiyeon@example.com',
  apiKey: 'ns_sk_xK9mT2pQrS8vZw3bYc1dEfGhIjKlMnOpQr',
}

// ── Admin mock data ───────────────────────────────────────────

export const platformStats = {
  totalUsers: 1284,
  activeUsers: 847,
  newUsersThisMonth: 94,
  totalPodsRunning: 312,
  totalGpusInUse: 1847,
  totalGpus: 2560,
  revenuePerHr: 4820.44,
  revenueThisMonth: 847320,
  avgUtilization: 72,
}

export const revenueHistory = [
  { month: 'Oct', amount: 612000 },
  { month: 'Nov', amount: 734000 },
  { month: 'Dec', amount: 698000 },
  { month: 'Jan', amount: 812000 },
  { month: 'Feb', amount: 921000 },
  { month: 'Mar', amount: 847320 },
]

export const allUsers = [
  { id: 'u-001', name: 'Ji-yeon',      email: 'jiyeon@example.com',   activePods: 3, totalSpend: 2847.60,  joined: '2025-10-01', status: 'active'    },
  { id: 'u-002', name: 'Alex Kim',     email: 'alex@ml.io',           activePods: 1, totalSpend: 5210.40,  joined: '2025-08-15', status: 'active'    },
  { id: 'u-003', name: 'Sam Park',     email: 'sam@research.ai',      activePods: 5, totalSpend: 12450.00, joined: '2025-06-01', status: 'active'    },
  { id: 'u-004', name: 'Liu Wei',      email: 'liu@deeplearn.cn',     activePods: 0, totalSpend: 387.50,   joined: '2026-01-10', status: 'active'    },
  { id: 'u-005', name: 'Maria Garcia', email: 'maria@uni.edu',        activePods: 0, totalSpend: 95.00,    joined: '2026-02-20', status: 'suspended' },
  { id: 'u-006', name: 'Tom Chen',     email: 'tom@startup.ai',       activePods: 2, totalSpend: 3120.80,  joined: '2025-11-05', status: 'active'    },
  { id: 'u-007', name: 'Yuki Tanaka',  email: 'yuki@lab.jp',          activePods: 8, totalSpend: 28900.00, joined: '2025-05-12', status: 'active'    },
  { id: 'u-008', name: 'Omar Hassan',  email: 'omar@fintech.ae',      activePods: 1, totalSpend: 1640.20,  joined: '2025-12-01', status: 'active'    },
]

export const gpuFleet = [
  { id: 'node-tx-001', region: 'US-TX-3', gpuType: 'NVIDIA H100 80GB SXM',   total: 8, inUse: 6, temp: 72, status: 'healthy',     powerW: 3200 },
  { id: 'node-tx-002', region: 'US-TX-3', gpuType: 'NVIDIA A100 80GB PCIe',  total: 8, inUse: 8, temp: 78, status: 'healthy',     powerW: 2400 },
  { id: 'node-tx-003', region: 'US-TX-3', gpuType: 'NVIDIA RTX 4090',        total: 4, inUse: 2, temp: 65, status: 'healthy',     powerW: 1200 },
  { id: 'node-ro-001', region: 'EU-RO-1', gpuType: 'NVIDIA A100 40GB PCIe',  total: 8, inUse: 3, temp: 68, status: 'healthy',     powerW: 1800 },
  { id: 'node-ro-002', region: 'EU-RO-1', gpuType: 'NVIDIA A10G',            total: 4, inUse: 4, temp: 83, status: 'warning',     powerW: 900  },
  { id: 'node-ga-001', region: 'US-GA-1', gpuType: 'NVIDIA RTX 3090',        total: 4, inUse: 0, temp: 36, status: 'idle',        powerW: 280  },
  { id: 'node-ga-002', region: 'US-GA-1', gpuType: 'NVIDIA A100 80GB PCIe',  total: 8, inUse: 0, temp: 41, status: 'maintenance', powerW: 0    },
  { id: 'node-sg-001', region: 'AP-SG-1', gpuType: 'NVIDIA A10G',            total: 4, inUse: 3, temp: 74, status: 'healthy',     powerW: 680  },
]

export const systemErrors = [
  { id: 'err-001', ts: '2026-03-31 14:23:11', type: 'pod_failed',   severity: 'critical', source: 'llama-finetune-01',  region: 'US-TX-3', message: 'Container exited with code 137 (OOM killed)' },
  { id: 'err-002', ts: '2026-03-31 12:05:44', type: 'gpu_error',    severity: 'critical', source: 'node-tx-002',        region: 'US-TX-3', message: 'GPU 3 ECC uncorrectable error detected' },
  { id: 'err-003', ts: '2026-03-30 22:41:09', type: 'volume_error', severity: 'warning',  source: 'eval-data',          region: 'EU-RO-1', message: 'Volume mount failed: I/O timeout' },
  { id: 'err-004', ts: '2026-03-30 18:17:33', type: 'node_offline', severity: 'critical', source: 'node-ro-002',        region: 'EU-RO-1', message: 'Node went offline unexpectedly' },
  { id: 'err-005', ts: '2026-03-30 11:52:20', type: 'pod_failed',   severity: 'warning',  source: 'sd-inference-02',    region: 'US-TX-3', message: 'Pod restarted 3 times within 10 minutes' },
  { id: 'err-006', ts: '2026-03-29 09:30:15', type: 'gpu_error',    severity: 'warning',  source: 'node-ga-001',        region: 'US-GA-1', message: 'GPU thermal throttling detected (88°C)' },
  { id: 'err-007', ts: '2026-03-29 03:14:07', type: 'pod_failed',   severity: 'info',     source: 'whisper-batch-01',   region: 'AP-SG-1', message: 'Pod stopped: credit limit reached' },
  { id: 'err-008', ts: '2026-03-28 20:08:55', type: 'volume_error', severity: 'info',     source: 'training-data-03',   region: 'US-TX-3', message: 'Volume auto-detached after pod termination' },
  { id: 'err-009', ts: '2026-03-28 15:44:31', type: 'node_offline', severity: 'warning',  source: 'node-sg-001',        region: 'AP-SG-1', message: 'Node entered scheduled maintenance window' },
  { id: 'err-010', ts: '2026-03-27 11:22:18', type: 'gpu_error',    severity: 'critical', source: 'node-tx-001',        region: 'US-TX-3', message: 'NVLink error: inter-GPU communication failure' },
  { id: 'err-011', ts: '2026-03-27 08:05:41', type: 'pod_failed',   severity: 'critical', source: 'gpt4-serving-01',    region: 'US-GA-1', message: 'CUDA out of memory: 80 GB fully allocated' },
  { id: 'err-012', ts: '2026-03-26 19:33:02', type: 'volume_error', severity: 'warning',  source: 'model-weights-02',   region: 'US-GA-1', message: 'Volume approaching capacity (95% used)' },
]

export const adminPods = [
  { id: 'pod-a1b2c3', userId: 'u-001', name: 'llama-finetune-01',  status: 'running',  gpuType: 'NVIDIA A100 80GB',    gpuCount: 1, region: 'US-TX-3', costPerHr: 2.49, uptimeHrs: 12.5,  template: 'PyTorch 2.1',       containerDiskGb: 50,  diskUsedGb: 30,  gpuUtilPct: 87 },
  { id: 'pod-d4e5f6', userId: 'u-001', name: 'sd-training-v2',     status: 'stopped',  gpuType: 'NVIDIA RTX 4090',     gpuCount: 1, region: 'US-TX-3', costPerHr: 0.74, uptimeHrs: 0,     template: 'Stable Diffusion',  containerDiskGb: 20,  diskUsedGb: 8,   gpuUtilPct: 0  },
  { id: 'pod-g7h8i9', userId: 'u-001', name: 'inference-server',   status: 'running',  gpuType: 'NVIDIA A10G',         gpuCount: 2, region: 'EU-RO-1', costPerHr: 1.52, uptimeHrs: 48.2,  template: 'vLLM',              containerDiskGb: 20,  diskUsedGb: 14,  gpuUtilPct: 72 },
  { id: 'pod-j0k1l2', userId: 'u-001', name: 'jupyter-dev',        status: 'starting', gpuType: 'NVIDIA RTX 3090',     gpuCount: 1, region: 'US-TX-3', costPerHr: 0.44, uptimeHrs: 0.1,   template: 'PyTorch 2.1',       containerDiskGb: 20,  diskUsedGb: 4,   gpuUtilPct: 3  },
  { id: 'pod-m3n4o5', userId: 'u-002', name: 'bert-finetuning',    status: 'running',  gpuType: 'NVIDIA A100 80GB',    gpuCount: 1, region: 'US-GA-1', costPerHr: 2.49, uptimeHrs: 6.3,   template: 'HuggingFace',       containerDiskGb: 50,  diskUsedGb: 20,  gpuUtilPct: 63 },
  { id: 'pod-p6q7r8', userId: 'u-003', name: 'gpt4-serving-01',    status: 'running',  gpuType: 'NVIDIA H100 80GB SXM',gpuCount: 4, region: 'US-TX-3', costPerHr: 9.99, uptimeHrs: 120.0, template: 'vLLM',              containerDiskGb: 100, diskUsedGb: 78,  gpuUtilPct: 94 },
  { id: 'pod-s9t0u1', userId: 'u-003', name: 'diffusion-train-v3', status: 'running',  gpuType: 'NVIDIA A100 80GB',    gpuCount: 2, region: 'EU-RO-1', costPerHr: 4.98, uptimeHrs: 33.7,  template: 'Stable Diffusion',  containerDiskGb: 100, diskUsedGb: 65,  gpuUtilPct: 91 },
  { id: 'pod-v2w3x4', userId: 'u-003', name: 'eval-batch-runner',  status: 'stopped',  gpuType: 'NVIDIA RTX 4090',     gpuCount: 1, region: 'AP-SG-1', costPerHr: 0.74, uptimeHrs: 0,     template: 'PyTorch 2.1',       containerDiskGb: 20,  diskUsedGb: 6,   gpuUtilPct: 0  },
  { id: 'pod-y5z6a7', userId: 'u-003', name: 'whisper-batch-01',   status: 'error',    gpuType: 'NVIDIA A10G',         gpuCount: 1, region: 'AP-SG-1', costPerHr: 0.76, uptimeHrs: 2.1,   template: 'Whisper',           containerDiskGb: 20,  diskUsedGb: 12,  gpuUtilPct: 0  },
  { id: 'pod-b8c9d0', userId: 'u-003', name: 'rlhf-trainer',       status: 'running',  gpuType: 'NVIDIA H100 80GB SXM',gpuCount: 2, region: 'US-TX-3', costPerHr: 4.99, uptimeHrs: 18.5,  template: 'PyTorch 2.1',       containerDiskGb: 50,  diskUsedGb: 22,  gpuUtilPct: 88 },
  { id: 'pod-e1f2g3', userId: 'u-006', name: 'api-inference-01',   status: 'running',  gpuType: 'NVIDIA RTX 4090',     gpuCount: 1, region: 'US-GA-1', costPerHr: 0.74, uptimeHrs: 72.4,  template: 'FastAPI + vLLM',    containerDiskGb: 20,  diskUsedGb: 11,  gpuUtilPct: 55 },
  { id: 'pod-h4i5j6', userId: 'u-006', name: 'data-preprocessing', status: 'stopped',  gpuType: 'NVIDIA RTX 3090',     gpuCount: 1, region: 'US-GA-1', costPerHr: 0.44, uptimeHrs: 0,     template: 'PyTorch 2.1',       containerDiskGb: 20,  diskUsedGb: 5,   gpuUtilPct: 0  },
  { id: 'pod-k7l8m9', userId: 'u-007', name: 'flux-training-01',   status: 'running',  gpuType: 'NVIDIA H100 80GB SXM',gpuCount: 8, region: 'US-TX-3', costPerHr: 19.98,uptimeHrs: 204.1, template: 'Stable Diffusion',  containerDiskGb: 200, diskUsedGb: 156, gpuUtilPct: 97 },
  { id: 'pod-n0o1p2', userId: 'u-007', name: 'mixtral-serving',    status: 'running',  gpuType: 'NVIDIA A100 80GB',    gpuCount: 4, region: 'EU-RO-1', costPerHr: 9.96, uptimeHrs: 88.0,  template: 'vLLM',              containerDiskGb: 100, diskUsedGb: 72,  gpuUtilPct: 83 },
  { id: 'pod-q3r4s5', userId: 'u-007', name: 'codegen-finetune',   status: 'running',  gpuType: 'NVIDIA A100 80GB',    gpuCount: 2, region: 'AP-SG-1', costPerHr: 4.98, uptimeHrs: 41.2,  template: 'HuggingFace',       containerDiskGb: 50,  diskUsedGb: 38,  gpuUtilPct: 76 },
  { id: 'pod-t6u7v8', userId: 'u-007', name: 'reward-model-train', status: 'starting', gpuType: 'NVIDIA A10G',         gpuCount: 2, region: 'US-TX-3', costPerHr: 1.52, uptimeHrs: 0.2,   template: 'PyTorch 2.1',       containerDiskGb: 20,  diskUsedGb: 3,   gpuUtilPct: 2  },
  { id: 'pod-w9x0y1', userId: 'u-007', name: 'video-gen-v2',       status: 'stopped',  gpuType: 'NVIDIA RTX 4090',     gpuCount: 2, region: 'US-GA-1', costPerHr: 1.48, uptimeHrs: 0,     template: 'ComfyUI',           containerDiskGb: 50,  diskUsedGb: 18,  gpuUtilPct: 0  },
  { id: 'pod-z2a3b4', userId: 'u-007', name: 'embedding-server',   status: 'running',  gpuType: 'NVIDIA A10G',         gpuCount: 1, region: 'EU-RO-1', costPerHr: 0.76, uptimeHrs: 512.3, template: 'FastAPI + vLLM',    containerDiskGb: 20,  diskUsedGb: 9,   gpuUtilPct: 48 },
  { id: 'pod-c5d6e7', userId: 'u-008', name: 'fraud-detector',     status: 'running',  gpuType: 'NVIDIA RTX 4090',     gpuCount: 1, region: 'AP-SG-1', costPerHr: 0.74, uptimeHrs: 9.8,   template: 'PyTorch 2.1',       containerDiskGb: 20,  diskUsedGb: 13,  gpuUtilPct: 61 },
]
