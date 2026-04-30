<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser, useCollection } from 'vuefire'
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase-node'
import type { ServerRecordWithId } from '@repo/modules'
import ConnectServerDialog from './ConnectServerDialog.vue'

const user = useCurrentUser()

const serversRef = computed(() =>
  user.value ? collection(db, 'users', user.value.uid, 'servers') : null,
)
const servers = useCollection<ServerRecordWithId>(serversRef)

const dialogOpen = ref(false)

function statusOf(server: ServerRecordWithId): { color: string; label: string } {
  if (server.revoked) return { color: 'error', label: 'Revoked' }
  if (!server.lastSeenAt) return { color: 'grey', label: 'Never connected' }
  const ageMs = Date.now() - server.lastSeenAt.toDate().getTime()
  if (ageMs < 5 * 60_000) return { color: 'success', label: 'Connected' }
  if (ageMs < 60 * 60_000) return { color: 'warning', label: 'Idle' }
  return { color: 'grey', label: 'Offline' }
}

function lastSeenLabel(server: ServerRecordWithId): string {
  if (!server.lastSeenAt) return 'Never connected'
  return `Last seen ${server.lastSeenAt.toDate().toLocaleString()}`
}

async function revokeServer(server: ServerRecordWithId) {
  if (!user.value) return
  if (!confirm(`Revoke "${server.name}"? This server will lose write access within seconds.`)) return
  await updateDoc(doc(db, 'users', user.value.uid, 'servers', server.id), { revoked: true })
}

async function deleteServer(server: ServerRecordWithId) {
  if (!user.value) return
  if (!confirm(`Permanently delete "${server.name}"? This cannot be undone.`)) return
  await deleteDoc(doc(db, 'users', user.value.uid, 'servers', server.id))
}
</script>

<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-server-network" class="mr-2" />
      Connected Servers
    </v-card-title>
    <v-card-text>
      <v-list v-if="servers && servers.length > 0">
        <v-list-item v-for="server in servers" :key="server.id" lines="two">
          <template #prepend>
            <v-icon :color="statusOf(server).color" icon="mdi-circle" size="small" />
          </template>
          <v-list-item-title>{{ server.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ statusOf(server).label }} · {{ lastSeenLabel(server) }}
          </v-list-item-subtitle>
          <template #append>
            <v-btn
              v-if="!server.revoked"
              variant="text"
              size="small"
              color="warning"
              @click="revokeServer(server)"
            >
              Revoke
            </v-btn>
            <v-btn
              v-else
              variant="text"
              size="small"
              color="error"
              @click="deleteServer(server)"
            >
              Delete
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
      <v-alert v-else type="info" variant="tonal" class="mb-4">
        No servers connected yet. Click below to connect your first server.
      </v-alert>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="dialogOpen = true"
      >
        Connect a new server
      </v-btn>
    </v-card-text>
    <ConnectServerDialog v-model="dialogOpen" />
  </v-card>
</template>
