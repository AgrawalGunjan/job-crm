import { createContext, useContext, useEffect, useRef } from 'react'
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { initializeStorage } from './services/fileService.js'
import {
  requestNotificationPermission,
  createNotificationChannel,
} from './services/notificationService.js'
import { useToast } from './hooks/useToast.js'
import { useSettings } from './hooks/useSettings.js'
import { DEFAULT_SETTINGS } from './constants/defaults.js'
import ToastContainer from './components/common/Toast.jsx'
import DashboardScreen from './screens/DashboardScreen.jsx'
import ContactsScreen from './screens/ContactsScreen.jsx'
import ContactDetailScreen from './screens/ContactDetailScreen.jsx'
import AddEditContactScreen from './screens/AddEditContactScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import ListOptionsScreen from './screens/ListOptionsScreen.jsx'

// ─── Contexts ─────────────────────────────────────────────────────────────────
export const ToastContext = createContext({ showToast: () => {} })
export const SettingsContext = createContext({ settings: null })
export const ListOptionsContext = createContext({
  companyTypes: DEFAULT_SETTINGS.companyTypes,
  roleTypes: DEFAULT_SETTINGS.roleTypes,
  statuses: DEFAULT_SETTINGS.statuses,
  updateCompanyTypes: () => {},
  updateRoleTypes: () => {},
  updateStatuses: () => {},
})

// ─── Bottom navigation ────────────────────────────────────────────────────────
function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    {
      path: '/',
      label: 'Home',
      icon: (active) => (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      path: '/contacts',
      label: 'Contacts',
      icon: (active) => (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: (active) => (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  const activeTab = location.pathname === '/'
    ? '/'
    : location.pathname.startsWith('/contacts')
    ? '/contacts'
    : '/settings'

  return (
    <nav className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-area-bottom shrink-0">
      <div className="flex">
        {tabs.map((tab) => {
          const active = activeTab === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[60px] py-2 gap-0.5 transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {tab.icon(active)}
              <span className={`text-[10px] font-semibold ${active ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ─── App inner (needs router context) ────────────────────────────────────────
function AppInner() {
  const navigate = useNavigate()
  const { settings } = useContext(SettingsContext)

  // Hardware back button (Android)
  useEffect(() => {
    let listener = null
    const setup = async () => {
      try {
        const { App: CapacitorApp } = await import('@capacitor/app')
        listener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) navigate(-1)
          else CapacitorApp.exitApp()
        })
      } catch {
        // Browser environment — no-op
      }
    }
    setup()
    return () => { listener?.remove?.() }
  }, [navigate])

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/contacts" element={<ContactsScreen />} />
          <Route path="/contacts/new" element={<AddEditContactScreen />} />
          <Route path="/contacts/:id" element={<ContactDetailScreen />} />
          <Route path="/contacts/:id/edit" element={<AddEditContactScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/settings/lists" element={<ListOptionsScreen />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { toasts, showToast, removeToast } = useToast()
  const { settings, loading: settingsLoading, updateSettings } = useSettings()
  const initDone = useRef(false)

  // Initialize storage once
  useEffect(() => {
    if (initDone.current) return
    initDone.current = true

    const init = async () => {
      try {
        await initializeStorage()
      } catch (e) {
        showToast(`Storage init failed: ${e.message}`, 'error')
      }

      try {
        await createNotificationChannel()
        await requestNotificationPermission()
      } catch {
        // Silently fail in browser
      }
    }

    init()
  }, [showToast])

  // Apply dark mode based on settings
  useEffect(() => {
    if (!settings) return
    const html = document.documentElement

    if (settings.darkMode === 'dark') {
      html.classList.add('dark')
    } else if (settings.darkMode === 'light') {
      html.classList.remove('dark')
    } else {
      // 'system'
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.matches ? html.classList.add('dark') : html.classList.remove('dark')

      const handler = (e) => {
        e.matches ? html.classList.add('dark') : html.classList.remove('dark')
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [settings?.darkMode])

  const listOptionsValue = {
    companyTypes: settings?.companyTypes ?? DEFAULT_SETTINGS.companyTypes,
    roleTypes:    settings?.roleTypes    ?? DEFAULT_SETTINGS.roleTypes,
    statuses:     settings?.statuses     ?? DEFAULT_SETTINGS.statuses,
    updateCompanyTypes: (list) => updateSettings({ companyTypes: list }),
    updateRoleTypes:    (list) => updateSettings({ roleTypes: list }),
    updateStatuses:     (list) => updateSettings({ statuses: list }),
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <SettingsContext.Provider value={{ settings }}>
        <ListOptionsContext.Provider value={listOptionsValue}>
          <MemoryRouter>
            <AppInner />
            <ToastContainer toasts={toasts} onRemove={removeToast} />
          </MemoryRouter>
        </ListOptionsContext.Provider>
      </SettingsContext.Provider>
    </ToastContext.Provider>
  )
}
