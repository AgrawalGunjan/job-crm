import { LocalNotifications } from '@capacitor/local-notifications'
import { isTomorrow } from '../utils/dateUtils.js'

// Converts a UUID to a stable 32-bit integer for use as notification ID
function uuidToInt(uuid) {
  return Math.abs(parseInt(uuid.replace(/-/g, '').substring(0, 8), 16)) % 2000000000
}

export async function requestNotificationPermission() {
  try {
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch {
    return false
  }
}

export async function checkNotificationPermission() {
  try {
    const result = await LocalNotifications.checkPermissions()
    return result.display === 'granted'
  } catch {
    return false
  }
}

export async function createNotificationChannel() {
  try {
    await LocalNotifications.createChannel({
      id: 'jobflow_reminders',
      name: 'Job Follow-up Reminders',
      description: 'Reminders to follow up with your job search contacts',
      importance: 4,
      vibration: true,
      sound: 'default',
    })
  } catch {
    // Channel already exists or not supported — swallow
  }
}

export async function cancelAllPending() {
  try {
    const pending = await LocalNotifications.getPending()
    if (pending.notifications?.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications })
    }
  } catch {
    // Swallow — may fail if no permissions
  }
}

export async function scheduleContactReminders(contacts, reminderTime = '09:00') {
  try {
    const tomorrowContacts = contacts.filter(
      (c) => c.nextContactDate && isTomorrow(c.nextContactDate)
    )

    if (tomorrowContacts.length === 0) return

    await cancelAllPending()

    const [hours, minutes] = reminderTime.split(':').map(Number)
    const fireDate = new Date()
    fireDate.setDate(fireDate.getDate() + 1)
    fireDate.setHours(hours, minutes, 0, 0)

    const notifications = tomorrowContacts.map((contact) => ({
      id: uuidToInt(contact.id),
      title: `Follow up with ${contact.fullName}`,
      body: contact.nextContactPurpose
        ? `${contact.nextContactPurpose} · ${contact.company || ''}`
        : `Scheduled contact${contact.company ? ` at ${contact.company}` : ''}`,
      schedule: { at: fireDate },
      channelId: 'jobflow_reminders',
      smallIcon: 'ic_stat_icon_config_sample',
    }))

    await LocalNotifications.schedule({ notifications })
    return notifications.length
  } catch {
    // Notification scheduling may fail in browser dev mode — swallow
    return 0
  }
}
