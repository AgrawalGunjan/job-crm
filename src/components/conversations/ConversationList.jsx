import { useState } from 'react'
import ConversationEntry from './ConversationEntry.jsx'
import Modal from '../common/Modal.jsx'
import EmptyState from '../common/EmptyState.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'
import VoiceInput from '../common/VoiceInput.jsx'
import {
  startRecording,
  stopRecording,
  requestMicrophonePermission,
} from '../../services/audioService.js'

const inputCls =
  'px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full'

export default function ConversationList({
  conversations,
  loading,
  onAddText,
  onAddAudio,
  onDelete,
  onUpdateNextStep,
}) {
  const [addModal, setAddModal] = useState(false)
  const [mode, setMode] = useState(null) // 'text' | 'audio'

  // Text note state
  const [textInput, setTextInput] = useState('')

  // Next step state (inside the Add Note modal)
  const [nextDate, setNextDate] = useState('')
  const [nextPurpose, setNextPurpose] = useState('')

  // Recording state
  const [recording, setRecording] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recordError, setRecordError] = useState(null)

  const handleOpen = (m) => {
    setMode(m)
    setTextInput('')
    setNextDate('')
    setNextPurpose('')
    setRecordError(null)
    setAddModal(true)
  }

  const handleClose = () => {
    if (recording) {
      stopRecording().catch(() => {})
      setRecording(false)
    }
    setAddModal(false)
    setMode(null)
    setTextInput('')
    setNextDate('')
    setNextPurpose('')
  }

  const handleSaveText = async () => {
    if (!textInput.trim()) return
    setSaving(true)
    try {
      await onAddText(textInput.trim())
      // If a next step date was set, save it too
      if (nextDate && onUpdateNextStep) {
        await onUpdateNextStep({ nextContactDate: nextDate, nextContactPurpose: nextPurpose })
      }
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  const handleStartRecording = async () => {
    setRecordError(null)
    const granted = await requestMicrophonePermission()
    if (!granted) {
      setRecordError('Microphone permission denied. Please grant access in device settings.')
      return
    }
    try {
      await startRecording()
      setRecording(true)
    } catch (e) {
      setRecordError(e.message)
    }
  }

  const handleStopRecording = async () => {
    setSaving(true)
    try {
      const { base64 } = await stopRecording()
      setRecording(false)
      await onAddAudio(base64)
      handleClose()
    } catch (e) {
      setRecordError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 pb-6 pt-4">

      {/* Add buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleOpen('text')}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Add Note
        </button>
        <button
          onClick={() => handleOpen('audio')}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Record
        </button>
      </div>

      {/* Conversation list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          title="No conversations yet"
          subtitle="Add a note or record audio to log your interactions."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {conversations.map((entry) => (
            <ConversationEntry key={entry.id} entry={entry} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* ── Add Modal ── */}
      <Modal
        isOpen={addModal}
        onClose={handleClose}
        title={mode === 'text' ? 'Add Note' : 'Record Audio'}
      >

        {/* ── Text note mode ── */}
        {mode === 'text' && (
          <div className="flex flex-col gap-4">

            {/* Conversation note */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                What happened
              </p>
              <div className="flex gap-2 items-start">
                <textarea
                  className={inputCls + ' min-h-[120px] resize-none'}
                  placeholder="What did you discuss? Any action items or outcomes?"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  autoFocus
                  rows={4}
                />
                <VoiceInput
                  onTranscript={(text) =>
                    setTextInput((prev) => (prev ? prev + ' ' + text : text))
                  }
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Next Step section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Next Step <span className="normal-case font-normal text-gray-400">(optional)</span>
                </p>
              </div>

              {/* Date */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Next Contact Date
                </label>
                <input
                  type="date"
                  className={inputCls + ' min-h-[44px]'}
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
              </div>

              {/* Purpose — textarea + mic */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Purpose / What to discuss
                </label>
                <div className="flex gap-2 items-start">
                  <textarea
                    className={inputCls + ' resize-none'}
                    placeholder="Follow up on the offer, ask about team structure, send portfolio…"
                    value={nextPurpose}
                    onChange={(e) => setNextPurpose(e.target.value)}
                    rows={3}
                  />
                  <VoiceInput
                    onTranscript={(text) =>
                      setNextPurpose((prev) => (prev ? prev + ' ' + text : text))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveText}
              disabled={!textInput.trim() || saving}
              className="min-h-[44px] w-full bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all"
            >
              {saving ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        )}

        {/* ── Audio record mode ── */}
        {mode === 'audio' && (
          <div className="flex flex-col items-center gap-6 py-4">
            {!recording ? (
              <>
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Tap record to start capturing your conversation
                </p>
                {recordError && (
                  <p className="text-sm text-red-600 text-center">{recordError}</p>
                )}
                <button
                  onClick={handleStartRecording}
                  className="min-h-[52px] px-8 bg-red-600 text-white rounded-2xl text-base font-semibold active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="w-3 h-3 rounded-full bg-white" />
                  Start Recording
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse" />
                </div>
                <div className="flex items-end gap-0.5 h-8">
                  {[4, 8, 6, 12, 8, 5, 10, 7, 9, 6].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-red-500 rounded-full animate-pulse"
                      style={{ height: `${h * 2}px`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Recording…</p>
                {recordError && (
                  <p className="text-sm text-red-600 text-center">{recordError}</p>
                )}
                <button
                  onClick={handleStopRecording}
                  disabled={saving}
                  className="min-h-[52px] px-8 bg-gray-800 dark:bg-gray-700 text-white rounded-2xl text-base font-semibold active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="w-3 h-3 rounded bg-white" />
                  {saving ? 'Saving…' : 'Stop & Save'}
                </button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
