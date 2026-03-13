<script setup lang="ts">
interface CheatEntry {
  command: string
  description: string
  color: string
  /** Italic parameter portion of the command */
  params?: string
}

const sections: CheatEntry[][] = [
  // Power
  [
    { command: '<1>', description: 'power on', color: '#4ade80' },
    { command: '<0>', description: 'power off', color: '#4ade80' },
    { command: '<1 MAIN>', description: 'main track on', color: '#4ade80' },
    { command: '<1 PROG>', description: 'prog track on', color: '#4ade80' },
    { command: '<1 JOIN>', description: 'join tracks', color: '#4ade80' },
  ],
  // Throttle / Loco
  [
    { command: '<t ', description: 'throttle', color: '#fbbf24', params: 'a s d>' },
    { command: '<F ', description: 'function', color: '#fbbf24', params: 'a f s>' },
    { command: '<!>', description: 'emergency stop', color: '#f87171' },
  ],
  // Turnouts / Outputs
  [
    { command: '<T ', description: 'turnout', color: '#a78bfa', params: 'i s>' },
    { command: '<Z ', description: 'output', color: '#a78bfa', params: 'p s>' },
  ],
  // System
  [
    { command: '<s>', description: 'status', color: '#38bdf8' },
    { command: '<D RESET>', description: 'reset', color: '#38bdf8' },
    { command: '<E>', description: 'save EEPROM', color: '#38bdf8' },
    { command: '<R ', description: 'read CV', color: '#38bdf8', params: 'cv>' },
    { command: '<->', description: 'forget locos', color: '#38bdf8' },
    { command: '<JR>', description: 'list roster', color: '#38bdf8' },
  ],
]
</script>

<template>
  <div class="cheatsheet-panel">
    <div class="cheatsheet-title">Command Cheat Sheet</div>

    <div class="cheatsheet-body">
      <template v-for="(section, sIdx) in sections" :key="sIdx">
        <div
          v-for="(entry, eIdx) in section"
          :key="`${sIdx}-${eIdx}`"
          class="cheatsheet-row"
        >
          <span class="cheatsheet-cmd">
            <span :style="{ color: entry.color }">{{ entry.command }}</span>
            <span v-if="entry.params" class="cheatsheet-params">{{ entry.params }}</span>
          </span>
          <span class="cheatsheet-desc">{{ entry.description }}</span>
        </div>
        <div
          v-if="sIdx < sections.length - 1"
          class="cheatsheet-divider"
        />
      </template>
    </div>

    <!-- Parameter legend -->
    <div class="cheatsheet-legend">
      <div>a=addr s=speed/state d=dir f=func i=idx p=pin cv=CV#</div>
      <a href="https://dcc-ex.com/reference/software/command-reference.html" target="_blank" rel="noopener noreferrer" class="cheatsheet-link">
        DCC-EX Command Reference <v-icon size="10">mdi-open-in-new</v-icon>
      </a>
    </div>
  </div>
</template>

<style scoped>
.cheatsheet-panel {
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  padding: 14px;
}

.cheatsheet-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #38bdf8;
  margin-bottom: 10px;
  font-weight: 600;
}

.cheatsheet-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cheatsheet-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
}

.cheatsheet-cmd {
  font-size: 11px;
  white-space: nowrap;
}

.cheatsheet-params {
  color: #64748b;
  font-style: italic;
}

.cheatsheet-desc {
  font-size: 10px;
  color: #94a3b8;
  text-align: right;
  white-space: nowrap;
}

.cheatsheet-divider {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  margin: 4px 0;
}

.cheatsheet-legend {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  font-family: 'Courier New', monospace;
  font-size: 9px;
  color: #475569;
  font-style: italic;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.cheatsheet-link {
  color: #38bdf8;
  text-decoration: none;
  font-style: normal;
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.cheatsheet-link:hover {
  text-decoration: underline;
}
</style>
