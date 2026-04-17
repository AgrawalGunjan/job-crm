import { useContext } from 'react'
import { ListOptionsContext } from '../../App.jsx'

const COLOR_MAP = {
  green:  { bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-800 dark:text-green-300',   dot: 'bg-green-500'  },
  amber:  { bg: 'bg-amber-100 dark:bg-amber-900/30',    text: 'text-amber-800 dark:text-amber-300',    dot: 'bg-amber-500'  },
  gray:   { bg: 'bg-gray-100 dark:bg-gray-800',         text: 'text-gray-600 dark:text-gray-400',      dot: 'bg-gray-400'   },
  teal:   { bg: 'bg-teal-100 dark:bg-teal-900/30',      text: 'text-teal-800 dark:text-teal-300',      dot: 'bg-teal-500'   },
  red:    { bg: 'bg-red-100 dark:bg-red-900/30',        text: 'text-red-700 dark:text-red-400',        dot: 'bg-red-500'    },
  blue:   { bg: 'bg-blue-100 dark:bg-blue-900/30',      text: 'text-blue-800 dark:text-blue-300',      dot: 'bg-blue-500'   },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30',  text: 'text-purple-800 dark:text-purple-300',  dot: 'bg-purple-500' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30',  text: 'text-orange-800 dark:text-orange-300',  dot: 'bg-orange-500' },
  pink:   { bg: 'bg-pink-100 dark:bg-pink-900/30',      text: 'text-pink-800 dark:text-pink-300',      dot: 'bg-pink-500'   },
}

export default function Badge({ status, size = 'sm' }) {
  const { statuses } = useContext(ListOptionsContext)
  const statusDef = statuses.find((s) => s.value === status)
  const label = statusDef?.label ?? status
  const colors = COLOR_MAP[statusDef?.color] ?? COLOR_MAP.gray
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} ${colors.bg} ${colors.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  )
}
