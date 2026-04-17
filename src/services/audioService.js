import { Howl } from 'howler'
import { readAudioFileAsBase64 } from './fileService.js'

let mediaRecorder = null
let audioChunks = []
let currentHowl = null
let ttsUtterance = null

// ─── Microphone permission ────────────────────────────────────────────────────

export async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    return true
  } catch {
    return false
  }
}

export async function checkMicrophonePermission() {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' })
    return result.state === 'granted'
  } catch {
    return false
  }
}

// ─── Recording ───────────────────────────────────────────────────────────────

function detectMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || ''
}

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  audioChunks = []

  const mimeType = detectMimeType()
  const options = mimeType ? { mimeType } : {}

  mediaRecorder = new MediaRecorder(stream, options)
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data)
  }
  mediaRecorder.start(100)
  return true
}

export async function stopRecording() {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      return reject(new Error('No active recording'))
    }

    mediaRecorder.onstop = async () => {
      try {
        // Capture refs before nulling
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const stream = mediaRecorder.stream
        const blob = new Blob(audioChunks, { type: mimeType })
        const base64 = await blobToBase64(blob)
        stream.getTracks().forEach((t) => t.stop())
        mediaRecorder = null
        resolve({ base64, mimeType })
      } catch (e) {
        mediaRecorder = null
        reject(e)
      }
    }

    mediaRecorder.onerror = (e) => reject(e.error)
    mediaRecorder.stop()
  })
}

export function isRecording() {
  return mediaRecorder?.state === 'recording'
}

// ─── Playback (Howler) ────────────────────────────────────────────────────────

export async function playAudio(filePath, { onEnd, onError } = {}) {
  stopAudio()

  let blobUrl = null

  try {
    // Read raw base64 from Capacitor Filesystem (works in both web and Android)
    const base64 = await readAudioFileAsBase64(filePath)
    const mimeType = detectMimeType() || 'audio/webm'
    blobUrl = base64ToBlobUrl(base64, mimeType)

    currentHowl = new Howl({
      src: [blobUrl],
      format: ['webm', 'ogg', 'mp4'],
      html5: true,
      onend: () => {
        revokeBlobUrl(blobUrl)
        currentHowl = null
        onEnd?.()
      },
      onloaderror: (id, err) => {
        revokeBlobUrl(blobUrl)
        currentHowl = null
        onError?.(new Error(`Audio load error: ${err}`))
      },
      onplayerror: (id, err) => {
        revokeBlobUrl(blobUrl)
        currentHowl = null
        onError?.(new Error(`Audio play error: ${err}`))
      },
    })

    currentHowl.play()
    return currentHowl
  } catch (e) {
    revokeBlobUrl(blobUrl)
    onError?.(e)
    throw e
  }
}

export function stopAudio() {
  if (currentHowl) {
    currentHowl.stop()
    currentHowl.unload()
    currentHowl = null
  }
}

export function isPlayingAudio() {
  return currentHowl?.playing() ?? false
}

// ─── Text-to-speech ───────────────────────────────────────────────────────────

export function speakText(text, { onEnd, onError } = {}) {
  stopSpeaking()

  if (!window.speechSynthesis) {
    onError?.(new Error('Speech synthesis not supported'))
    return
  }

  ttsUtterance = new SpeechSynthesisUtterance(text)
  ttsUtterance.rate = 0.95
  ttsUtterance.pitch = 1
  ttsUtterance.volume = 1
  ttsUtterance.onend = () => {
    ttsUtterance = null
    onEnd?.()
  }
  ttsUtterance.onerror = (e) => {
    ttsUtterance = null
    onError?.(new Error(e.error))
  }

  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      const en = voices.find((v) => v.lang.startsWith('en'))
      if (en) ttsUtterance.voice = en
    }
    window.speechSynthesis.speak(ttsUtterance)
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true })
  } else {
    doSpeak()
  }
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  ttsUtterance = null
}

export function isSpeaking() {
  return window.speechSynthesis?.speaking ?? false
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function base64ToBlobUrl(base64, mimeType) {
  const byteChars = atob(base64)
  const byteArrays = []
  for (let offset = 0; offset < byteChars.length; offset += 512) {
    const slice = byteChars.slice(offset, offset + 512)
    const byteNumbers = new Uint8Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    byteArrays.push(byteNumbers)
  }
  const blob = new Blob(byteArrays, { type: mimeType })
  return URL.createObjectURL(blob)
}

function revokeBlobUrl(url) {
  if (url) {
    try { URL.revokeObjectURL(url) } catch {}
  }
}
