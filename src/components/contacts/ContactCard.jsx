import { useState } from 'react'
import Badge from '../common/Badge.jsx'
import ContactActions from '../common/ContactActions.jsx'
import { formatRelativeDate, isToday, isPast } from '../../utils/dateUtils.js'

export default function ContactCard({ contact, onClick }) {
  const [showInfo, setShowInfo] = useState(false)
  const dueToday = isToday(contact.nextContactDate)
  const overdue = isPast(contact.nextContactDate)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="w-full text-left bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all min-h-[76px] flex flex-col gap-2 cursor-pointer select-none"
    >
      {/* Row 1: name + badge + call/WA */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {contact.fullName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {[contact.jobTitle, contact.company].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge status={contact.status} />
          <ContactActions phone={contact.phone} size="sm" />
        </div>
      </div>

      {/* Row 2: next contact date + info icon popover */}
      {contact.nextContactDate && (
        <div className="flex items-center gap-1.5">
          <svg
            className={`w-3.5 h-3.5 shrink-0 ${
              overdue
                ? 'text-red-500'
                : dueToday
                ? 'text-blue-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span
            className={`text-xs ${
              overdue
                ? 'text-red-600 dark:text-red-400'
                : dueToday
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {formatRelativeDate(contact.nextContactDate)}
          </span>

          {/* Info icon + popover */}
          {contact.nextContactPurpose && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowInfo((v) => !v)
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                aria-label="Next step info"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              {showInfo && (
                <>
                  {/* Backdrop to dismiss */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowInfo(false)
                    }}
                  />
                  <div className="absolute left-0 bottom-7 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 w-52">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Next Step
                    </p>
                    <p className="text-sm text-gray-800 dark:text-white leading-snug">
                      {contact.nextContactPurpose}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Row 3: open position badge */}
      {contact.hasOpenPosition && (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Open position
        </span>
      )}
    </div>
  )
}
