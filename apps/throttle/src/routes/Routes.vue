<script setup lang="ts">
import { ref, watch }  from 'vue'
import { useEfx } from '@/effects/useEfx'
import TamarackJunction from './maps/tam/TamarackJunction.vue'

const p1 = ref(null)
const p2 = ref(null)

const { getEffects, runEffect, getEffect } = useEfx()
const list = getEffects()

const routes = list.data.value?.filter(item => item.type === 'route')

watch(p2, async (newValue) => {
  if (newValue !== null) {
    const route = routes.find(r => r.point1 === p1.value && r.point2 === newValue) ||
                  routes.find(r => r.point1 === newValue && r.point2 === p1.value)
    if (route) {
      const efx = await  getEffect(route.id)
      console.log('Route found:', efx?.state, route, efx)
      runEffect({...route, state: !efx?.state, id: route.id })
    } else {
      console.log('No route found between', p1.value, 'and', newValue, routes)
    }
  }
})

function findClickableParent(target) {
  const clickableContainers = ['Routes', 'Turnouts', 'TurnoutLabels']
  let found = false
  let currentTarget = target
  let targetType = ''
  while (!found && currentTarget && currentTarget.parentNode) {
    if (currentTarget.parentNode.nodeName.toLowerCase() === 'svg') {
      currentTarget = null
    } else if (clickableContainers.includes(currentTarget.parentNode.id)) {
      targetType = currentTarget.parentNode.id
      found = true
    } else {
      currentTarget = currentTarget.parentNode
    }
  }
  return found ? { target: currentTarget, type: targetType } : null
}

async function handleMapClick(e: MouseEvent) {
  e.preventDefault();
  const svgBtn = findClickableParent(e.target)
  console.log('handleMapClick', svgBtn, routes)
  if (svgBtn) {
    switch (svgBtn.type) {
      case 'Routes':
        if (p1.value === null) {
          p1.value = svgBtn.target.id
        } else if (p2.value === null) {
          p2.value = svgBtn.target.id
        } else {
          p1.value = svgBtn.target.id
          p2.value = null
        }
        // const rte = routes.find(r => r.point1 === svgBtn.target.id || r.point2 === svgBtn.target.id);
        // console.log('handleMapRouteClick', svgBtn.target.id, rte);
        // await onRouteToggle(rte);
        break;
      case 'Turnouts':
      case 'TurnoutLabels':
        // await onTurnoutToggle(svgBtn.target.id);
        break;
      default:
        // noop
        break;
    }
  }
}
</script>
<template>
  <div class="">
    <!-- <img :src="tamarackJunction" alt="Tamarack Junction Map" @click="handleMapClick" /> -->
    <TamarackJunction @click="handleMapClick" />
    <pre>p1: {{ p1 }}</pre>
    <pre>p2: {{ p2 }}</pre>    
    <pre v-for="r in routes">
      {{ r.id }}, {{ r.state }}, {{ r.timestamp }}, 
    </pre>
  </div>
</template>
