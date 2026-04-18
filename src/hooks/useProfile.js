import { useState, useEffect, useCallback } from 'react'
import {
  getProfileInfo,
  saveProfileInfo,
  getProfileResume,
  saveProfileResume,
  getProfileFiles,
  saveProfileFile,
  deleteProfileFile,
} from '../services/fileService.js'

export function useProfile() {
  const [info, setInfo] = useState(null)
  const [resume, setResume] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileInfo, profileResume, profileFiles] = await Promise.all([
        getProfileInfo(),
        getProfileResume(),
        getProfileFiles(),
      ])
      setInfo(profileInfo)
      setResume(profileResume)
      setFiles(profileFiles)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateInfo = useCallback(async (updates) => {
    const updated = { ...info, ...updates }
    await saveProfileInfo(updated)
    setInfo(updated)
  }, [info])

  const updateResume = useCallback(async (text) => {
    await saveProfileResume(text)
    setResume(text)
  }, [])

  const addFile = useCallback(async (filename, content) => {
    await saveProfileFile(filename, content)
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.filename !== filename)
      return [...filtered, { filename, content }]
    })
  }, [])

  const removeFile = useCallback(async (filename) => {
    await deleteProfileFile(filename)
    setFiles((prev) => prev.filter((f) => f.filename !== filename))
  }, [])

  return {
    info,
    resume,
    files,
    loading,
    error,
    reload: load,
    updateInfo,
    updateResume,
    addFile,
    removeFile,
  }
}
