import { useState, useRef, useEffect, useContext } from 'react'
import { useAIChat } from '../../hooks/useAIChat.js'
import { useProfile } from '../../hooks/useProfile.js'
import { useSettings } from '../../hooks/useSettings.js'
import { buildSystemPrompt, callLLM } from '../../services/llmService.js'
import { ToastContext } from '../../App.jsx'
import { ListOptionsContext } from '../../App.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

const QUICK_PROMPTS = [
  'Summarize this contact',
  'Draft a WhatsApp message',
  'What should I say next?',
  'Prepare me for a call',
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older WebViews
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

export default function AIChatTab({ contact, conversations }) {
  const { messages, loading, appendMessage, replaceLastAssistantMessage, clearChat } = useAIChat(contact.id)
  const { info: profileInfo, resume, files: profileFiles } = useProfile()
  const { settings } = useSettings()
  const { showToast } = useContext(ToastContext)
  const { companyTypes, statuses } = useContext(ListOptionsContext)

  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Scroll to bottom (newest message) when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setInputText('')
    setSending(true)

    // 1. Optimistic user bubble
    await appendMessage('user', trimmed)

    // 2. Placeholder assistant bubble
    const placeholder = await appendMessage('assistant', '…')

    try {
      // 3. Build system prompt
      const systemPrompt = buildSystemPrompt(
        profileInfo ?? {},
        resume ?? '',
        profileFiles ?? [],
        contact,
        conversations ?? [],
        companyTypes,
        statuses
      )

      // 4. Build message history for API (oldest-first, exclude placeholder)
      const historyForApi = [...messages]
        .reverse()
        .slice(-20)
        .filter((m) => m.id !== placeholder.id)
        .map(({ role, content }) => ({ role, content }))

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...historyForApi,
        { role: 'user', content: trimmed },
      ]

      // 5. Call LLM
      const content = await callLLM(apiMessages, settings?.llmProvider)

      // 6. Replace placeholder
      replaceLastAssistantMessage(placeholder.id, content)
    } catch (e) {
      replaceLastAssistantMessage(placeholder.id, `Error: ${e.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleCopy = async (text) => {
    const ok = await copyToClipboard(text)
    showToast(ok ? 'Copied!' : 'Copy failed', ok ? 'success' : 'error')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputText)
    }
  }

  // Messages are stored newest-first; reverse for display (oldest at top)
  const displayMessages = [...messages].reverse()

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-end px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={async () => {
            await clearChat()
            showToast('Chat cleared', 'info')
          }}
          className="text-xs font-medium text-gray-400 dark:text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Clear chat
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
              Ask anything about {contact.fullName}
            </p>
          </div>
        ) : (
          displayMessages.map((msg) => {
            const isUser = msg.role === 'user'
            const isPlaceholder = msg.content === '…'
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                  }`}
                >
                  {isPlaceholder ? (
                    <TypingIndicator />
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.content)}
                          className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick-prompt chips */}
      {!sending && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none border-t border-gray-100 dark:border-gray-800">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this contact…"
          disabled={sending}
          className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
          style={{ maxHeight: '120px', overflowY: 'auto' }}
        />
        <button
          onClick={() => handleSend(inputText)}
          disabled={sending || !inputText.trim()}
          className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40"
        >
          {sending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
