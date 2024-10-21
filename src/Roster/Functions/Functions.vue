<script setup lang="ts">
import { ref } from 'vue'
import { useFunctions } from '@/Roster/Functions/useFunctions'
import ViewJson from '@/Core/UI/ViewJson.vue'
import Func from '@/Roster/Functions/Function.vue'
import EditFunc from '@/Roster/Functions/EditFunction.vue'
import { useFunctionIcon } from '@/Roster/Functions/useFunctionIcon'

const props = defineProps({
  loco: Object
})

const { getIconComponent } = useFunctionIcon()
const editMode = ref(false)
const editFunc = ref(null)
const editDefaultFunc = ref(null)

const { defaultFunctions } = useFunctions()

function handleEdit(id) {
  console.log('handleEdit', id)
  editFunc.value = props.loco?.functions?.find(lf => lf.id === id)
  editDefaultFunc.value = defaultFunctions.find(df => df.id === id)
}

function handleCancel() {
  console.log('handleCancel')
  editFunc.value = null
  editDefaultFunc.value = null
}

</script>
<template>
  <EditFunc v-if="editDefaultFunc" :loco="loco" :config="editDefaultFunc" :func="editFunc" @cancel="handleCancel" />
  <template v-else>
    <v-btn v-if="editMode" class="m-1" color="pink-accent-1" prepend-icon="mdi-pencil" @click="editMode = false">Cancel Edit Mode</v-btn>
    <v-btn v-else class="m-1" color="pink" prepend-icon="mdi-pencil" @click="editMode = true">Enable Edit Mode</v-btn>
    <templat v-for="defaultFunc in defaultFunctions" :key="defaultFunc.label">
      <Func @edit="handleEdit" :config="defaultFunc" :editMode="editMode" :func="loco?.functions?.find(lf => lf.id === defaultFunc.id)" />
    </templat>

  </template>
  <!-- <template v-for="defaultFunc in defaultFunctions" :key="defaultFunc.label">
    <ViewJson :json="defaultFunc" label="RAW DEFAULT"></ViewJson>
    <ViewJson :json="loco?.functions.find(lf => lf.id === defaultFunc.id)" label="RAW LOCO"></ViewJson>
  </template> -->
  <ViewJson :json="loco?.functions" label="RAW Functions Data"></ViewJson>
  <ViewJson :json="defaultFunctions" label="RAW DEFAULT FUNCTIONS"></ViewJson>
</template>