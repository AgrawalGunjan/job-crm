import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings.js'
import { callLLM } from '../services/llmService.js'
import { LLM_PRESETS } from '../constants/defaults.js'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { ToastContext } from '../App.jsx'

export default function LLMSettingsScreen() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useSettings()
  const { showToast } = useContext(ToastContext)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)

  const llm = settings?.llmProvider ?? {
    provider: 'nvidia',
    apiKey: '',
    baseUrl: '',
    model: '',
  }

  const updateLLM = (patch) => {
    updateSettings({ llmProvider: { ...llm, ...patch } })
  }

  const selectedPreset = LLM_PRESETS.find((p) => p.id === llm.provider) ?? null

  const handlePreset = (preset) => {
    updateSettings({
      llmProvider: {
        ...llm,
        provider: preset.id,
        baseUrl: preset.baseUrl,
        model: preset.model,
      },
    })
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const result = await callLLM(
        [
          { role: 'system', content: 'You are a test assistant. Reply with exactly: Connection OK' },
          { role: 'user', content: 'Test' },
        ],
        llm
      )
      showToast(result.trim().startsWith('Connection') ? 'Connected! ' + result.trim() : `Reply: ${result.trim()}`, 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setTesting(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Provider Presets */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-3">
            Provider
          </p>
          <div className="grid grid-cols-2 gap-2">
            {LLM_PRESETS.map((preset) => {
              const active = llm.provider === preset.id
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePreset(preset)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors text-left ${
                    active
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-3">
            Configuration
          </p>

          <div className="flex flex-col gap-3">
            {/* API Key */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">API Key</label>
              <div className="relative mt-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={llm.apiKey}
                  onChange={(e) => updateLLM({ apiKey: e.target.value })}
                  placeholder="sk-… or nvapi-…"
                  className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                >
                  {showKey ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {llm.provider === 'ollama' && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Leave blank for local Ollama (no key required)
                </p>
              )}
            </div>

            {/* Base URL */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Base URL</label>
              <input
                type="text"
                value={llm.baseUrl}
                onChange={(e) => updateLLM({ baseUrl: e.target.value, provider: 'custom' })}
                placeholder="https://api.openai.com/v1"
                className="mt-1 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Model */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Model</label>
              <input
                type="text"
                value={llm.model}
                onChange={(e) => updateLLM({ model: e.target.value })}
                placeholder="gpt-4o-mini"
                className="mt-1 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Test Connection */}
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="w-full min-h-[48px] text-sm font-semibold bg-blue-600 text-white rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {testing ? <LoadingSpinner size="sm" /> : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {testing ? 'Testing…' : 'Test Connection'}
        </button>

        {/* Help note for Ollama */}
        {llm.provider === 'ollama' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl px-4 py-3">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Ollama (local) note</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              Android blocks cleartext HTTP by default. To allow Ollama on <code>localhost:11434</code>,
              add <code>127.0.0.1</code> to <code>network_security_config.xml</code> in the Android project.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
