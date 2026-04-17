import { useState, useEffect, useCallback } from 'react'
import { getContacts, saveContacts, deleteContactData } from '../services/fileService.js'
import { generateId } from '../utils/idUtils.js'
import { DEFAULT_CONTACT } from '../constants/defaults.js'

export function useContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getContacts()
      setContacts(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addContact = useCallback(
    async (fields) => {
      const now = new Date().toISOString()
      const contact = {
        ...DEFAULT_CONTACT,
        ...fields,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      const next = [...contacts, contact]
      await saveContacts(next)
      setContacts(next)
      return contact
    },
    [contacts]
  )

  const updateContact = useCallback(
    async (id, fields) => {
      const next = contacts.map((c) =>
        c.id === id ? { ...c, ...fields, updatedAt: new Date().toISOString() } : c
      )
      await saveContacts(next)
      setContacts(next)
      return next.find((c) => c.id === id)
    },
    [contacts]
  )

  const deleteContact = useCallback(
    async (id) => {
      const next = contacts.filter((c) => c.id !== id)
      await saveContacts(next)
      await deleteContactData(id)
      setContacts(next)
    },
    [contacts]
  )

  const getContact = useCallback(
    (id) => contacts.find((c) => c.id === id) ?? null,
    [contacts]
  )

  return {
    contacts,
    loading,
    error,
    reload: load,
    addContact,
    updateContact,
    deleteContact,
    getContact,
  }
}
