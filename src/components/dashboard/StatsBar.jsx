function StatChip({ label, value, color }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-2xl min-w-[80px] ${color}`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs font-medium opacity-80 mt-0.5">{label}</span>
    </div>
  )
}

export default function StatsBar({ contacts }) {
  const total = contacts.length
  const active = contacts.filter((c) => c.status === 'active').length
  const warm = contacts.filter((c) => c.status === 'warm').length
  const openPositions = contacts.filter((c) => c.hasOpenPosition).length
  const hired = contacts.filter((c) => c.status === 'hired').length

  return (
    <div className="px-4 py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <StatChip label="Total" value={total} color="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" />
        <StatChip label="Active" value={active} color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" />
        <StatChip label="Warm" value={warm} color="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" />
        <StatChip label="Openings" value={openPositions} color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" />
        {hired > 0 && (
          <StatChip label="Hired" value={hired} color="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" />
        )}
      </div>
    </div>
  )
}
