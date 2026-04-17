import { useState, useEffect } from 'react'
import { playAudio, stopAudio, isPlayingAudio } from '../../services/audioService.js'

export default function AudioPlayer({ filePath }) {
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    return () => stopAudio()
  }, [])

  const toggle = async () => {
    if (playing) {
      stopAudio()
      setPlaying(false)
      return
    }

    setError(null)
    setPlaying(true)
    try {
      await playAudio(filePath, {
        onEnd: () => setPlaying(false),
        onError: (e) => {
          setError(e.message)
          setPlaying(false)
        },
      })
    } catch (e) {
      setError(e.message)
      setPlaying(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-blue-600 text-white active:scale-95 transition-all shadow"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1">
        {playing ? (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-blue-500 animate-pulse"
                style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">Playing…</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1 bg-gray-200 dark:bg-gray-700 rounded-full"
                style={{ height: `${8 + (i % 3) * 6}px` }}
              />
            ))}
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">Audio recording</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
