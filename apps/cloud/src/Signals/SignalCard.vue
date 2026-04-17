<script setup lang="ts">
import type { Signal, SignalAspect } from '@repo/modules/signals'
import { ListItemCard } from '@repo/ui'

const props = defineProps<{
  signal: Signal
  color: string
  confirming: boolean
  canToggle: (signal: Signal, aspect: Exclude<SignalAspect, null>) => boolean
}>()

const emit = defineEmits<{
  'toggle-aspect': [signal: Signal, aspect: Exclude<SignalAspect, null>]
  'request-delete': [signal: Signal]
  'cancel-delete': []
  'confirm-delete': [id: string]
  edit: [signal: Signal]
}>()
</script>

<template>
  <ListItemCard
    :item-id="signal?.id"
    :device-id="signal?.device"
    :color="color"
  >
    <template #header-leading>
      <v-avatar :color="color" variant="tonal" size="32" rounded="lg">
        <v-icon icon="mdi-traffic-light" :color="color" size="18" />
      </v-avatar>
    </template>

    <template #title>
      <span class="text-sm font-semibold text-[#f8fafc] truncate">
        {{ signal.name || signal.id }}
      </span>
    </template>

    <template #subtitle>
      signal · {{ signal.commonAnode ? 'common anode' : 'common cathode' }}
    </template>

    <template #status>
      <v-icon
        :icon="signal.aspect ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="
          signal.aspect === 'red'
            ? 'red'
            : signal.aspect === 'yellow'
              ? 'amber'
              : signal.aspect === 'green'
                ? 'green'
                : 'grey'
        "
        size="14"
      />
    </template>

    <div class="flex items-center gap-3">
      <div
        class="flex flex-col items-center p-2 rounded-lg bg-neutral-900 border border-neutral-800"
        style="width: 52px;"
      >
        <v-btn
          icon="mdi-circle"
          size="x-small"
          :color="signal.aspect === 'red' ? 'red-darken-1' : 'red'"
          :variant="signal.aspect === 'red' ? 'flat' : 'tonal'"
          :disabled="!canToggle(signal, 'red')"
          @click="emit('toggle-aspect', signal, 'red')"
        />
        <v-btn
          icon="mdi-circle"
          class="my-1"
          size="x-small"
          :color="signal.aspect === 'yellow' ? 'amber-darken-2' : 'amber'"
          :variant="signal.aspect === 'yellow' ? 'flat' : 'tonal'"
          :disabled="!canToggle(signal, 'yellow')"
          @click="emit('toggle-aspect', signal, 'yellow')"
        />
        <v-btn
          icon="mdi-circle"
          size="x-small"
          :color="signal.aspect === 'green' ? 'green-darken-2' : 'green'"
          :variant="signal.aspect === 'green' ? 'flat' : 'tonal'"
          :disabled="!canToggle(signal, 'green')"
          @click="emit('toggle-aspect', signal, 'green')"
        />
      </div>
      <div class="text-xs text-slate-400 space-y-0.5">
        <div>R: {{ signal.red ?? '—' }}</div>
        <div>Y: {{ signal.yellow ?? '—' }}</div>
        <div>G: {{ signal.green ?? '—' }}</div>
      </div>
    </div>

    <template #footer>
      <v-btn
        v-if="!confirming"
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click="emit('request-delete', signal)"
      />
      <template v-else>
        <v-btn
          text="Cancel"
          variant="outlined"
          size="small"
          @click="emit('cancel-delete')"
        />
        <v-btn
          text="Confirm"
          variant="tonal"
          color="error"
          size="small"
          prepend-icon="mdi-delete"
          @click="emit('confirm-delete', signal.id)"
        />
      </template>
      <v-spacer />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="color"
        size="small"
        @click="emit('edit', signal)"
      />
    </template>
  </ListItemCard>
</template>
