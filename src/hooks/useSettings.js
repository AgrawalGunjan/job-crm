import { useState, useEffect, useCallback } from 'react'
import { getSettings, saveSettings } from '../services/fileService.js'

export function useSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateSettings = useCallback(
    async (updates) => {
      const next = { ...settings, ...updates }
      setSettings(next)
      await saveSettings(next)
      return next
    },
    [settings]
  )

  return { settings, loading, error, updateSettings, reload: load }
}
