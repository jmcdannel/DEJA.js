<script setup lang="ts">
import { type PropType } from 'vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import Item from './Item.vue'
import Table from './Table.vue'
import EmptyState from '../EmptyState/EmptyState.vue'
import type { DocumentData } from 'firebase/firestore'

const cols = {
  xs: 12, sm: 6, md: 4, lg: 4, xl: 3, xxl: 2,
}

const emit = defineEmits(['update:state'])

const props = defineProps({
  list: { type: Array as PropType<DocumentData[]>, default: () => [] },
  viewAs: { type: String, default: 'card' },
  loading: { type: Boolean, default: false },
  emptyIcon: { type: String, default: undefined },
  emptyTitle: { type: String, default: undefined },
  emptyDescription: { type: String, default: undefined },
})

function handleUpdateState(item: DocumentData, newState: boolean) {
  emit('update:state', item, newState)
}
</script>

<template>
  <div class="w-full p-4">
    <v-row v-if="loading">
      <v-col v-for="n in 6" :key="n" :cols="cols.xs" :sm="cols.sm" :md="cols.md" :lg="cols.lg" :xl="cols.xl" :xxl="cols.xxl">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>
    <EmptyState
      v-else-if="!list.length"
      :icon="emptyIcon"
      :title="emptyTitle"
      :description="emptyDescription"
    />
    <Table v-else-if="viewAs === 'table'"
      :list="list"
      @update:state="handleUpdateState"
    />
    <v-row v-else v-auto-animate>
      <v-col :cols="cols.xs" :sm="cols.sm" :md="cols.md" :lg="cols.lg" :xl="cols.xl" :xxl="cols.xxl"
        v-for="item in list"
        :key="item.id">
        <Item :item="item" :viewAs="viewAs" @update:state="handleUpdateState" />
      </v-col>
    </v-row>
  </div>
</template>
