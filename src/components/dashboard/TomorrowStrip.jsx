export default function TomorrowStrip({ contacts, onContactClick }) {
  if (!contacts.length) return null

  return (
    <div className="px-4 mb-2">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-3">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Tomorrow · {contacts.length} follow-up{contacts.length !== 1 ? 's' : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          {contacts.slice(0, 5).map((contact) => (
            <button
              key={contact.id}
              onClick={() => onContactClick?.(contact)}
              className="min-h-[32px] px-3 py-1 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800/60 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 active:scale-95 transition-all truncate max-w-[140px]"
            >
              {contact.fullName}
            </button>
          ))}
          {contacts.length > 5 && (
            <span className="min-h-[32px] px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center">
              +{contacts.length - 5} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
