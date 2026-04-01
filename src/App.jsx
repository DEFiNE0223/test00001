import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Pods from './pages/Pods'
import PodCreate from './pages/PodCreate'
import Templates from './pages/Templates'
import Marketplace from './pages/Marketplace'
import Billing from './pages/Billing'
import Storage from './pages/Storage'
import AlertsPage from './pages/Alerts'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTemplates from './pages/admin/AdminTemplates'
import AdminGpuCatalog from './pages/admin/AdminGpuCatalog'
import AdminStorage from './pages/admin/AdminStorage'
import AdminNetworkVolumes from './pages/admin/AdminNetworkVolumes'
import AdminErrorHistory from './pages/admin/AdminErrorHistory'
import AdminPods from './pages/admin/AdminPods'
import { AlertsProvider } from './context/AlertsContext'

export default function App() {
  return (
    <AlertsProvider>
      <BrowserRouter basename="/test00001">
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* User console */}
            <Route index element={<Dashboard />} />
            <Route path="pods" element={<Pods />} />
            <Route path="pods/new" element={<PodCreate />} />
            <Route path="storage" element={<Storage />} />
            <Route path="templates" element={<Templates />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="billing" element={<Billing />} />
            <Route path="alerts" element={<AlertsPage />} />
            {/* Admin console */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/templates" element={<AdminTemplates />} />
            <Route path="admin/gpu" element={<AdminGpuCatalog />} />
            <Route path="admin/storage" element={<AdminStorage />} />
            <Route path="admin/network-volumes" element={<AdminNetworkVolumes />} />
            <Route path="admin/error-history" element={<AdminErrorHistory />} />
            <Route path="admin/pods" element={<AdminPods />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AlertsProvider>
  )
}
