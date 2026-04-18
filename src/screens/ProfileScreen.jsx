import { useState, useContext, useRef } from 'react'
import { useProfile } from '../hooks/useProfile.js'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { ToastContext } from '../App.jsx'

function estimateTokens(text) {
  if (!text) return 0
  return Math.round(text.length / 4)
}

export default function ProfileScreen() {
  const { info, resume, files, loading, updateInfo, updateResume, addFile, removeFile } = useProfile()
  const { showToast } = useContext(ToastContext)

  // Local drafts — null means no unsaved change
  const [infoDraft, setInfoDraft] = useState(null)
  const [resumeDraft, setResumeDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  if (loading || !info) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const currentInfo = infoDraft ?? info
  const currentResume = resumeDraft ?? resume

  const hasChanges = infoDraft !== null || resumeDraft !== null

  const setField = (key, value) => {
    setInfoDraft((prev) => ({ ...(prev ?? info), [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (infoDraft !== null) await updateInfo(infoDraft)
      if (resumeDraft !== null) await updateResume(resumeDraft)
      setInfoDraft(null)
      setResumeDraft(null)
      showToast('Profile saved', 'success')
    } catch (e) {
      showToast(`Save failed: ${e.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await addFile(file.name, text)
      showToast(`${file.name} uploaded`, 'success')
    } catch (err) {
      showToast(`Upload failed: ${err.message}`, 'error')
    } finally {
      e.target.value = ''
    }
  }

  const handleDeleteFile = async (filename) => {
    try {
      await removeFile(filename)
      showToast(`${filename} deleted`, 'info')
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error')
    }
  }

  const handleLoadResumeFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      setResumeDraft(text)
    } catch (err) {
      showToast(`Could not read file: ${err.message}`, 'error')
    } finally {
      e.target.value = ''
    }
  }

  const resumeFileInputRef = useRef(null)

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-[36px] px-4 text-sm font-semibold bg-blue-600 text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? <LoadingSpinner size="sm" /> : null}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        )}
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-2">
            Basic Info
          </p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Name</label>
              <input
                type="text"
                value={currentInfo.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Your full name"
                className="mt-1 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Headline</label>
              <input
                type="text"
                value={currentInfo.headline}
                onChange={(e) => setField('headline', e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="mt-1 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Role</label>
                <input
                  type="text"
                  value={currentInfo.currentRole}
                  onChange={(e) => setField('currentRole', e.target.value)}
                  placeholder="Software Engineer"
                  className="mt-1 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Company</label>
                <input
                  type="text"
                  value={currentInfo.company}
                  onChange={(e) => setField('company', e.target.value)}
                  placeholder="Acme Corp"
                  className="mt-1 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Skills <span className="font-normal text-gray-400">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={currentInfo.skills}
                onChange={(e) => setField('skills', e.target.value)}
                placeholder="React, TypeScript, Node.js, Python"
                className="mt-1 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {currentInfo.skills && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentInfo.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Summary</label>
              <textarea
                rows={4}
                value={currentInfo.summary}
                onChange={(e) => setField('summary', e.target.value)}
                placeholder="A brief bio or professional summary for the AI to use…"
                className="mt-1 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Extra Notes for AI</label>
              <textarea
                rows={3}
                value={currentInfo.extraNotes}
                onChange={(e) => setField('extraNotes', e.target.value)}
                placeholder="Job search goals, preferences, things to mention…"
                className="mt-1 w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Resume */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Resume
            </p>
            <div className="flex items-center gap-2">
              {currentResume && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ~{estimateTokens(currentResume).toLocaleString()} tokens
                </span>
              )}
              <input
                ref={resumeFileInputRef}
                type="file"
                accept=".md,.txt"
                className="hidden"
                onChange={handleLoadResumeFile}
              />
              <button
                onClick={() => resumeFileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20"
              >
                Load .md / .txt
              </button>
            </div>
          </div>
          <textarea
            rows={10}
            value={currentResume}
            onChange={(e) => setResumeDraft(e.target.value)}
            placeholder="Paste your resume here in plain text or Markdown…"
            className="w-full text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            First 6,000 characters (~1,500 tokens) are sent to the AI per request.
          </p>
        </div>

        {/* Additional Files */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Additional Files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add .md / .txt
            </button>
          </div>

          {files.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
              No files uploaded yet. Add Markdown or text files for extra context.
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {files.map(({ filename, content }) => (
                <div
                  key={filename}
                  className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{filename}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      ~{estimateTokens(content).toLocaleString()} tokens
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(filename)}
                    className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            First 2,000 characters (~500 tokens) per file are sent to the AI.
          </p>
        </div>

        {/* Save button at bottom for convenience */}
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full min-h-[48px] text-sm font-semibold bg-blue-600 text-white rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <LoadingSpinner size="sm" /> : null}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        )}
      </div>
    </div>
  )
}
