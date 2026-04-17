/**
 * Reusable call + WhatsApp action buttons.
 * Always renders — shows greyed disabled buttons when no phone number is stored,
 * so the user knows the feature exists and can edit the contact to add one.
 * Always stops propagation so parent card navigation isn't triggered.
 */

function cleanPhone(phone) {
  return phone ? phone.replace(/[^\d+]/g, '') : ''
}

export default function ContactActions({ phone, size = 'sm', className = '' }) {
  const hasPhone = Boolean(phone && cleanPhone(phone))
  const dialNumber = cleanPhone(phone)
  const waNumber = dialNumber.replace(/^\+/, '')

  const handleCall = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!hasPhone) return
    window.location.href = `tel:${dialNumber}`
  }

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!hasPhone) return
    window.open(`https://wa.me/${waNumber}`, '_blank', 'noopener')
  }

  const btnBase =
    size === 'sm'
      ? 'min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center transition-all'
      : 'min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all'

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className={`flex items-center gap-1.5 ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Call */}
      <button
        onClick={handleCall}
        disabled={!hasPhone}
        className={`${btnBase} ${
          hasPhone
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 active:scale-90'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
        }`}
        aria-label={hasPhone ? `Call ${dialNumber}` : 'No phone number — edit contact to add one'}
        title={hasPhone ? 'Call' : 'Add phone number to call'}
      >
        <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
        </svg>
      </button>

      {/* WhatsApp */}
      <button
        onClick={handleWhatsApp}
        disabled={!hasPhone}
        className={`${btnBase} ${
          hasPhone
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 active:scale-90'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
        }`}
        aria-label={hasPhone ? `WhatsApp ${dialNumber}` : 'No phone number — edit contact to add one'}
        title={hasPhone ? 'WhatsApp' : 'Add phone number for WhatsApp'}
      >
        <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>
    </div>
  )
}
