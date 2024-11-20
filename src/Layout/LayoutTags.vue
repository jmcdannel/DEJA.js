<script setup lang="ts">
import { ref } from 'vue'
import TagList from '@/Common/Tags/TagList.vue'
import TagForm from '@/Common/Tags/TagForm.vue'
const editTag = ref(null)
const addTag = ref(false)
function handleClose () {
  addTag.value = false
  editTag.value = null
}
</script>
<template>
  <v-card 
    class="mx-auto w-full h-full justify-between flex flex-col border-t-4 border-b-4"
    :prepend-icon="'mdi-usb'"
    title="Tags"
    variant="tonal"
    density="compact">
    <v-card-text>
      <TagForm v-if="addTag || editTag" 
        :tag="editTag"
        @close="handleClose" 
      />
      <TagList v-else
        @select="(tag) => editTag = tag"
      >
        <template #append>
          <v-chip variant="outlined" @click="addTag = true">Add Tag</v-chip>
        </template>
      </TagList>
    </v-card-text>
  </v-card>
</template>