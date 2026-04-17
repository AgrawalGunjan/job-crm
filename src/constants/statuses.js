export const STATUSES = {
  active: {
    label: 'Active',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    dot: 'bg-green-500',
    border: 'border-green-200 dark:border-green-800',
  },
  warm: {
    label: 'Warm',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
  },
  cold: {
    label: 'Cold',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    dot: 'bg-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
  hired: {
    label: 'Hired',
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-800 dark:text-teal-300',
    dot: 'bg-teal-500',
    border: 'border-teal-200 dark:border-teal-800',
  },
  closed: {
    label: 'Closed',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    border: 'border-red-200 dark:border-red-800',
  },
}

export const STATUS_OPTIONS = Object.entries(STATUSES).map(([value, config]) => ({
  value,
  label: config.label,
}))
