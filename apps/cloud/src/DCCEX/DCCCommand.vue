<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDcc } from '@/DCCEX/useDcc'

const props = defineProps({
  cmd: Object,
})

const active = ref(false)
const dccCommand = ref(props.cmd.command)

const { sendDccCommand } = useDcc()

async function send () {
  console.log('sendDccCommand', props.cmd)
  switch(props.cmd.type) {
    case 'toggle':
      toggle()
      break
    default:
      console.log('cmd', props.cmd)
      break
  }
  console.log('sendDccCommand', dccCommand.value)
  dccCommand.value && sendDccCommand({ action: 'dcc', payload: dccCommand.value})
  dccCommand.value = ''
}

async function toggle() {
  active.value = !active.value
  dccCommand.value = active.value ? props.cmd?.command[1] : props.cmd?.command[0]
  console.log('toggle', props.cmd, active.value, dccCommand.value)
}

</script>
<template>
  
  <v-switch v-if="cmd?.type === 'toggle'" :prepend-icon="cmd?.icon" @click="send" :label="cmd.label" color="primary"></v-switch>
  <v-text-field v-else-if="cmd?.type === 'text'"
    v-model="dccCommand"
    :prepend-inner-icon="cmd?.icon"
    label="DCC Command"
    variant="solo"
    class="ma-2 max-w-96"
    append-inner-icon="mdi-send"
    density="compact"
    hide-details
    single-line
    @click:append-inner="send"
    @keyup.enter="send"
  ></v-text-field>
  <v-btn v-else :prepend-icon="cmd?.icon" @click="send">{{ cmd?.label || 'Go' }}</v-btn>

  <!-- <pre>{{ props.cmd.command }}</pre> -->
</template>