import { useState, useEffect, useCallback } from 'react'
import { getAIChat, saveAIChat } from '../services/fileService.js'
import { generateId } from '../utils/idUtils.js'

export function useAIChat(contactId) {
  const [messages, setMessages] = useState([])   // newest-first
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!contactId) return
    setLoading(true)
    setError(null)
    try {
      const stored = await getAIChat(contactId)
      setMessages(stored)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [contactId])

  useEffect(() => {
    load()
  }, [load])

  /**
   * Append a message (newest-first).
   * Returns the new message object so the caller can hold the id for later replacement.
   */
  const appendMessage = useCallback(async (role, content) => {
    const msg = {
      id: generateId(),
      role,
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => {
      const next = [msg, ...prev]
      saveAIChat(contactId, next).catch(() => {})
      return next
    })
    return msg
  }, [contactId])

  /**
   * Replace the content of a specific message by id (used to swap "…" placeholder).
   */
  const replaceLastAssistantMessage = useCallback((id, content) => {
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, content } : m))
      saveAIChat(contactId, next).catch(() => {})
      return next
    })
  }, [contactId])

  const clearChat = useCallback(async () => {
    setMessages([])
    await saveAIChat(contactId, [])
  }, [contactId])

  return {
    messages,
    loading,
    error,
    reload: load,
    appendMessage,
    replaceLastAssistantMessage,
    clearChat,
  }
}
