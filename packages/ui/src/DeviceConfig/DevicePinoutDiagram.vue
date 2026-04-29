<script setup lang="ts">
import { computed } from 'vue'
import type {
  ArduinoAdvancedConfig,
  Device,
  Effect,
  Sensor,
  Signal,
  Turnout,
} from '@repo/modules'

/**
 * 📌 Read-only pinout diagram that maps every assigned board pin on an
 * Arduino-family device to its owning role (effect output, sensor, signal
 * lamp, kato turnout pulse, PCA9685 I²C SDA/SCL).
 *
 * Conflicts — same pin assigned to two different roles — are flagged red with
 * an alert summarizing the collision.
 */
interface DevicePinoutDiagramProps {
  device: Device | null
  effects?: Effect[]
  sensors?: Sensor[]
  signals?: Signal[]
  turnouts?: Turnout[]
  color?: string
}

const props = withDefaults(defineProps<DevicePinoutDiagramProps>(), {
  effects: () => [],
  sensors: () => [],
  signals: () => [],
  turnouts: () => [],
  color: 'cyan',
})

type PinRole =
  | 'output'
  | 'sensor'
  | 'signal-red'
  | 'signal-yellow'
  | 'signal-green'
  | 'turnout-straight'
  | 'turnout-divergent'
  | 'i2c-sda'
  | 'i2c-scl'

interface PinAssignment {
  pin: number | string
  role: PinRole
  label: string
  owner: string
  icon: string
  color: string
}

/** Normalize a pin value to a string key so we can group by identity. */
function keyOf(pin: number | string): string {
  return String(pin)
}

const advanced = computed<ArduinoAdvancedConfig>(
  () => props.device?.config?.arduino ?? {},
)

// ── Collect every assigned pin ──────────────────────────────────────

const assignments = computed<PinAssignment[]>(() => {
  const out: PinAssignment[] = []

  for (const e of props.effects) {
    if (e.pin == null) continue
    out.push({
      pin: e.pin,
      role: 'output',
      label: 'Output',
      owner: e.name || e.id || 'Effect',
      icon: 'mdi-lightbulb',
      color: 'amber',
    })
  }

  for (const s of props.sensors) {
    if (s.pin == null) continue
    out.push({
      pin: s.pin,
      role: 'sensor',
      label: 'Sensor',
      owner: s.name || s.id || 'Sensor',
      icon: 'mdi-radar',
      color: 'cyan',
    })
  }

  for (const sig of props.signals) {
    const owner = sig.name || sig.id || 'Signal'
    if (typeof sig.red === 'number') {
      out.push({
        pin: sig.red,
        role: 'signal-red',
        label: 'Signal (R)',
        owner,
        icon: 'mdi-circle',
        color: 'red',
      })
    }
    if (typeof sig.yellow === 'number') {
      out.push({
        pin: sig.yellow,
        role: 'signal-yellow',
        label: 'Signal (Y)',
        owner,
        icon: 'mdi-circle',
        color: 'yellow',
      })
    }
    if (typeof sig.green === 'number') {
      out.push({
        pin: sig.green,
        role: 'signal-green',
        label: 'Signal (G)',
        owner,
        icon: 'mdi-circle',
        color: 'green',
      })
    }
  }

  for (const t of props.turnouts) {
    // Only kato turnouts use board pins; servo turnouts live on the PCA9685 bus.
    if (t.type !== 'kato') continue
    const owner = t.name || t.id || 'Turnout'
    if (typeof t.straight === 'number') {
      out.push({
        pin: t.straight,
        role: 'turnout-straight',
        label: 'Turnout (straight)',
        owner,
        icon: 'mdi-arrow-up',
        color: 'emerald',
      })
    }
    if (typeof t.divergent === 'number') {
      out.push({
        pin: t.divergent,
        role: 'turnout-divergent',
        label: 'Turnout (divergent)',
        owner,
        icon: 'mdi-arrow-bottom-right',
        color: 'orange',
      })
    }
  }

  if (typeof advanced.value.pca9685SdaPin === 'number') {
    out.push({
      pin: advanced.value.pca9685SdaPin,
      role: 'i2c-sda',
      label: 'PCA9685 SDA',
      owner: 'I²C bus',
      icon: 'mdi-swap-horizontal',
      color: 'purple',
    })
  }
  if (typeof advanced.value.pca9685SclPin === 'number') {
    out.push({
      pin: advanced.value.pca9685SclPin,
      role: 'i2c-scl',
      label: 'PCA9685 SCL',
      owner: 'I²C bus',
      icon: 'mdi-swap-vertical',
      color: 'purple',
    })
  }

  return out
})

// ── Group by pin and detect conflicts ───────────────────────────────

interface PinGroup {
  key: string
  pin: number | string
  assignments: PinAssignment[]
  /** True when more than one distinct role targets this pin. */
  conflict: boolean
}

const grouped = computed<PinGroup[]>(() => {
  const map = new Map<string, PinGroup>()
  for (const a of assignments.value) {
    const k = keyOf(a.pin)
    let group = map.get(k)
    if (!group) {
      group = { key: k, pin: a.pin, assignments: [], conflict: false }
      map.set(k, group)
    }
    group.assignments.push(a)
  }
  for (const g of map.values()) {
    g.conflict = g.assignments.length > 1
  }
  // Sort: numeric pins ascending, strings (e.g. "A0") after.
  return Array.from(map.values()).sort((a, b) => {
    const an = typeof a.pin === 'number' ? a.pin : Number.NaN
    const bn = typeof b.pin === 'number' ? b.pin : Number.NaN
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn
    if (Number.isFinite(an)) return -1
    if (Number.isFinite(bn)) return 1
    return String(a.pin).localeCompare(String(b.pin))
  })
})

const conflicts = computed(() => grouped.value.filter((g) => g.conflict))

// ── Servo turnouts on the PCA9685 bus ───────────────────────────────

interface ServoSlot {
  index: number
  owner: string
}

const servoSlots = computed<ServoSlot[]>(() =>
  props.turnouts
    .filter((t) => t.type === 'servo' && typeof t.turnoutIdx === 'number')
    .map((t) => ({ index: t.turnoutIdx as number, owner: t.name || t.id || 'Turnout' }))
    .sort((a, b) => a.index - b.index),
)

const hasAnyAssignments = computed(
  () => grouped.value.length > 0 || servoSlots.value.length > 0,
)
</script>

<template>
  <section v-if="hasAnyAssignments" class="device-pinout">
    <div class="d-flex align-center mb-3">
      <v-icon icon="mdi-chip" class="mr-2" :color="color" />
      <h3 class="text-h6 font-weight-medium">Pinout</h3>
      <v-chip size="x-small" class="ml-2" variant="tonal" :color="color">
        {{ grouped.length }} pins
      </v-chip>
      <v-chip
        v-if="servoSlots.length > 0"
        size="x-small"
        class="ml-1"
        variant="tonal"
        color="purple"
      >
        {{ servoSlots.length }} servos
      </v-chip>
    </div>

    <v-alert
      v-if="conflicts.length > 0"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-3 text-caption"
      icon="mdi-alert-octagon"
    >
      <div class="font-weight-bold mb-1">Pin conflicts detected</div>
      <div v-for="g in conflicts" :key="g.key" class="text-caption">
        Pin <code class="font-mono">{{ g.pin }}</code> is assigned to
        <span v-for="(a, i) in g.assignments" :key="i">
          <span v-if="i > 0"> + </span>
          <strong>{{ a.label }}</strong> ({{ a.owner }})
        </span>
      </div>
    </v-alert>

    <!-- Board pins grid -->
    <div v-if="grouped.length > 0" class="device-pinout__grid">
      <div
        v-for="g in grouped"
        :key="g.key"
        class="device-pinout__pin"
        :class="{ 'device-pinout__pin--conflict': g.conflict }"
      >
        <div class="device-pinout__pin-number">
          {{ g.pin }}
        </div>
        <div class="device-pinout__pin-body">
          <div
            v-for="(a, i) in g.assignments"
            :key="i"
            class="device-pinout__assignment"
          >
            <v-icon :icon="a.icon" :color="a.color" size="14" />
            <span class="device-pinout__assignment-label">{{ a.label }}</span>
            <span class="device-pinout__assignment-owner" :title="a.owner">
              {{ a.owner }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- PCA9685 servo bus (not board pins — servo index 0–15 on the driver) -->
    <div v-if="servoSlots.length > 0" class="mt-4">
      <div class="text-caption font-weight-bold text-grey-lighten-2 mb-2 uppercase tracking-wider">
        PCA9685 servo bus
      </div>
      <div class="device-pinout__servo-grid">
        <div
          v-for="slot in servoSlots"
          :key="slot.index"
          class="device-pinout__servo"
        >
          <div class="device-pinout__servo-index">CH {{ slot.index }}</div>
          <div class="device-pinout__servo-owner" :title="slot.owner">
            {{ slot.owner }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.device-pinout__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 0.5rem;
}

.device-pinout__pin {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  padding: 0.45rem 0.55rem;
  transition: border-color 150ms ease;
}

.device-pinout__pin:hover {
  border-color: rgba(56, 189, 248, 0.5);
}

.device-pinout__pin--conflict {
  border-color: rgba(239, 68, 68, 0.55);
  background: rgba(239, 68, 68, 0.08);
}

.device-pinout__pin-number {
  flex-shrink: 0;
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: #f8fafc;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 6px;
}

.device-pinout__pin-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  justify-content: center;
}

.device-pinout__assignment {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}

.device-pinout__assignment-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #e0f2fe;
  flex-shrink: 0;
}

.device-pinout__assignment-owner {
  font-size: 0.65rem;
  color: rgba(148, 163, 184, 0.75);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.device-pinout__servo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.4rem;
}

.device-pinout__servo {
  background: rgba(147, 51, 234, 0.08);
  border: 1px solid rgba(147, 51, 234, 0.3);
  border-radius: 6px;
  padding: 0.4rem 0.5rem;
  min-width: 0;
}

.device-pinout__servo-index {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: #e9d5ff;
}

.device-pinout__servo-owner {
  font-size: 0.65rem;
  color: rgba(233, 213, 255, 0.75);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
