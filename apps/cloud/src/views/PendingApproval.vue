<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser, useCollection } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { doc, setDoc, serverTimestamp, collection, query, where } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useLayout } from '@repo/modules'
import { Signout } from '@repo/auth'

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
const { updateLayout } = useLayout()

const userLayouts = useCollection(
  computed(() =>
    user.value?.email
      ? query(collection(db, 'layouts'), where('owner', '==', user.value.email))
      : null,
  ),
)
const primaryLayoutId = computed(() => userLayouts.value?.[0]?.id || layoutId.value)

const notificationSent = ref(false)
const notificationLoading = ref(false)
const notificationError = ref<string | null>(null)

// Server type selection (moved from onboarding step 4)
const serverType = ref<'deja-server' | 'withrottle'>('deja-server')
const serverSaving = ref(false)
const serverSaved = ref(false)

async function saveServerType() {
  if (!primaryLayoutId.value) return
  serverSaving.value = true
  try {
    await updateLayout(primaryLayoutId.value, {
      throttleConnection: { type: serverType.value }
    })
    serverSaved.value = true
    setTimeout(() => { serverSaved.value = false }, 3000)
  } catch {
    // Silent fail — non-critical setting
  } finally {
    serverSaving.value = false
  }
}

// Install script copy
const copiedMac = ref(false)
const copiedWin = ref(false)
const copiedUid = ref(false)
const copiedLayoutIdValue = ref(false)

const macScript = 'curl -fsSL https://install.dejajs.com | bash'
const winScript = 'irm https://install.dejajs.com/win | iex'

async function copyScript(script: string, platform: 'mac' | 'win') {
  await navigator.clipboard.writeText(script)
  if (platform === 'mac') {
    copiedMac.value = true
    setTimeout(() => { copiedMac.value = false }, 2000)
  } else {
    copiedWin.value = true
    setTimeout(() => { copiedWin.value = false }, 2000)
  }
}

async function copyValue(text: string, flag: 'uid' | 'layoutId') {
  await navigator.clipboard.writeText(text)
  if (flag === 'uid') {
    copiedUid.value = true
    setTimeout(() => { copiedUid.value = false }, 2000)
  } else {
    copiedLayoutIdValue.value = true
    setTimeout(() => { copiedLayoutIdValue.value = false }, 2000)
  }
}

async function sendApprovalNotification() {
  if (!user.value || !primaryLayoutId.value) return
  notificationLoading.value = true
  notificationError.value = null
  try {
    await setDoc(doc(db, 'approvalRequests', primaryLayoutId.value), {
      layoutId: primaryLayoutId.value,
      uid: user.value.uid,
      email: user.value.email,
      displayName: user.value.displayName,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    notificationSent.value = true
  } catch (err: unknown) {
    const fbErr = err as { message?: string }
    notificationError.value = fbErr.message || 'Failed to send notification'
  } finally {
    notificationLoading.value = false
  }
}
</script>

<template>
  <div class="pending-page">
    <div class="pending-container">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="font-display text-5xl text-sky-100 mb-2">DEJA.js</h1>
        <p class="text-slate-400 text-sm">Almost there! Set up your server while we review your layout.</p>
      </div>

      <!-- Approval Status Card -->
      <div class="glass-card mb-6">
        <div class="flex items-center gap-3 mb-4">
          <v-icon color="warning" size="28">mdi-clock-outline</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Awaiting Approval</h2>
        </div>
        <p class="text-slate-400 text-sm mb-4">
          Thanks for signing up{{ user?.displayName ? `, ${user.displayName}` : '' }}!
          Your layout <strong class="text-sky-300">{{ primaryLayoutId }}</strong> has been created and is pending admin approval.
        </p>

        <v-alert v-if="notificationError" type="error" class="mb-4" closable density="compact" @click:close="notificationError = null">
          {{ notificationError }}
        </v-alert>

        <v-alert v-if="notificationSent" type="success" variant="tonal" class="mb-4" density="compact">
          Approval request sent! An admin will review your layout shortly.
        </v-alert>

        <v-btn
          v-if="!notificationSent"
          color="primary"
          :loading="notificationLoading"
          @click="sendApprovalNotification"
          prepend-icon="mdi-bell-ring-outline"
          class="text-none"
        >
          Notify Admin for Approval
        </v-btn>
      </div>

      <!-- Your Install Credentials -->
      <div class="glass-card mb-6">
        <div class="flex items-center gap-3 mb-4">
          <v-icon color="primary" size="28">mdi-key-variant</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Your Install Credentials</h2>
        </div>
        <p class="text-slate-400 text-sm mb-5">
          You will need these values when running the install script. Copy them now — the installer will prompt for both.
        </p>

        <div class="credential-row mb-3">
          <div class="credential-label">
            <span class="text-xs text-slate-500 uppercase tracking-widest font-medium">User UID</span>
          </div>
          <div class="credential-value">
            <code class="credential-mono">{{ user?.uid || '—' }}</code>
            <v-btn
              v-if="user?.uid"
              variant="text"
              size="x-small"
              :icon="copiedUid ? 'mdi-check' : 'mdi-content-copy'"
              :color="copiedUid ? 'success' : undefined"
              @click="copyValue(user.uid, 'uid')"
            />
          </div>
        </div>

        <div class="credential-row">
          <div class="credential-label">
            <span class="text-xs text-slate-500 uppercase tracking-widest font-medium">Layout ID</span>
          </div>
          <div class="credential-value">
            <code class="credential-mono">{{ primaryLayoutId || '—' }}</code>
            <v-btn
              v-if="primaryLayoutId"
              variant="text"
              size="x-small"
              :icon="copiedLayoutIdValue ? 'mdi-check' : 'mdi-content-copy'"
              :color="copiedLayoutIdValue ? 'success' : undefined"
              @click="copyValue(primaryLayoutId, 'layoutId')"
            />
          </div>
        </div>
      </div>

      <!-- Server Type Selection -->
      <div class="glass-card mb-6">
        <div class="flex items-center gap-3 mb-4">
          <v-icon color="primary" size="28">mdi-server-network</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Server Connection</h2>
        </div>
        <p class="text-slate-400 text-sm mb-4">
          How will your DEJA apps connect to your command station? You can change this later in settings.
        </p>

        <v-radio-group v-model="serverType" hide-details class="mb-4">
          <v-radio value="deja-server" color="primary">
            <template #label>
              <div>
                <div class="font-weight-bold text-sky-100">DEJA.js Server</div>
                <div class="text-caption text-slate-400">USB-connected to your DCC-EX Command Station.</div>
              </div>
            </template>
          </v-radio>
          <v-radio value="withrottle" color="primary" class="mt-3">
            <template #label>
              <div>
                <div class="font-weight-bold text-sky-100">WiThrottle Server</div>
                <div class="text-caption text-slate-400">Existing WiThrottle on your network (DCC-EX WiFi or JMRI).</div>
              </div>
            </template>
          </v-radio>
        </v-radio-group>

        <v-btn
          color="primary"
          variant="tonal"
          :loading="serverSaving"
          :prepend-icon="serverSaved ? 'mdi-check' : 'mdi-content-save'"
          class="text-none"
          @click="saveServerType"
        >
          {{ serverSaved ? 'Saved!' : 'Save Selection' }}
        </v-btn>
      </div>

      <!-- Quick Install -->
      <div class="glass-card mb-6">
        <div class="flex items-center gap-3 mb-4">
          <v-icon color="primary" size="28">mdi-download-outline</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Quick Install</h2>
        </div>
        <p class="text-slate-400 text-sm mb-2">
          Run one of these scripts on the machine connected to your DCC-EX Command Station.
        </p>
        <p class="text-slate-400 text-sm mb-5">
          The installer will prompt you for your <strong class="text-sky-300">User UID</strong> and <strong class="text-sky-300">Layout ID</strong> shown above.
        </p>

        <!-- macOS / Linux -->
        <p class="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">macOS / Linux</p>
        <div class="terminal-window mb-5">
          <div class="terminal-header">
            <div class="terminal-dots">
              <span class="dot dot-red" />
              <span class="dot dot-yellow" />
              <span class="dot dot-green" />
            </div>
            <span class="terminal-title">Terminal</span>
            <button
              class="terminal-copy"
              @click="copyScript(macScript, 'mac')"
              :title="copiedMac ? 'Copied!' : 'Copy to clipboard'"
            >
              <v-icon :icon="copiedMac ? 'mdi-check' : 'mdi-content-copy'" size="16" />
            </button>
          </div>
          <div class="terminal-body">
            <span class="terminal-prompt">$</span> {{ macScript }}
          </div>
        </div>

        <!-- Windows -->
        <p class="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">Windows (PowerShell)</p>
        <div class="terminal-window mb-5">
          <div class="terminal-header">
            <div class="terminal-dots">
              <span class="dot dot-red" />
              <span class="dot dot-yellow" />
              <span class="dot dot-green" />
            </div>
            <span class="terminal-title">PowerShell</span>
            <button
              class="terminal-copy"
              @click="copyScript(winScript, 'win')"
              :title="copiedWin ? 'Copied!' : 'Copy to clipboard'"
            >
              <v-icon :icon="copiedWin ? 'mdi-check' : 'mdi-content-copy'" size="16" />
            </button>
          </div>
          <div class="terminal-body">
            <span class="terminal-prompt">PS&gt;</span> {{ winScript }}
          </div>
        </div>

        <div class="divider-line my-5" />

        <div class="text-center">
          <p class="text-slate-500 text-xs mb-3">Need help with installation or troubleshooting?</p>
          <a
            href="https://dejajs.com/docs/install"
            target="_blank"
            rel="noopener noreferrer"
            class="advanced-link"
          >
            <v-icon size="16" class="mr-1">mdi-open-in-new</v-icon>
            View Install Guide &amp; Docs
          </a>
        </div>
      </div>

      <div class="text-center space-y-3">
        <Signout />
        <div>
          <a
            href="https://dejajs.com"
            class="advanced-link"
          >
            <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
            Back to dejajs.com
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pending-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 24px;
}
.pending-container {
  width: 100%;
  max-width: 560px;
}

.glass-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.glass-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(148, 163, 184, 0.1) 40%, rgba(20, 184, 166, 0.2));
  z-index: -1;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
}

/* Terminal window */
.terminal-window {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.15);
}
.terminal-header {
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.8);
  padding: 8px 12px;
  gap: 8px;
}
.terminal-dots {
  display: flex;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot-red { background: #ff5f57; }
.dot-yellow { background: #febc2e; }
.dot-green { background: #28c840; }
.terminal-title {
  flex: 1;
  text-align: center;
  font-size: 0.7rem;
  color: rgba(148, 163, 184, 0.5);
  font-weight: 500;
}
.terminal-copy {
  background: none;
  border: none;
  color: rgba(148, 163, 184, 0.5);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: color 150ms ease, background 150ms ease;
}
.terminal-copy:hover {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}
.terminal-body {
  background: rgba(2, 6, 23, 0.9);
  padding: 14px 16px;
  font-family: 'Roboto Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: #e0f2fe;
  word-break: break-all;
  line-height: 1.5;
}
.terminal-prompt {
  color: #22d3ee;
  margin-right: 8px;
  user-select: none;
}

.divider-line {
  height: 1px;
  background: rgba(148, 163, 184, 0.12);
}

.advanced-link {
  display: inline-flex;
  align-items: center;
  color: rgba(148, 163, 184, 0.6);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 150ms ease;
}
.advanced-link:hover {
  color: #38bdf8;
}

.credential-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.credential-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credential-mono {
  flex: 1;
  font-family: 'Roboto Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  color: #e0f2fe;
  background: rgba(2, 6, 23, 0.6);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  user-select: all;
  word-break: break-all;
}
</style>
