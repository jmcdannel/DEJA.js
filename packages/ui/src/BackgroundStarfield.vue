<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let resizeHandler: (() => void) | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const draw = (c: CanvasRenderingContext2D, w: number, h: number) => {
    c.clearRect(0, 0, w, h)

    const starLayers = [
      { count: 400, maxSize: 0.8, maxAlpha: 0.4 },
      { count: 200, maxSize: 1.2, maxAlpha: 0.7 },
      { count: 80, maxSize: 2, maxAlpha: 1 },
      { count: 15, maxSize: 3, maxAlpha: 1 },
    ]

    let seed = 42
    const rand = () => {
      seed = (seed * 16807 + 0) % 2147483647
      return seed / 2147483647
    }

    for (const layer of starLayers) {
      for (let i = 0; i < layer.count; i++) {
        const x = rand() * w
        const y = rand() * h
        const size = rand() * layer.maxSize + 0.3
        const alpha = rand() * layer.maxAlpha + 0.1

        const colorRand = rand()
        let r = 255, g = 255, b = 255
        if (colorRand < 0.2) { r = 200; g = 220; b = 255 }
        else if (colorRand < 0.35) { r = 255; g = 240; b = 220 }
        else if (colorRand < 0.4) { r = 180; g = 200; b = 255 }

        c.beginPath()
        c.arc(x, y, size, 0, Math.PI * 2)
        c.fillStyle = `rgba(${r},${g},${b},${alpha})`
        c.fill()

        if (size > 1.5) {
          c.beginPath()
          c.arc(x, y, size * 3, 0, Math.PI * 2)
          const glow = c.createRadialGradient(x, y, 0, x, y, size * 3)
          glow.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.3})`)
          glow.addColorStop(1, 'transparent')
          c.fillStyle = glow
          c.fill()
        }
      }
    }

    const gx = w * 0.3, gy = 0, gx2 = w * 0.7, gy2 = h
    const galaxyGrad = c.createLinearGradient(gx, gy, gx2, gy2)
    galaxyGrad.addColorStop(0, 'transparent')
    galaxyGrad.addColorStop(0.3, 'rgba(100, 80, 160, 0.03)')
    galaxyGrad.addColorStop(0.5, 'rgba(120, 100, 180, 0.05)')
    galaxyGrad.addColorStop(0.7, 'rgba(100, 80, 160, 0.03)')
    galaxyGrad.addColorStop(1, 'transparent')

    c.save()
    c.translate(w / 2, h / 2)
    c.rotate(-0.4)
    c.translate(-w / 2, -h / 2)
    c.fillStyle = galaxyGrad
    c.fillRect(-w * 0.2, -h * 0.2, w * 1.4, h * 1.4)
    c.restore()
  }

  resizeHandler = () => {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    draw(ctx, canvas.width, canvas.height)
  }

  resizeHandler()
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})
</script>

<template>
  <div class="starfield-bg">
    <canvas ref="canvasRef" class="starfield-canvas" />
    <div class="starfield-glow" />
    <div class="starfield-glow-inner" />
  </div>
</template>

<style scoped>
.starfield-bg {
  position: absolute;
  inset: 0;
  background: #03010a;
  overflow: hidden;
}

.starfield-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.starfield-glow {
  position: absolute;
  bottom: -80px;
  left: 50%;
  width: 120%;
  height: 500px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(88, 28, 135, 0.25);
  filter: blur(100px);
  pointer-events: none;
}

.starfield-glow-inner {
  position: absolute;
  bottom: -40px;
  left: 50%;
  width: 80%;
  height: 300px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(126, 34, 206, 0.15);
  filter: blur(80px);
  pointer-events: none;
}
</style>
