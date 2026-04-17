import { useState } from 'react'
import Badge from '../common/Badge.jsx'
import ContactActions from '../common/ContactActions.jsx'

export default function AgendaCard({ contact, onClick }) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="w-full text-left bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border-l-4 border-blue-500 border-t border-r border-b border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all cursor-pointer select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {contact.fullName}
          </p>
          {contact.company && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.company}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge status={contact.status} />
        </div>
      </div>

      {/* Next step row */}
      {contact.nextContactPurpose && (
        <div className="mt-2 flex items-center gap-1.5">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate flex-1">
            {contact.nextContactPurpose}
          </p>
          {/* Info icon */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowInfo((v) => !v)
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              aria-label="Next step info"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showInfo && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => { e.stopPropagation(); setShowInfo(false) }}
                />
                <div className="absolute right-0 bottom-8 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 w-56">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Next Step</p>
                  <p className="text-sm text-gray-800 dark:text-white leading-snug">{contact.nextContactPurpose}</p>
                  {contact.nextContactDate && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 font-medium">{contact.nextContactDate}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom row: open position + actions */}
      <div className="mt-2 flex items-center justify-between">
        {contact.hasOpenPosition ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Has open position</p>
        ) : <span />}
        {contact.phone && (
          <ContactActions phone={contact.phone} size="sm" />
        )}
      </div>
    </div>
  )
}
