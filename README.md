# JobFlow — Job Hunt CRM

A fully offline, production-ready mobile CRM for managing your personal job search. Track contacts, companies, open positions, referrals, conversations (text + audio), and follow-up schedules. Built with React + Tailwind + Capacitor v6, targeting Android APK.

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | 20.x LTS |
| npm | 10.x |
| Android Studio | Ladybug (2024.2) or later |
| Android SDK | API 34 (Android 14) |
| Android Build Tools | 34.x |
| Java | 17 (bundled with Android Studio) |
| Gradle | 8.x (included via wrapper) |

**Environment variable required:**
```
ANDROID_HOME = C:\Users\<you>\AppData\Local\Android\Sdk   (Windows)
ANDROID_HOME = ~/Android/Sdk                               (Linux/Mac)
```

---

## Build Steps

```bash
# 1. Install JS dependencies
npm install

# 2. Build the React app with Vite
npm run build

# 3. Sync built assets + plugins into Android project
npx cap sync android

# 4. Build the debug APK
cd android
./gradlew assembleDebug

# APK output:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Install on Device / Emulator

```bash
# Via ADB (with device connected or emulator running)
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or copy the APK to your device and open it directly (requires "Install from unknown sources" enabled).

---

## First-Time Setup (if android/ folder is missing)

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## Development (Browser Preview)

```bash
npm run dev
# Opens at http://localhost:5173
# Note: Capacitor filesystem/notification/haptics APIs are no-ops in browser.
# All UI, navigation, and form flows are fully testable in browser.
```

---

## Architecture

```
src/
  services/
    fileService.js          All Capacitor Filesystem operations
    notificationService.js  Local notification scheduling
    audioService.js         MediaRecorder + Howler.js + SpeechSynthesis
  hooks/
    useContacts.js          Contact CRUD state
    useConversations.js     Conversation state per contact
    useSettings.js          Settings persistence
    useToast.js             Toast notification state
  components/
    common/                 Toast, Badge, Modal, EmptyState, LoadingSpinner
    contacts/               ContactCard, ContactForm, ContactDetail
    conversations/          AudioPlayer, ConversationEntry, ConversationList
    dashboard/              StatsBar, AgendaCard, TomorrowStrip
  screens/
    DashboardScreen.jsx     Home — today's agenda, tomorrow alerts, stats
    ContactsScreen.jsx      Search + filter list of all contacts
    ContactDetailScreen.jsx Profile + conversation history
    AddEditContactScreen.jsx Add / edit contact form
    SettingsScreen.jsx      Preferences, permissions, export
```

## Data Storage

All data is stored locally on the device using `@capacitor/filesystem` under `Directory.Data` (app private storage — no external storage permissions needed on Android 10+):

| Path | Contents |
|------|----------|
| `jobflow/contacts.json` | All contacts array |
| `jobflow/conversations/{contactId}.json` | Conversations per contact |
| `jobflow/audio/{contactId}/{timestamp}.webm` | Audio recordings |
| `jobflow/settings.json` | User preferences |

---

## Features

- **Dashboard** — Today's follow-ups highlighted, tomorrow alert strip, pipeline stats
- **Contacts** — Real-time search, status/opening filter chips, IntersectionObserver pagination
- **Contact Detail** — Full profile, inline edit, conversation history tab
- **Conversations** — Free-text notes + audio recordings; TTS playback for text entries; Howler.js playback for audio
- **Reminders** — Automatic local notification at configured time (default 9AM) the day before each follow-up date
- **Settings** — Dark mode (system/light/dark), reminder time, notification toggle, full JSON data export
- **Offline-first** — Zero network calls; no backend, no auth, no cloud

---

## Capacitor Notes

- Uses `androidScheme: "https"` (Capacitor v6 default) — WebView serves from `https://localhost`
- `base: './'` in `vite.config.js` is **required** for asset paths to resolve in the APK
- Hardware back button is handled via `@capacitor/app` listener to prevent accidental app exit
- Notification IDs are derived from contact UUIDs as stable 32-bit integers

---

## APK Location After Build

```
android/app/build/outputs/apk/debug/app-debug.apk
```
