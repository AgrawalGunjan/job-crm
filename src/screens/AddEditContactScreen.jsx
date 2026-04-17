import { useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContacts } from '../hooks/useContacts.js'
import ContactForm from '../components/contacts/ContactForm.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { ToastContext } from '../App.jsx'
import { useState } from 'react'

async function haptic(type = 'medium') {
  try {
    if (type === 'error') {
      await Haptics.notification({ type: NotificationType.Error })
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium })
    }
  } catch {}
}

export default function AddEditContactScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { contacts, loading, addContact, updateContact } = useContacts()
  const { showToast } = useContext(ToastContext)
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(id)
  const contact = isEdit ? contacts.find((c) => c.id === id) : null

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      if (isEdit) {
        await updateContact(id, values)
        await haptic()
        showToast('Contact updated', 'success')
        navigate(`/contacts/${id}`)
      } else {
        const created = await addContact(values)
        await haptic()
        showToast('Contact added', 'success')
        navigate(`/contacts/${created.id}`)
      }
    } catch (e) {
      await haptic('error')
      showToast(`Failed to save: ${e.message}`, 'error')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-4 pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Contact' : 'New Contact'}
        </h1>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <ContactForm
          initialValues={contact ?? {}}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          isLoading={saving}
          showToast={showToast}
        />
      </div>
    </div>
  )
}
