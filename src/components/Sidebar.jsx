import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Server, CreditCard, Settings, Zap, HardDrive, Users, Bell, Store, Package, Database, Layers, AlertTriangle } from 'lucide-react'
import { user } from '../data/mock'
import { useAlerts } from '../context/AlertsContext'

const userNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/'        },
  { icon: Server,          label: 'Pods',      to: '/pods'    },
  { icon: HardDrive,       label: 'Storage',   to: '/storage' },
  { icon: CreditCard,      label: 'Billing',   to: '/billing' },
  { icon: Bell,            label: 'Alerts',    to: '/alerts'  },
]

const adminNav = [
  { icon: LayoutDashboard, label: 'Overview',        to: '/admin'                    },
  { icon: Users,           label: 'Users',           to: '/admin/users'              },
  { icon: Server,          label: 'Pods',            to: '/admin/pods'               },
  { icon: Layers,          label: 'Network Volumes', to: '/admin/network-volumes'    },
  { icon: AlertTriangle,   label: 'Error History',   to: '/admin/error-history'      },
]

const adminSettingsNav = [
  { icon: Database,  label: 'GPU',          to: '/admin/gpu'          },
  { icon: Package,   label: 'Templates',   to: '/admin/templates'   },
  { icon: HardDrive, label: 'Storage',     to: '/admin/storage'     },
]

function NavItem({ icon: Icon, label, to, badge }) {
  return (
    <NavLink
      to={to}
      end={to === '/' || to === '/admin'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <Icon size={17} />
      <span className="flex-1">{label}</span>
      {badge}
    </NavLink>
  )
}

export default function Sidebar() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const { alertHistory } = useAlerts()

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Zap size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <span className="text-lg font-bold text-gray-900">neurostack</span>
          {isAdmin && (
            <span className="ml-2 rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* User nav */}
        {!isAdmin && (
          <>
            <div className="space-y-0.5">
              {userNav.map(({ icon, label, to }) => (
                <NavItem key={to} icon={icon} label={label} to={to}
                  badge={to === '/alerts' && alertHistory.length > 0
                    ? <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 tabular-nums">{alertHistory.length}</span>
                    : null}
                />
              ))}
            </div>

            {/* GPU & Templates — separated */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <NavItem icon={Store} label="GPU & Templates" to="/marketplace" />
            </div>
          </>
        )}

        {/* Admin nav — monitoring */}
        {isAdmin && (
          <>
            <div className="space-y-0.5">
              {adminNav.map(({ icon, label, to }) => (
                <NavItem key={to} icon={icon} label={label} to={to} />
              ))}
            </div>

            {/* 기본설정 section */}
            <div className="mt-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                기본설정
              </p>
              <div className="space-y-0.5">
                {adminSettingsNav.map(({ icon, label, to }) => (
                  <NavItem key={to} icon={icon} label={label} to={to} />
                ))}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Bottom: user info */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {user.name[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
          <button className="ml-auto text-gray-400 hover:text-gray-600">
            <Settings size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
