<script setup lang="ts">
    const props = defineProps({
    value: { type: Number, required: true },
    label: { type: String, required: true },
    emptyLabel: { type: String, default: '' },
    color: { type: String, default: 'indigo' }
    })
</script>

<template>
    <div class="mt-4">
        <div v-if="value === 0" class="text-sm text-gray-400">{{ emptyLabel }}</div>

        <div v-else class="flex items-center space-x-3">
        <v-sheet
            class="flex items-center justify-center w-12 h-12 rounded-lg text-white text-2xl font-extrabold shadow-md"
            :color="color"
            aria-hidden="true"
        >
            {{ value }}
        </v-sheet>

        <div class="text-sm text-gray-200">
            <div class="font-medium capitalize">{{ value !== 1 ? label + 's' : label }}</div>
        </div>
        </div>
    </div>
</template>