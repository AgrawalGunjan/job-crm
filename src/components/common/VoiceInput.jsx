import { useState, useRef } from 'react'

/**
 * Mic button that listens via SpeechRecognition and calls onTranscript(text).
 * Does NOT save any audio — purely speech-to-text.
 *
 * Props:
 *   onTranscript(text) — called with the recognised text
 *   disabled           — disables the button
 *
 * Always renders — shows a disabled/greyed button if SpeechRecognition is
 * not supported so the user knows the feature exists but isn't available.
 */

const MicIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
)

const StopIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="1" strokeWidth={2} />
  </svg>
)

export default function VoiceInput({ onTranscript, disabled = false }) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const SR = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null

  const supported = Boolean(SR)

  // Not supported — always render a visually obvious disabled button
  if (!supported) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled
          title="Voice input not supported on this device"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
          aria-label="Voice input not supported"
        >
          <MicIcon />
        </button>
      </div>
    )
  }

  const start = () => {
    setError(null)
    try {
      const recognition = new SR()
      recognitionRef.current = recognition
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.continuous = false

      recognition.onstart = () => setListening(true)

      recognition.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join(' ')
          .trim()
        onTranscript(transcript)
      }

      recognition.onerror = (e) => {
        if (e.error === 'aborted') return
        if (e.error === 'not-allowed') {
          setError('Microphone permission denied')
        } else if (e.error === 'network') {
          setError('Network required for voice input')
        } else if (e.error === 'no-speech') {
          setError('No speech detected — try again')
        } else {
          setError('Voice not recognised — try again')
        }
        setListening(false)
      }

      recognition.onend = () => setListening(false)

      recognition.start()
    } catch {
      setError('Could not start voice input')
      setListening(false)
    }
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const toggle = () => {
    setError(null)
    listening ? stop() : start()
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        title={listening ? 'Stop listening' : 'Tap to dictate'}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all disabled:opacity-40 ${
          listening
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
        }`}
        aria-label={listening ? 'Stop dictation' : 'Start dictation'}
      >
        {listening ? <StopIcon /> : <MicIcon />}
      </button>
      {error && <p className="text-xs text-red-500 max-w-[110px] text-right leading-tight">{error}</p>}
    </div>
  )
}
