<script setup lang="ts">
import PageHeader from '@/Core/UI/PageHeader.vue'
import DCCCommand from '@/DCCEX/DCCCommand.vue'
import DCCLog from '@/DCCEX/Log/DCCLog.vue'
import { defaultCommands } from '@repo/dccex'

</script>
<template>
  <PageHeader menu="DCC-EX" />
  <DCCCommand v-for="cmd in defaultCommands" :cmd="cmd" />
  <DCCLog />  
</template>