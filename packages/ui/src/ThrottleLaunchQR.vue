<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

interface Props {
  url?: string
  size?: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  url: 'https://throttle.dejajs.com',
  size: 160,
  label: 'Scan to open Throttle',
})

const qrDataUrl = ref<string>('')

async function generateQR(value: string) {
  try {
    qrDataUrl.value = await QRCode.toDataURL(value, {
      width: props.size * 2,
      margin: 1,
      color: {
        dark: '#00E5FF',
        light: '#00000000',
      },
    })
  } catch {
    // fallback — no QR rendered
  }
}

onMounted(() => generateQR(props.url))
watch(() => props.url, (val) => generateQR(val))
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div
      class="rounded-xl border border-deja-cyan/30 bg-gray-950/80 p-3 inline-block"
      :style="{ width: `${size + 24}px`, height: `${size + 24}px` }"
    >
      <img
        v-if="qrDataUrl"
        :src="qrDataUrl"
        :alt="label"
        :width="size"
        :height="size"
        class="block"
      />
      <div
        v-else
        :style="{ width: `${size}px`, height: `${size}px` }"
        class="bg-gray-800/50 rounded animate-pulse"
      />
    </div>
    <p v-if="label" class="text-xs text-gray-400 font-mono text-center">{{ label }}</p>
  </div>
</template>
