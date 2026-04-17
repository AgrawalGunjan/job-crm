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

// Full-width Call + WhatsApp buttons for the detail page.
// When phone is missing they're shown greyed with an "Edit to add" hint.
function ContactDetailCallButton({ phone, onEdit }) {
  const dialNumber = phone ? phone.replace(/[^\d+]/g, '') : ''
  const waNumber = dialNumber.replace(/^\+/, '')
  const hasPhone = Boolean(dialNumber)

  if (!hasPhone) {
    return (
      <button
        onClick={onEdit}
        className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl text-sm font-semibold active:scale-95 transition-all border border-dashed border-gray-300 dark:border-gray-700"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Add phone number to call / WhatsApp
      </button>
    )
  }

  return (
    <>
      <a
        href={`tel:${dialNumber}`}
        className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-semibold active:scale-95 transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
        </svg>
        Call
      </a>
      <a
        href={`https://wa.me/${waNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold active:scale-95 transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </a>
    </>
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
          <Badge status={contact.status} size="md" />
        </div>

        {/* Primary actions: Edit + Delete */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onEdit}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl text-sm font-semibold active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={onDelete}
            className="min-h-[44px] px-4 flex items-center justify-center gap-2 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>

        {/* Communication actions: Call + WhatsApp — always visible */}
        <div className="flex gap-2 mt-3">
          <ContactDetailCallButton phone={contact.phone} onEdit={onEdit} />
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
          <Row label="LinkedIn" value={contact.linkedIn} />
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
