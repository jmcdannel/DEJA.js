<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules'
import { useColors } from '@repo/ui'
import CTCSwitchSVG from './ctc-switch-svg.vue'

const { setTurnout } = useTurnouts()

interface Props {
  turnout: Turnout
  turnoutId?: string
  state?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:state': [value: boolean]
}>()

const { colors, DEFAULT_COLOR } = useColors()
const color = computed(() => colors[props.turnout.color || DEFAULT_COLOR])

const indicatorNColor = computed(() => {
  return props.state ? 'rgb(200,200,200)' : 'rgb(242,13,13)'
})
const indicatorRColor = computed(() => {
  return props.state ? 'rgb(67,242,13)' : 'rgb(200,200,200)'
})

const internalState = ref(props.state !== undefined ? props.state : props.turnout?.state)
const isRunning = ref(false)

// Computed property for state that can be updated
const state = computed({
  get: () => props.state !== undefined ? props.state : internalState.value,
  set: (value: boolean) => {
    internalState.value = value
    emit('update:state', value)
    handleTurnouts()
  }
})

// Watch for prop changes
watch(() => props.state, (newState) => {
  if (newState !== undefined) {
    internalState.value = newState
  }
})

async function handleTurnouts() {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await setTurnout(props.turnoutId || props.turnout.id, {...props.turnout, id: props.turnoutId || props.turnout.id, state: internalState.value })
}
</script>

<template>
  <svg @click="state = !state" width="100%" height="100%" viewBox="0 0 200 240" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <g id="Artboard1" transform="matrix(1.00056,0,0,0.995388,-200.803,-517.561)">
      <rect x="200.69" y="519.959" width="199.888" height="241.112" style="fill:none;"/>
      <g id="shield" transform="matrix(1.0988,0,0,0.995835,-28.0554,-10.2203)">
        <path d="M298.63,764.429C297.753,764.043 295.878,763.186 294.503,762.342C291.04,760.217 286.989,757.173 282.629,753.546C267.627,741.067 249.258,721.874 238.602,707.139C234.836,701.931 231.98,697.546 231.264,694.419C230.637,691.685 230.937,686.967 231.56,681.01C233.311,664.285 238.582,639.463 244.537,617.988C247.898,605.866 251.469,594.82 254.773,586.972C256.397,583.113 257.444,581.053 258.768,579.748C260.242,578.296 269.233,579.193 273.118,578.172C278.066,576.871 280.607,572.813 282.08,567.856C283.639,562.609 293.329,562.625 299.97,562.67C305.464,562.708 315.21,562.628 317.676,567.856C320.446,573.729 322.328,577.521 326.605,578.172C330.576,578.776 339.368,577.935 340.822,579.407C342.128,580.731 343.342,583.709 344.913,587.589C348.109,595.482 351.529,606.576 354.724,618.742C360.384,640.297 365.315,665.188 366.836,681.936C367.378,687.901 367.613,692.622 366.949,695.348C366.19,698.464 363.274,702.811 359.437,707.966C348.58,722.554 329.951,741.493 314.779,753.766C310.369,757.333 306.278,760.321 302.786,762.399C301.4,763.224 299.513,764.055 298.63,764.429Z" 
        :style="`stroke:black;stroke-width:8.12px; fill: ${turnout.color}`"/>
      </g>
      <g id="turnout-label-border" transform="matrix(1.44379,0,0,0.924877,-153.301,36.371)">
        <path d="M348.793,601.311C346.834,601.311 345.244,598.816 345.244,595.742L283.684,595.742C283.684,598.816 282.094,601.311 280.135,601.311L280.135,612.45C282.094,612.45 283.684,614.946 283.684,618.019L345.244,618.019C345.244,614.946 346.834,612.45 348.793,612.45L348.793,601.311Z" style="fill:rgb(235,235,235);stroke:black;stroke-width:1.65px;"/>
      </g>
      <g id="switch-label" transform="matrix(0.99944,0,0,1.00463,-17.1573,3.01387)">
        <text x="293.038px" y="624.217px" style="font-family:'BMDoHyeon-OTF', 'BM Dohyeon', sans-serif;font-size:12px;">SWITCH</text>
      </g>
      <g id="turnout-label" transform="matrix(0.99944,0,0,1.00463,-34.4061,-25.8633)">
        <text x="335px" y="624.217px" style="font-size:13px;" text-anchor="middle">{{ turnout.name }}</text>
      </g>
      <g
        id="handle-rot"
        :transform="props.state ? '' : 'rotate(-55 300.634 706.491)'"
        style="transition: transform 300ms cubic-bezier(0.4, 0, 0.6, 1);"
      >
        <g id="handle" transform="matrix(-1.11144,-0.520968,0.493442,-1.06369,149.413,1432.43)">
          <path d="M135.836,611.847C135.836,611.847 125.096,651.919 125.096,669.093C125.096,675.319 129.908,680.374 135.836,680.374C141.764,680.374 146.576,675.319 146.576,669.093C146.576,651.919 135.836,611.847 135.836,611.847Z" style="fill:rgb(128,128,128);stroke:black;stroke-width:2.5px;"/>
            
        </g>
      </g>
      <g id="knob2" transform="matrix(0.99944,0,0,1.00463,159.254,20.9286)">
        <circle cx="141.459" cy="686.743" r="11.884"/>
      </g>
      <g id="knob1" transform="matrix(0.99944,0,0,1.00463,-18.027,-4.19032)">
        <path d="M318.84,687.498C332.223,687.498 343.088,698.363 343.088,711.746C343.088,725.129 332.223,735.994 318.84,735.994C305.457,735.994 294.592,725.129 294.592,711.746C294.592,698.363 305.457,687.498 318.84,687.498ZM318.84,699.622C325.531,699.622 330.964,705.055 330.964,711.746C330.964,718.437 325.531,723.87 318.84,723.87C312.148,723.87 306.716,718.437 306.716,711.746C306.716,705.055 312.148,699.622 318.84,699.622Z" style="fill:rgb(128,128,128);stroke:black;stroke-width:6px;"/>
      </g>
      <g id="n-label" transform="matrix(0.939974,-0.341366,0.339601,0.944858,-198.297,142.945)">
        <text x="259.717px" y="612.003px" style="font-size:15px;">N</text>
      </g>
      <g id="r-label" transform="matrix(0.93837,0.345797,-0.344009,0.943246,303.806,-37.8071)">
        <text x="259.717px" y="612.003px" style="font-size:15px;">R</text>
      </g>
      <g id="n-indicator" transform="matrix(0.99944,0,0,1.00463,35.9905,-56.4729)">
        <circle cx="225.703" cy="595.685" r="15.911" :style="{ fill: indicatorNColor, stroke: 'black', strokeWidth: '3px' }"/>
      </g>
      <g id="r-indicator" transform="matrix(0.99944,0,0,1.00463,115.946,-56.4729)">
        <circle cx="225.703" cy="595.685" r="15.911" :style="{ fill: indicatorRColor, stroke: 'black', strokeWidth: '3px' }"/>
      </g>
    </g>
  </svg>
</template> 