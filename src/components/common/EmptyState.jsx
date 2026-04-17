export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">{subtitle}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="min-h-[44px] px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
