import { useContext } from 'react'
import Badge from '../common/Badge.jsx'
import ContactActions from '../common/ContactActions.jsx'
import { formatDisplayDate, formatRelativeDate, isPast, isToday } from '../../utils/dateUtils.js'
import { ListOptionsContext } from '../../App.jsx'

function Row({ label, value }) {
  if (!value && value !== false) return null
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-white break-all">{String(value)}</span>
    </div>
  )
}

// Tappable LinkedIn row — opens in LinkedIn app (if installed) or browser via Android intent.
function LinkedInRow({ url }) {
  if (!url) return null
  const handleOpen = () => {
    // _system hands the URL to Android's intent system.
    // The LinkedIn app registers as a handler for linkedin.com URLs,
    // so it opens in-app when installed; falls back to browser otherwise.
    window.open(url, '_system')
  }
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        LinkedIn
      </span>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 break-all text-left"
      >
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {url}
      </button>
    </div>
  )
}

export default function ContactDetail({ contact, onEdit, onDelete }) {
  const { companyTypes, roleTypes } = useContext(ListOptionsContext)
  if (!contact) return null

  const dueToday = isToday(contact.nextContactDate)
  const overdue = isPast(contact.nextContactDate)
  const companyTypeLabel = companyTypes.find((t) => t.value === contact.companyType)?.label ?? contact.companyType
  const roleTypeLabel = roleTypes.find((t) => t.value === contact.targetRoleType)?.label ?? contact.targetRoleType

  return (
    <div>
      {/* Header */}
      <div className="px-5 py-5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {contact.fullName}
            </h1>
            {(contact.jobTitle || contact.company) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {[contact.jobTitle, contact.company].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>

          {/* Compact icon actions: Edit + Delete */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 active:scale-95 transition-all"
              aria-label="Edit contact"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 active:scale-95 transition-all"
              aria-label="Delete contact"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Badge + Call/WhatsApp icons row */}
        <div className="flex items-center justify-between mt-3">
          <Badge status={contact.status} size="md" />
          <ContactActions phone={contact.phone} size="lg" />
        </div>
      </div>

      {/* Next follow-up card */}
      {contact.nextContactDate && (
        <div
          className={`mx-4 my-3 px-4 py-3 rounded-2xl border ${
            overdue
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40'
              : dueToday
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/40'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <svg
                className={`w-4 h-4 shrink-0 ${overdue ? 'text-red-500' : dueToday ? 'text-blue-500' : 'text-gray-400'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${overdue ? 'text-red-700 dark:text-red-400' : dueToday ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {formatRelativeDate(contact.nextContactDate)}
                </p>
                {contact.nextContactPurpose && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {contact.nextContactPurpose}
                  </p>
                )}
              </div>
            </div>
            {/* Inline info chip */}
            <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-lg ${
              overdue ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : dueToday ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {overdue ? 'Overdue' : dueToday ? 'Today' : 'Upcoming'}
            </span>
          </div>
        </div>
      )}

      {/* Profile fields */}
      <div className="px-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 mt-3">
          Contact Info
        </p>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4">
          <Row label="Email" value={contact.email} />
          <Row label="Phone" value={contact.phone} />
          <LinkedInRow url={contact.linkedIn} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 mt-4">
          Role & Company
        </p>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4">
          <Row label="Company" value={contact.company} />
          <Row label="Their Title" value={contact.jobTitle} />
          <Row label="Company Type" value={companyTypeLabel} />
          <Row label="Target Role" value={contact.targetRole} />
          <Row label="Role Type" value={roleTypeLabel} />
          <Row label="Open Position" value={contact.hasOpenPosition ? 'Yes' : undefined} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 mt-4">
          Context
        </p>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4">
          <Row label="Referred By" value={contact.referredBy} />
          <Row label="Notes" value={contact.notes} />
          <Row label="Added" value={contact.createdAt ? formatDisplayDate(contact.createdAt) : null} />
        </div>
      </div>
    </div>
  )
}
