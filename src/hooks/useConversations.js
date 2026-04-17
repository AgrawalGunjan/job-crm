import { useState, useEffect, useCallback } from 'react'
import { getConversations, saveConversations, saveAudioFile } from '../services/fileService.js'
import { generateId } from '../utils/idUtils.js'

export function useConversations(contactId) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!contactId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getConversations(contactId)
      setConversations(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [contactId])

  useEffect(() => {
    load()
  }, [load])

  const addTextConversation = useCallback(
    async (content) => {
      const now = new Date().toISOString()
      const entry = {
        id: generateId(),
        contactId,
        date: now,
        type: 'text',
        content,
        audioFile: null,
        createdAt: now,
      }
      const next = [entry, ...conversations]
      await saveConversations(contactId, next)
      setConversations(next)
      return entry
    },
    [contactId, conversations]
  )

  const addAudioConversation = useCallback(
    async (base64Audio, transcript = '') => {
      const now = new Date().toISOString()
      const timestamp = Date.now()
      const audioPath = await saveAudioFile(contactId, timestamp, base64Audio)

      const entry = {
        id: generateId(),
        contactId,
        date: now,
        type: 'audio',
        content: transcript,
        audioFile: audioPath,
        createdAt: now,
      }
      const next = [entry, ...conversations]
      await saveConversations(contactId, next)
      setConversations(next)
      return entry
    },
    [contactId, conversations]
  )

  const deleteConversation = useCallback(
    async (entryId) => {
      const next = conversations.filter((c) => c.id !== entryId)
      await saveConversations(contactId, next)
      setConversations(next)
    },
    [contactId, conversations]
  )

  return {
    conversations,
    loading,
    error,
    reload: load,
    addTextConversation,
    addAudioConversation,
    deleteConversation,
  }
}
