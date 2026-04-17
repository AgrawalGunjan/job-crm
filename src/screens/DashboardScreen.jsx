import { useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContacts } from '../hooks/useContacts.js'
import { isToday, isTomorrow } from '../utils/dateUtils.js'
import { scheduleContactReminders } from '../services/notificationService.js'
import StatsBar from '../components/dashboard/StatsBar.jsx'
import AgendaCard from '../components/dashboard/AgendaCard.jsx'
import TomorrowStrip from '../components/dashboard/TomorrowStrip.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { SettingsContext } from '../App.jsx'

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { contacts, loading } = useContacts()
  const { settings } = useContext(SettingsContext)

  const todayContacts = contacts
    .filter((c) => isToday(c.nextContactDate))
    .sort((a, b) => a.fullName.localeCompare(b.fullName))

  const tomorrowContacts = contacts.filter((c) => isTomorrow(c.nextContactDate))

  useEffect(() => {
    if (contacts.length > 0 && settings?.notificationsEnabled) {
      scheduleContactReminders(contacts, settings.reminderTime)
    }
  }, [contacts, settings])

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">JobFlow</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your job search CRM</p>
          </div>
          <button
            onClick={() => navigate('/contacts/new')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-blue-600 text-white active:scale-95 transition-all"
            aria-label="Add contact"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <StatsBar contacts={contacts} />

          {/* Tomorrow alert */}
          <TomorrowStrip
            contacts={tomorrowContacts}
            onContactClick={(c) => navigate(`/contacts/${c.id}`)}
          />

          {/* Today's agenda */}
          <div className="px-4 pb-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Today's Agenda
                {todayContacts.length > 0 && (
                  <span className="ml-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {todayContacts.length}
                  </span>
                )}
              </h2>
              <button
                onClick={() => navigate('/contacts')}
                className="min-h-[36px] text-xs text-blue-600 dark:text-blue-400 font-semibold px-2"
              >
                All contacts →
              </button>
            </div>

            {todayContacts.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title={contacts.length === 0 ? 'No contacts yet' : 'You\'re all clear today'}
                subtitle={
                  contacts.length === 0
                    ? 'Add your first contact to start tracking your job search.'
                    : 'No follow-ups scheduled for today. Check the Contacts tab to plan ahead.'
                }
                action={
                  contacts.length === 0
                    ? { label: 'Add First Contact', onClick: () => navigate('/contacts/new') }
                    : null
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                {todayContacts.map((contact) => (
                  <AgendaCard
                    key={contact.id}
                    contact={contact}
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/contacts/new')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all z-30"
        aria-label="Add contact"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
