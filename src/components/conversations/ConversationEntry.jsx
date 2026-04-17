import { useState } from 'react'
import AudioPlayer from './AudioPlayer.jsx'
import { speakText, stopSpeaking, isSpeaking } from '../../services/audioService.js'
import { formatDateTime } from '../../utils/dateUtils.js'

export default function ConversationEntry({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSpeak = () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    speakText(entry.content, {
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Type badge */}
          <span
            className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              entry.type === 'audio'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}
          >
            {entry.type === 'audio' ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
            {entry.type}
          </span>

          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
            {formatDateTime(entry.date)}
          </span>

          {entry.content && !expanded && (
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{entry.content}</span>
          )}
        </div>

        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800">
          {entry.type === 'audio' && entry.audioFile && (
            <div className="mt-3">
              <AudioPlayer filePath={entry.audioFile} />
            </div>
          )}

          {entry.content && (
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {entry.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {entry.type === 'text' && entry.content && (
              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg min-h-[36px] transition-all ${
                  speaking
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {speaking ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 9l-3-3m3 3l3-3M9 12H3m0 0l3 3M3 12l3-3" />
                    </svg>
                    Listen
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg min-h-[36px] bg-gray-100 dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/40">
              <p className="text-sm text-red-700 dark:text-red-400 mb-2">Delete this conversation entry?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onDelete(entry.id); setShowDeleteConfirm(false) }}
                  className="flex-1 min-h-[36px] bg-red-600 text-white text-sm font-medium rounded-lg"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 min-h-[36px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
