import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListOptionsContext } from '../App.jsx'
import { ToastContext } from '../App.jsx'

// ─── Color palette ────────────────────────────────────────────────────────────
const COLORS = [
  { name: 'green',  dot: 'bg-green-500'  },
  { name: 'amber',  dot: 'bg-amber-500'  },
  { name: 'gray',   dot: 'bg-gray-400'   },
  { name: 'teal',   dot: 'bg-teal-500'   },
  { name: 'red',    dot: 'bg-red-500'    },
  { name: 'blue',   dot: 'bg-blue-500'   },
  { name: 'purple', dot: 'bg-purple-500' },
  { name: 'orange', dot: 'bg-orange-500' },
  { name: 'pink',   dot: 'bg-pink-500'   },
]

// ─── Slug helper ──────────────────────────────────────────────────────────────
function slugify(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ─── Color picker row (statuses only) ────────────────────────────────────────
function ColorPicker({ selected, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {COLORS.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onChange(c.name)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${c.dot} ${
            selected === c.name
              ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110'
              : 'opacity-70 hover:opacity-100'
          }`}
          aria-label={c.name}
        />
      ))}
    </div>
  )
}

// ─── Inline add form ──────────────────────────────────────────────────────────
function AddItemForm({ withColor, onSave, onCancel }) {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('blue')

  const handleSave = () => {
    const trimmed = label.trim()
    if (!trimmed) return
    const value = slugify(trimmed)
    onSave(withColor ? { value, label: trimmed, color } : { value, label: trimmed })
  }

  return (
    <div className="mt-2 px-3 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-col gap-2">
      <input
        type="text"
        autoFocus
        placeholder="Label…"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
        className="min-h-[40px] px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      />
      {withColor && <ColorPicker selected={color} onChange={setColor} />}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-[36px] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!label.trim()}
          className="flex-1 min-h-[36px] bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  )
}

// ─── Inline edit form ─────────────────────────────────────────────────────────
function EditItemForm({ item, withColor, onSave, onCancel }) {
  const [label, setLabel] = useState(item.label)
  const [color, setColor] = useState(item.color ?? 'blue')

  const handleSave = () => {
    const trimmed = label.trim()
    if (!trimmed) return
    onSave(withColor ? { ...item, label: trimmed, color } : { ...item, label: trimmed })
  }

  return (
    <div className="mt-2 px-3 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-col gap-2">
      <input
        type="text"
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
        className="min-h-[40px] px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      />
      {withColor && <ColorPicker selected={color} onChange={setColor} />}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-[36px] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!label.trim()}
          className="flex-1 min-h-[36px] bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  )
}

// ─── List section card ────────────────────────────────────────────────────────
function ListSection({ title, items, withColor, onUpdate, colorDotClass }) {
  const { showToast } = useContext(ToastContext)
  const [editingIdx, setEditingIdx] = useState(null)
  const [adding, setAdding] = useState(false)

  const moveUp = (i) => {
    if (i === 0) return
    const next = [...items]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    onUpdate(next)
  }

  const moveDown = (i) => {
    if (i === items.length - 1) return
    const next = [...items]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    onUpdate(next)
  }

  const handleEdit = (i, updated) => {
    const next = items.map((item, idx) => (idx === i ? updated : item))
    onUpdate(next)
    setEditingIdx(null)
    showToast('Updated', 'success')
  }

  const handleDelete = (i) => {
    const next = items.filter((_, idx) => idx !== i)
    onUpdate(next)
    showToast(`Deleted "${items[i].label}"`, 'info')
  }

  const handleAdd = (newItem) => {
    // Prevent duplicate values
    if (items.some((it) => it.value === newItem.value)) {
      showToast('A similar value already exists', 'error')
      return
    }
    onUpdate([...items, newItem])
    setAdding(false)
    showToast(`"${newItem.label}" added`, 'success')
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
        {title}
      </p>

      <div className="flex flex-col gap-0.5">
        {items.map((item, i) => {
          // Find dot class for status color
          const dotCls = withColor
            ? (COLORS.find((c) => c.name === item.color)?.dot ?? 'bg-gray-400')
            : null

          return (
            <div key={item.value}>
              {editingIdx === i ? (
                <EditItemForm
                  item={item}
                  withColor={withColor}
                  onSave={(updated) => handleEdit(i, updated)}
                  onCancel={() => setEditingIdx(null)}
                />
              ) : (
                <div className="flex items-center gap-2 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  {/* Color dot (statuses) */}
                  {withColor && dotCls && (
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotCls}`} />
                  )}

                  {/* Label */}
                  <span className="flex-1 text-sm text-gray-900 dark:text-white">
                    {item.label}
                  </span>

                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      className="w-5 h-5 flex items-center justify-center text-gray-400 disabled:opacity-20"
                      aria-label="Move up"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(i)}
                      disabled={i === items.length - 1}
                      className="w-5 h-5 flex items-center justify-center text-gray-400 disabled:opacity-20"
                      aria-label="Move down"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => { setAdding(false); setEditingIdx(i) }}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                    aria-label="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(i)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add form or Add button */}
      {adding ? (
        <AddItemForm
          withColor={withColor}
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => { setEditingIdx(null); setAdding(true) }}
          className="mt-2 w-full min-h-[40px] flex items-center justify-center gap-1.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      )}
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ListOptionsScreen() {
  const navigate = useNavigate()
  const {
    statuses, updateStatuses,
    companyTypes, updateCompanyTypes,
    roleTypes, updateRoleTypes,
  } = useContext(ListOptionsContext)

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-4 pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-gray-900 dark:text-white">Manage Lists</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <ListSection
          title="Statuses"
          items={statuses}
          withColor={true}
          onUpdate={updateStatuses}
        />
        <ListSection
          title="Company Types"
          items={companyTypes}
          withColor={false}
          onUpdate={updateCompanyTypes}
        />
        <ListSection
          title="Role Types"
          items={roleTypes}
          withColor={false}
          onUpdate={updateRoleTypes}
        />
      </div>
    </div>
  )
}
