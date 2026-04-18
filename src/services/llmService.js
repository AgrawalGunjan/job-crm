// ─── LLM Service ─────────────────────────────────────────────────────────────
// Builds system prompts and calls any OpenAI-compatible /chat/completions endpoint.

/**
 * Build a rich system prompt from the user's profile, contact data, and conversation history.
 */
export function buildSystemPrompt(
  profile,
  resume,
  profileFiles,
  contact,
  conversations,
  companyTypes = [],
  statuses = []
) {
  const lines = []

  // ── About Me ──────────────────────────────────────────────────────────────
  lines.push('## About Me')
  if (profile.name)        lines.push(`**Name:** ${profile.name}`)
  if (profile.headline)    lines.push(`**Headline:** ${profile.headline}`)
  if (profile.currentRole) lines.push(`**Current Role:** ${profile.currentRole}`)
  if (profile.company)     lines.push(`**Company:** ${profile.company}`)
  if (profile.skills)      lines.push(`**Skills:** ${profile.skills}`)
  if (profile.summary)     lines.push(`\n${profile.summary}`)
  if (profile.extraNotes)  lines.push(`\n**Notes:** ${profile.extraNotes}`)

  // ── Resume ────────────────────────────────────────────────────────────────
  if (resume && resume.trim()) {
    lines.push('\n### Resume')
    lines.push(resume.slice(0, 6000))
    if (resume.length > 6000) lines.push('_[resume truncated]_')
  }

  // ── Extra Profile Files ───────────────────────────────────────────────────
  for (const { filename, content } of (profileFiles ?? [])) {
    if (!content?.trim()) continue
    lines.push(`\n### ${filename}`)
    lines.push(content.slice(0, 2000))
    if (content.length > 2000) lines.push('_[truncated]_')
  }

  // ── Contact ───────────────────────────────────────────────────────────────
  if (contact) {
    lines.push(`\n## Contact: ${contact.fullName}`)
    const statusDef = statuses.find((s) => s.value === contact.status)
    const companyTypeDef = companyTypes.find((t) => t.value === contact.companyType)
    if (statusDef?.label)         lines.push(`**Status:** ${statusDef.label}`)
    if (contact.company)          lines.push(`**Company:** ${contact.company}`)
    if (contact.jobTitle)         lines.push(`**Their Title:** ${contact.jobTitle}`)
    if (companyTypeDef?.label)    lines.push(`**Company Type:** ${companyTypeDef.label}`)
    if (contact.targetRole)       lines.push(`**Target Role:** ${contact.targetRole}`)
    if (contact.email)            lines.push(`**Email:** ${contact.email}`)
    if (contact.phone)            lines.push(`**Phone:** ${contact.phone}`)
    if (contact.linkedIn)         lines.push(`**LinkedIn:** ${contact.linkedIn}`)
    if (contact.referredBy)       lines.push(`**Referred By:** ${contact.referredBy}`)
    if (contact.notes)            lines.push(`**Notes:** ${contact.notes}`)
    if (contact.hasOpenPosition)  lines.push(`**Has Open Position:** Yes`)
  }

  // ── Conversation Log ──────────────────────────────────────────────────────
  if (conversations && conversations.length > 0) {
    lines.push('\n## Conversation Log')
    const recent = [...conversations].slice(0, 20)
    for (const conv of recent) {
      const date = conv.timestamp
        ? new Date(conv.timestamp).toLocaleDateString()
        : ''
      const prefix = date ? `${date}: ` : ''
      const text = conv.type === 'audio' ? '[Audio recording]' : (conv.content ?? '')
      lines.push(`- ${prefix}${text}`)
    }
  }

  // ── Next Step ─────────────────────────────────────────────────────────────
  if (contact?.nextContactDate) {
    lines.push('\n## Next Step')
    lines.push(`**Date:** ${contact.nextContactDate}`)
    if (contact.nextContactPurpose) {
      lines.push(`**Purpose:** ${contact.nextContactPurpose}`)
    }
  }

  // ── Instruction ───────────────────────────────────────────────────────────
  lines.push(
    '\n---\nYou are a helpful job search assistant. Answer concisely and practically. ' +
    'When drafting messages (WhatsApp, email, LinkedIn), write them ready to copy-paste. ' +
    'Use the contact and profile context above to personalise every response.'
  )

  return lines.join('\n')
}

/**
 * Call any OpenAI-compatible /chat/completions endpoint.
 * @param {Array<{role: string, content: string}>} messages
 * @param {{ provider: string, apiKey: string, baseUrl: string, model: string }} llmProvider
 * @returns {Promise<string>} assistant reply text
 */
export async function callLLM(messages, llmProvider) {
  const { apiKey, baseUrl, model } = llmProvider ?? {}

  if (!baseUrl) throw new Error('LLM not configured — set a Base URL in Settings → AI Assistant')
  if (!model)   throw new Error('LLM not configured — set a Model in Settings → AI Assistant')

  const isLocalhost =
    baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
  if (!apiKey && !isLocalhost) {
    throw new Error('API key is required. Set it in Settings → AI Assistant')
  }

  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    })
  } catch (e) {
    throw new Error(`Network error — could not reach ${baseUrl}: ${e.message}`)
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid API key — check Settings → AI Assistant')
    if (response.status === 429) throw new Error('Rate limit reached — wait a moment and try again')
    throw new Error(`LLM error ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('LLM returned an empty response')
  return content
}
