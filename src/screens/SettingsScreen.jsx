import { useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings.js'
import { exportAllData, importContacts } from '../services/fileService.js'
import {
  requestNotificationPermission,
  checkNotificationPermission,
} from '../services/notificationService.js'
import { requestMicrophonePermission } from '../services/audioService.js'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { ToastContext } from '../App.jsx'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

// ─── CSV helpers ──────────────────────────────────────────────────────────────

const FIELD_MAP = {
  fullname: 'fullName', name: 'fullName', 'full name': 'fullName',
  phone: 'phone', mobile: 'phone', telephone: 'phone',
  email: 'email',
  company: 'company',
  jobtitle: 'jobTitle', 'job title': 'jobTitle', title: 'jobTitle', role: 'jobTitle',
  linkedin: 'linkedIn', 'linkedin url': 'linkedIn',
  status: 'status',
  notes: 'notes',
  targetrole: 'targetRole', 'target role': 'targetRole',
  referredby: 'referredBy', 'referred by': 'referredBy',
  reference: 'referredBy', referral: 'referredBy',
}

function splitCSVRow(row) {
  const result = []
  let cur = '', inQuote = false
  for (const ch of row) {
    if (ch === '"') { inQuote = !inQuote }
    else if (ch === ',' && !inQuote) { result.push(cur); cur = '' }
    else { cur += ch }
  }
  result.push(cur)
  return result
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = splitCSVRow(lines[0]).map((h) => h.toLowerCase().trim())
  const fields = headers.map((h) => FIELD_MAP[h] ?? null)
  return lines.slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const cells = splitCSVRow(line)
      const obj = {}
      fields.forEach((f, i) => { if (f) obj[f] = cells[i]?.trim() ?? '' })
      return obj
    })
}

async function haptic() {
  try { await Haptics.impact({ style: ImpactStyle.Light }) } catch {}
}

function SettingRow({ label, subtitle, children }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0 gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsScreen() {
  const navigate = useNavigate()
  const { settings, loading, updateSettings } = useSettings()
  const { showToast } = useContext(ToastContext)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const csvInputRef = useRef(null)

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      const added = await importContacts(rows)
      showToast(
        added > 0
          ? `${added} contact${added !== 1 ? 's' : ''} imported`
          : 'No new contacts found',
        added > 0 ? 'success' : 'info'
      )
    } catch (err) {
      showToast(`Import failed: ${err.message}`, 'error')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const toggle = async (key) => {
    await haptic()
    await updateSettings({ [key]: !settings[key] })
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const json = await exportAllData()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jobflow-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('Data exported successfully', 'success')
    } catch (e) {
      showToast(`Export failed: ${e.message}`, 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      showToast('Notification permission granted', 'success')
    } else {
      showToast('Permission denied — enable in device settings', 'error')
    }
  }

  const handleRequestMic = async () => {
    const granted = await requestMicrophonePermission()
    if (granted) {
      showToast('Microphone permission granted', 'success')
    } else {
      showToast('Permission denied — enable in device settings', 'error')
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Reminders */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-3 pb-1">
            Reminders
          </p>
          <SettingRow
            label="Push Notifications"
            subtitle="Get reminded about upcoming follow-ups"
          >
            <button
              onClick={() => toggle('notificationsEnabled')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              role="switch"
              aria-checked={settings.notificationsEnabled}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </SettingRow>
          <SettingRow
            label="Reminder Time"
            subtitle="Daily reminder fires at this time"
          >
            <input
              type="time"
              className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[36px]"
              value={settings.reminderTime}
              onChange={async (e) => {
                await haptic()
                await updateSettings({ reminderTime: e.target.value })
              }}
            />
          </SettingRow>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-3 pb-1">
            Appearance
          </p>
          <SettingRow label="Dark Mode">
            <select
              className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[36px]"
              value={settings.darkMode}
              onChange={async (e) => {
                await haptic()
                await updateSettings({ darkMode: e.target.value })
                // Apply immediately
                const html = document.documentElement
                if (e.target.value === 'dark') html.classList.add('dark')
                else if (e.target.value === 'light') html.classList.remove('dark')
                else {
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                  isDark ? html.classList.add('dark') : html.classList.remove('dark')
                }
              }}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </SettingRow>
        </div>

        {/* Permissions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-3 pb-1">
            Permissions
          </p>
          <SettingRow label="Notifications" subtitle="Required for follow-up reminders">
            <button
              onClick={handleRequestNotif}
              className="min-h-[36px] px-3 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Request
            </button>
          </SettingRow>
          <SettingRow label="Microphone" subtitle="Required for audio recordings">
            <button
              onClick={handleRequestMic}
              className="min-h-[36px] px-3 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Request
            </button>
          </SettingRow>
        </div>

        {/* Lists */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-3 pb-1">
            Lists
          </p>
          <button
            onClick={() => navigate('/settings/lists')}
            className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0 gap-3"
          >
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Manage dropdown values</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Statuses · Company Types · Role Types</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Data */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-3 pb-1">
            Data
          </p>
          {/* Hidden CSV file input */}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVImport}
          />
          <SettingRow
            label="Import from CSV"
            subtitle="Columns: fullName, phone, email, company, reference…"
          >
            <button
              onClick={() => csvInputRef.current?.click()}
              disabled={importing}
              className="min-h-[36px] px-3 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
            >
              {importing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              {importing ? 'Importing…' : 'Import'}
            </button>
          </SettingRow>
          <SettingRow
            label="Export All Data"
            subtitle="Download contacts & conversations as JSON"
          >
            <button
              onClick={handleExport}
              disabled={exporting}
              className="min-h-[36px] px-3 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
            >
              {exporting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {exporting ? 'Exporting…' : 'Export'}
            </button>
          </SettingRow>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-3 pb-1">
            About
          </p>
          <SettingRow label="Version">
            <span className="text-sm text-gray-500 dark:text-gray-400">{settings.appVersion}</span>
          </SettingRow>
          <SettingRow label="Storage" subtitle="All data stored locally on this device">
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Offline</span>
          </SettingRow>
        </div>
      </div>
    </div>
  )
}
