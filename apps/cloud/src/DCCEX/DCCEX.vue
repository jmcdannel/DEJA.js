<script setup lang="ts">
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import DCCCommand from '@/DCCEX/DCCCommand.vue'
import DCCLog from '@/DCCEX/Log/DCCLog.vue'
import { defaultCommands } from '@repo/dccex'

</script>
<template>
  <ModuleTitle menu="DCC-EX" />
  <DCCCommand v-for="cmd in defaultCommands" :cmd="cmd" />
  <DCCLog />  
</template>