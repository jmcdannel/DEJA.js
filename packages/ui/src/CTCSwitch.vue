<template>
  <div
    class="ctc-switch"
    :class="{ 'ctc-switch--animate': animate }"
    role="img"
    :aria-labelledby="`${idPrefix}-title ${idPrefix}-desc`"
  >
    <svg
      :id="`${idPrefix}-svg`"
      class="ctc-switch__svg"
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="panelGradientId" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1a1a1d" />
          <stop offset="100%" stop-color="#050507" />
        </linearGradient>
        <linearGradient :id="handleGradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d7d7db" />
          <stop offset="100%" stop-color="#8d8f97" />
        </linearGradient>
        <radialGradient :id="lightOnId" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(255, 244, 117, 0.9)" />
          <stop offset="60%" stop-color="rgba(245, 220, 70, 0.6)" />
          <stop offset="100%" stop-color="rgba(255, 240, 153, 0)" />
        </radialGradient>
      </defs>

      <title :id="`${idPrefix}-title`">{{ labelText }}</title>
      <desc :id="`${idPrefix}-desc`">
        Decorative representation of a CTC switch panel labeled {{ labelText }}
      </desc>

      <g class="ctc-switch__panel">
        <path
          class="ctc-switch__panel-shape"
          d="M100 12c-24 0-45 11-60 30L16 116c-2 3-1 7 2 10l74 77a12 12 0 0 0 17 0l74-77c3-3 4-7 2-10l-24-74C151 26 127 12 100 12Z"
          :fill="`url(#${panelGradientId})`"
          stroke="#3b3b41"
          stroke-width="3"
        />
        <path
          class="ctc-switch__panel-highlight"
          d="M100 22c-20 0-38 9-50 26L32 119c-1 2-1 4 1 6l67 70a6 6 0 0 0 8 0l67-70c2-2 2-4 1-6l-21-71C147 35 126 22 100 22Z"
          fill="rgba(255,255,255,0.05)"
        />

        <text class="ctc-switch__identifier" x="100" y="64">{{ identifier }}</text>
        <text class="ctc-switch__label" x="100" y="96">{{ labelText.toUpperCase() }}</text>

        <text class="ctc-switch__letter" x="52" y="56">{{ leftLetter }}</text>
        <text class="ctc-switch__letter" x="148" y="56">{{ rightLetter }}</text>
        <text class="ctc-switch__letter" x="52" y="190">{{ lowerLeftLetter }}</text>
        <text class="ctc-switch__letter" x="148" y="190">{{ lowerRightLetter }}</text>
      </g>

      <g class="ctc-switch__lights">
        <g class="ctc-switch__light-group ctc-switch__light-group--left">
          <circle class="ctc-switch__light-glow" cx="44" cy="138" r="22" :fill="`url(#${lightOnId})`" />
          <circle class="ctc-switch__light-bulb" cx="44" cy="138" r="12" />
        </g>
        <g class="ctc-switch__light-group ctc-switch__light-group--right">
          <circle class="ctc-switch__light-glow" cx="156" cy="118" r="22" :fill="`url(#${lightOnId})`" />
          <circle class="ctc-switch__light-bulb" cx="156" cy="118" r="12" />
        </g>
      </g>

      <g class="ctc-switch__handle">
        <circle class="ctc-switch__pivot" cx="100" cy="156" r="18" />
        <path
          class="ctc-switch__lever"
          d="M90 92c-8 17-10 47-4 62 4 11 17 18 29 16l28-5c5-1 6-7 2-10l-30-28c-3-3-6-7-7-12l-6-30c-1-6-9-7-12-3Z"
          :fill="`url(#${handleGradientId})`"
        />
        <circle class="ctc-switch__knob" cx="134" cy="165" r="16" />
        <circle class="ctc-switch__knob-highlight" cx="128" cy="160" r="6" />
      </g>
    </svg>

    <p v-if="caption" class="ctc-switch__caption">{{ caption }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useId } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    identifier?: string | number
    label?: string
    caption?: string
    leftLetter?: string
    rightLetter?: string
    lowerLeftLetter?: string
    lowerRightLetter?: string
    animate?: boolean
  }>(),
  {
    identifier: '11',
    label: 'Switch',
    caption: '',
    leftLetter: 'N',
    rightLetter: 'R',
    lowerLeftLetter: 'L',
    lowerRightLetter: 'R',
    animate: true,
  }
)

const idPrefix = useId()

const labelText = computed(() => props.label || 'Switch')

const animate = computed(() => props.animate)

const panelGradientId = `${idPrefix}-panel-gradient`
const handleGradientId = `${idPrefix}-handle-gradient`
const lightOnId = `${idPrefix}-light-on`

const { identifier, caption, leftLetter, rightLetter, lowerLeftLetter, lowerRightLetter } = toRefs(props)
</script>

<style scoped>
.ctc-switch {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-radius: 1.5rem;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.65));
  box-shadow: 0 24px 40px rgba(0, 0, 0, 0.35);
  color: #f1f1f5;
  max-width: 280px;
}

.ctc-switch__svg {
  display: block;
  width: min(240px, 70vw);
  height: auto;
  filter: drop-shadow(0 12px 12px rgba(0, 0, 0, 0.4));
}

.ctc-switch__panel-shape {
  paint-order: stroke fill;
}

.ctc-switch__panel-highlight {
  mix-blend-mode: screen;
}

.ctc-switch__identifier {
  font-family: 'IBM Plex Sans Condensed', 'DIN Condensed', 'Roboto Condensed', sans-serif;
  font-weight: 600;
  font-size: 36px;
  letter-spacing: 6px;
  text-anchor: middle;
  fill: #f7f4ed;
}

.ctc-switch__label {
  font-family: 'IBM Plex Sans Condensed', 'DIN Condensed', 'Roboto Condensed', sans-serif;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 5px;
  text-anchor: middle;
  fill: #d9d6cf;
}

.ctc-switch__letter {
  font-family: 'IBM Plex Sans', 'Roboto', sans-serif;
  font-size: 22px;
  font-weight: 600;
  text-anchor: middle;
  fill: #f5f4f0;
}

.ctc-switch__lights {
  mix-blend-mode: screen;
}

.ctc-switch__light-group {
  transition: transform 0.4s ease;
}

.ctc-switch__light-bulb {
  fill: #303033;
  stroke: rgba(255, 255, 255, 0.35);
  stroke-width: 2;
}

.ctc-switch__light-glow {
  opacity: 0;
  transition: opacity 0.4s ease;
}

.ctc-switch__handle {
  transform-box: fill-box;
  transform-origin: 100px 156px;
  transition: transform 0.6s cubic-bezier(0.65, -0.2, 0.25, 1.35);
}

.ctc-switch__pivot {
  fill: #6e6f74;
  stroke: rgba(0, 0, 0, 0.45);
  stroke-width: 3;
}

.ctc-switch__lever {
  filter: drop-shadow(-2px 5px 4px rgba(0, 0, 0, 0.35));
}

.ctc-switch__knob {
  fill: #f4f4f7;
  stroke: rgba(60, 60, 65, 0.6);
  stroke-width: 3;
}

.ctc-switch__knob-highlight {
  fill: rgba(255, 255, 255, 0.75);
}

.ctc-switch__caption {
  font-family: 'IBM Plex Sans', 'Roboto', sans-serif;
  font-size: 0.875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.ctc-switch--animate .ctc-switch__handle {
  animation: ctc-handle-sway 5s ease-in-out infinite;
}

.ctc-switch--animate .ctc-switch__light-group--left {
  animation: ctc-light-left 5s ease-in-out infinite;
}

.ctc-switch--animate .ctc-switch__light-group--right {
  animation: ctc-light-right 5s ease-in-out infinite;
}

.ctc-switch--animate .ctc-switch__light-glow {
  animation: ctc-light-glow 5s ease-in-out infinite;
}

@keyframes ctc-handle-sway {
  0%,
  100% {
    transform: rotate(-18deg);
  }
  50% {
    transform: rotate(16deg);
  }
}

@keyframes ctc-light-left {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-2px, 4px);
  }
}

@keyframes ctc-light-right {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(2px, -3px);
  }
}

@keyframes ctc-light-glow {
  0%,
  100% {
    opacity: 0.1;
  }
  20%,
  80% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ctc-switch--animate .ctc-switch__handle,
  .ctc-switch--animate .ctc-switch__light-group,
  .ctc-switch--animate .ctc-switch__light-glow {
    animation: none;
  }
}
</style>
