import { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContacts } from '../hooks/useContacts.js'
import ContactCard from '../components/contacts/ContactCard.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { ListOptionsContext } from '../App.jsx'

const PAGE_SIZE = 20

export default function ContactsScreen() {
  const navigate = useNavigate()
  const { contacts, loading } = useContacts()
  const { statuses } = useContext(ListOptionsContext)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const loadMoreRef = useRef(null)

  // Build filter options dynamically from context statuses
  const FILTER_OPTIONS = [
    { id: 'all', label: 'All' },
    ...statuses.map((s) => ({ id: s.value, label: s.label })),
    { id: 'opening', label: 'Has Opening' },
  ]

  const filtered = contacts.filter((c) => {
    const q = query.toLowerCase()
    const matchesSearch =
      !q ||
      c.fullName?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.jobTitle?.toLowerCase().includes(q) ||
      c.targetRole?.toLowerCase().includes(q)

    const matchesFilter =
      filter === 'all' ||
      (filter === 'opening' ? c.hasOpenPosition : c.status === filter)

    return matchesSearch && matchesFilter
  })

  const displayed = filtered.slice(0, displayCount)
  const hasMore = displayed.length < filtered.length

  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [query, filter])

  useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setDisplayCount((c) => c + PAGE_SIZE)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, displayed.length])

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <button
            onClick={() => navigate('/contacts/new')}
            className="min-h-[44px] px-4 flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            className="min-h-[44px] w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search name, company, role…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mt-2.5 overflow-x-auto scrollbar-hide pb-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`shrink-0 min-h-[32px] px-3 rounded-full text-xs font-semibold transition-all ${
                filter === opt.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
            title={query || filter !== 'all' ? 'No matches' : 'No contacts yet'}
            subtitle={
              query || filter !== 'all'
                ? 'Try a different search or filter.'
                : 'Add your first contact to start building your network.'
            }
            action={
              !query && filter === 'all'
                ? { label: 'Add Contact', onClick: () => navigate('/contacts/new') }
                : null
            }
          />
        ) : (
          <>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
              {(query || filter !== 'all') ? ' found' : ''}
            </p>
            <div className="flex flex-col gap-2.5">
              {displayed.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                />
              ))}
            </div>
            <div ref={loadMoreRef} className="h-4" />
          </>
        )}
      </div>
    </div>
  )
}
