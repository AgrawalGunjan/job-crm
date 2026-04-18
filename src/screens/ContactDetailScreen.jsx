import { useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContacts } from '../hooks/useContacts.js'
import { useConversations } from '../hooks/useConversations.js'
import ContactDetail from '../components/contacts/ContactDetail.jsx'
import ConversationList from '../components/conversations/ConversationList.jsx'
import AIChatTab from '../components/chat/AIChatTab.jsx'
import ContactActions from '../components/common/ContactActions.jsx'
import Modal from '../components/common/Modal.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { ToastContext } from '../App.jsx'

async function haptic(type = 'medium') {
  try {
    if (type === 'error') {
      await Haptics.notification({ type: NotificationType.Error })
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium })
    }
  } catch {}
}

export default function ContactDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { contacts, loading, deleteContact, updateContact } = useContacts()
  const { conversations, loading: convLoading, addTextConversation, addAudioConversation, deleteConversation } = useConversations(id)
  const { showToast } = useContext(ToastContext)

  const [tab, setTab] = useState('profile')
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const contact = contacts.find((c) => c.id === id)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
        <div className="px-4 pt-5 pb-3 flex items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-semibold text-gray-900 dark:text-white">Contact not found</span>
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteContact(id)
      await haptic()
      showToast(`${contact.fullName} deleted`, 'success')
      navigate(-1)
    } catch (e) {
      await haptic('error')
      showToast(`Failed to delete: ${e.message}`, 'error')
      setDeleting(false)
    }
  }

  const handleAddText = async (content) => {
    try {
      await addTextConversation(content)
      await haptic()
      showToast('Note saved', 'success')
    } catch (e) {
      await haptic('error')
      showToast(`Failed to save note: ${e.message}`, 'error')
    }
  }

  const handleAddAudio = async (base64) => {
    try {
      await addAudioConversation(base64)
      await haptic()
      showToast('Recording saved', 'success')
    } catch (e) {
      await haptic('error')
      showToast(`Failed to save recording: ${e.message}`, 'error')
    }
  }

  const handleDeleteConversation = async (entryId) => {
    try {
      await deleteConversation(entryId)
      await haptic()
      showToast('Entry deleted', 'success')
    } catch (e) {
      await haptic('error')
      showToast(`Failed to delete: ${e.message}`, 'error')
    }
  }

  const handleUpdateNextStep = async ({ nextContactDate, nextContactPurpose }) => {
    try {
      await updateContact(id, { nextContactDate, nextContactPurpose })
      await haptic()
      showToast('Next step updated', 'success')
    } catch (e) {
      await haptic('error')
      showToast(`Failed to update: ${e.message}`, 'error')
      throw e
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Nav bar */}
      <div className="flex items-center gap-2 px-2 pt-4 pb-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* Tabs */}
        <div className="flex gap-1 flex-1">
          <button
            onClick={() => setTab('profile')}
            className={`min-h-[36px] px-4 rounded-lg text-sm font-semibold transition-all ${
              tab === 'profile'
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setTab('conversations')}
            className={`min-h-[36px] px-4 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              tab === 'conversations'
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Conversations
            {conversations.length > 0 && (
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {conversations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('ai')}
            className={`min-h-[36px] px-4 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              tab === 'ai'
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            AI
          </button>
        </div>
        {/* Call + WA always visible in nav */}
        <ContactActions phone={contact.phone} size="sm" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'profile' && (
          <ContactDetail
            contact={contact}
            onEdit={() => navigate(`/contacts/${id}/edit`)}
            onDelete={() => setDeleteModal(true)}
          />
        )}
        {tab === 'conversations' && (
          <ConversationList
            conversations={conversations}
            loading={convLoading}
            onAddText={handleAddText}
            onAddAudio={handleAddAudio}
            onDelete={handleDeleteConversation}
            onUpdateNextStep={handleUpdateNextStep}
          />
        )}
        {tab === 'ai' && (
          <AIChatTab contact={contact} conversations={conversations} />
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Contact"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="flex-1 min-h-[44px] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 min-h-[44px] bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{contact.fullName}</strong>? This will also delete all their conversation history and recordings. This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
