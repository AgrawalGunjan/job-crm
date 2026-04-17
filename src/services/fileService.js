import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import {
  CONTACTS_FILE,
  SETTINGS_FILE,
  CONVERSATIONS_DIR,
  AUDIO_DIR,
  DEFAULT_SETTINGS,
  DEFAULT_CONTACT,
} from '../constants/defaults.js'
import { generateId } from '../utils/idUtils.js'

// ─── Internal helpers ───────────────────────────────────────────────────────

async function ensureDir(path) {
  try {
    await Filesystem.mkdir({ path, directory: Directory.Data, recursive: true })
  } catch (e) {
    if (!e.message?.includes('exists') && !e.message?.includes('already')) throw e
  }
}

async function readJSON(path) {
  const result = await Filesystem.readFile({
    path,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  })
  return JSON.parse(result.data)
}

async function writeJSON(path, data) {
  await Filesystem.writeFile({
    path,
    data: JSON.stringify(data, null, 2),
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    recursive: true,
  })
}

function fileNotFound(e) {
  const msg = e.message?.toLowerCase() ?? ''
  return (
    msg.includes('does not exist') ||
    msg.includes('not found') ||
    msg.includes('no such file') ||
    msg.includes('file does not exist')
  )
}

// ─── Storage initialization ─────────────────────────────────────────────────

export async function initializeStorage() {
  await ensureDir('jobflow')
  await ensureDir('jobflow/conversations')
  await ensureDir('jobflow/audio')

  try {
    await readJSON(CONTACTS_FILE)
  } catch (e) {
    if (fileNotFound(e)) {
      await writeJSON(CONTACTS_FILE, [])
    } else {
      throw e
    }
  }

  try {
    await readJSON(SETTINGS_FILE)
  } catch (e) {
    if (fileNotFound(e)) {
      await writeJSON(SETTINGS_FILE, DEFAULT_SETTINGS)
    } else {
      throw e
    }
  }
}

// ─── Contacts ───────────────────────────────────────────────────────────────

export async function getContacts() {
  try {
    return await readJSON(CONTACTS_FILE)
  } catch (e) {
    if (fileNotFound(e)) return []
    throw new Error(`Failed to load contacts: ${e.message}`)
  }
}

export async function saveContacts(contacts) {
  try {
    await writeJSON(CONTACTS_FILE, contacts)
  } catch (e) {
    throw new Error(`Failed to save contacts: ${e.message}`)
  }
}

// ─── Conversations ──────────────────────────────────────────────────────────

export async function getConversations(contactId) {
  try {
    return await readJSON(`${CONVERSATIONS_DIR}/${contactId}.json`)
  } catch (e) {
    if (fileNotFound(e)) return []
    throw new Error(`Failed to load conversations: ${e.message}`)
  }
}

export async function saveConversations(contactId, conversations) {
  try {
    await writeJSON(`${CONVERSATIONS_DIR}/${contactId}.json`, conversations)
  } catch (e) {
    throw new Error(`Failed to save conversations: ${e.message}`)
  }
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function getSettings() {
  try {
    const stored = await readJSON(SETTINGS_FILE)
    return { ...DEFAULT_SETTINGS, ...stored }
  } catch (e) {
    if (fileNotFound(e)) return { ...DEFAULT_SETTINGS }
    throw new Error(`Failed to load settings: ${e.message}`)
  }
}

export async function saveSettings(settings) {
  try {
    await writeJSON(SETTINGS_FILE, settings)
  } catch (e) {
    throw new Error(`Failed to save settings: ${e.message}`)
  }
}

// ─── Audio files ─────────────────────────────────────────────────────────────

export async function saveAudioFile(contactId, timestamp, base64Data) {
  const path = `${AUDIO_DIR}/${contactId}/${timestamp}.webm`
  await ensureDir(`${AUDIO_DIR}/${contactId}`)
  await Filesystem.writeFile({
    path,
    data: base64Data,
    directory: Directory.Data,
    recursive: true,
  })
  return path
}

export async function getAudioUri(filePath) {
  const { uri } = await Filesystem.getUri({
    path: filePath,
    directory: Directory.Data,
  })
  return uri
}

export async function readAudioFileAsBase64(filePath) {
  const result = await Filesystem.readFile({
    path: filePath,
    directory: Directory.Data,
    // No encoding — returns raw base64
  })
  return typeof result.data === 'string' ? result.data : await blobToBase64(result.data)
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// ─── Delete contact and its data ─────────────────────────────────────────────

export async function deleteContactData(contactId) {
  try {
    await Filesystem.deleteFile({
      path: `${CONVERSATIONS_DIR}/${contactId}.json`,
      directory: Directory.Data,
    })
  } catch {
    // File may not exist — swallow
  }

  try {
    await Filesystem.rmdir({
      path: `${AUDIO_DIR}/${contactId}`,
      directory: Directory.Data,
      recursive: true,
    })
  } catch {
    // Directory may not exist — swallow
  }
}

// ─── Import contacts from CSV rows ───────────────────────────────────────────

export async function importContacts(rows) {
  const existing = await getContacts()
  const existingKeys = new Set(existing.map((c) => `${c.fullName}|${c.phone ?? ''}`))
  const toAdd = rows
    .filter((r) => r.fullName?.trim())
    .filter((r) => !existingKeys.has(`${r.fullName.trim()}|${r.phone?.trim() ?? ''}`))
    .map((r) => ({
      ...DEFAULT_CONTACT,
      ...r,
      id: generateId(),
      fullName: r.fullName.trim(),
      createdAt: new Date().toISOString(),
    }))
  if (toAdd.length > 0) {
    await saveContacts([...existing, ...toAdd])
  }
  return toAdd.length
}

// ─── Export all data ─────────────────────────────────────────────────────────

export async function exportAllData() {
  const contacts = await getContacts()
  const allConversations = {}

  for (const contact of contacts) {
    const convs = await getConversations(contact.id)
    if (convs.length > 0) {
      allConversations[contact.id] = convs
    }
  }

  const settings = await getSettings()

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      contacts,
      conversations: allConversations,
      settings,
    },
    null,
    2
  )
}
