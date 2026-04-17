import { useState, useContext } from 'react'
import { DEFAULT_CONTACT } from '../../constants/defaults.js'
import { ListOptionsContext } from '../../App.jsx'
import VoiceInput from '../common/VoiceInput.jsx'

function Field({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'min-h-[44px] px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full'

const selectCls = inputCls + ' appearance-none'

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
        {title}
      </p>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

// ─── Device contact picker availability check ─────────────────────────────────
// Web Contact Picker API — available on Android Chrome & Capacitor WebView.
// Only checking navigator.contacts existence; ContactsManager may not be a
// named global in all WebView versions so we don't check window.ContactsManager.
const contactPickerSupported =
  typeof navigator !== 'undefined' && 'contacts' in navigator

// ─── Main form ────────────────────────────────────────────────────────────────
export default function ContactForm({ initialValues = {}, onSubmit, onCancel, isLoading, showToast }) {
  const { companyTypes, roleTypes, statuses } = useContext(ListOptionsContext)
  const [values, setValues] = useState({ ...DEFAULT_CONTACT, ...initialValues })
  const [errors, setErrors] = useState({})
  const [picking, setPicking] = useState(false)

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setValues((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const setField = (field, val) => {
    setValues((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // Open the phone's native contact picker and pre-fill name / phone / email
  const handlePickContact = async () => {
    if (!contactPickerSupported) return
    setPicking(true)
    try {
      const contacts = await navigator.contacts.select(
        ['name', 'tel', 'email'],
        { multiple: false }
      )
      if (!contacts || contacts.length === 0) return
      const picked = contacts[0]
      const name = picked.name?.[0] || ''
      const phone = picked.tel?.[0] || ''
      const email = picked.email?.[0] || ''
      setValues((prev) => ({
        ...prev,
        fullName: name || prev.fullName,
        phone: phone || prev.phone,
        email: email || prev.email,
      }))
      if (errors.fullName && name) setErrors((prev) => ({ ...prev, fullName: '' }))
      showToast?.('Fields filled from your contacts', 'info')
    } catch {
      // User cancelled or picker unavailable — silently ignore
    } finally {
      setPicking(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!values.fullName.trim()) errs.fullName = 'Name is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="pb-4">

      {/* Section A: Who */}
      <Section title="Who">
        <Field label="Full Name" required>
          <div className="flex gap-2 items-start">
            <input
              type="text"
              className={inputCls}
              placeholder="Jane Smith"
              value={values.fullName}
              onChange={set('fullName')}
            />
            {contactPickerSupported && (
              <button
                type="button"
                onClick={handlePickContact}
                disabled={picking}
                title="Pick from phone contacts"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors disabled:opacity-40 shrink-0"
                aria-label="Pick from phone contacts"
              >
                {picking ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                )}
              </button>
            )}
          </div>
          {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <input
              type="tel"
              className={inputCls}
              placeholder="+1 555 000 0000"
              value={values.phone}
              onChange={set('phone')}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputCls}
              placeholder="jane@co.com"
              value={values.email}
              onChange={set('email')}
            />
          </Field>
        </div>

        <Field label="LinkedIn URL">
          <input
            type="url"
            className={inputCls}
            placeholder="https://linkedin.com/in/..."
            value={values.linkedIn}
            onChange={set('linkedIn')}
          />
        </Field>
      </Section>

      {/* Section B: Where */}
      <Section title="Where">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company">
            <input
              type="text"
              className={inputCls}
              placeholder="Acme Corp"
              value={values.company}
              onChange={set('company')}
            />
          </Field>
          <Field label="Their Title">
            <input
              type="text"
              className={inputCls}
              placeholder="Eng Manager"
              value={values.jobTitle}
              onChange={set('jobTitle')}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company Type">
            <select className={selectCls} value={values.companyType} onChange={set('companyType')}>
              {companyTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Role Type">
            <select className={selectCls} value={values.targetRoleType} onChange={set('targetRoleType')}>
              {roleTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Target Role Title">
          <input
            type="text"
            className={inputCls}
            placeholder="Senior Frontend Engineer"
            value={values.targetRole}
            onChange={set('targetRole')}
          />
        </Field>
        <label className="flex items-center gap-3 min-h-[44px] px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            className="w-5 h-5 rounded accent-blue-600"
            checked={values.hasOpenPosition}
            onChange={set('hasOpenPosition')}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Has an open position for me</span>
        </label>
      </Section>

      {/* Section C: How */}
      <Section title="How">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select className={selectCls} value={values.status} onChange={set('status')}>
              {statuses.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Referred By">
            <input
              type="text"
              className={inputCls}
              placeholder="Alex Kim"
              value={values.referredBy}
              onChange={set('referredBy')}
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            className={inputCls + ' min-h-[88px] resize-none'}
            placeholder="Met at React Conf, works on infra team..."
            value={values.notes}
            onChange={set('notes')}
            rows={3}
          />
        </Field>
      </Section>

      {/* Section D: Next Step */}
      <Section title="Next Step">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Next Contact Date">
            <input
              type="date"
              className={inputCls}
              value={values.nextContactDate}
              onChange={set('nextContactDate')}
            />
          </Field>
          <Field label="Purpose">
            <div className="flex gap-2 items-start">
              <input
                type="text"
                className={inputCls}
                placeholder="Coffee chat"
                value={values.nextContactPurpose}
                onChange={set('nextContactPurpose')}
              />
              <VoiceInput
                onTranscript={(text) =>
                  setField('nextContactPurpose', values.nextContactPurpose ? values.nextContactPurpose + ' ' + text : text)
                }
              />
            </div>
          </Field>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[44px] py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 active:scale-95 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 min-h-[44px] py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all"
        >
          {isLoading ? 'Saving…' : 'Save Contact'}
        </button>
      </div>
    </form>
  )
}
