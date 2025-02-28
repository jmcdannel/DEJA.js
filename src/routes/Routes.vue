<script setup lang="ts">
// import TamarackJunction from './maps/tam/TamarackJunction.vue'

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
  console.log('handleMapClick', svgBtn)
  if (svgBtn) {
    switch (svgBtn.type) {
      case 'Routes':
        // const rte = routes.find(r => r.svgId === svgBtn.target.id);
        // console.log('handleMapRouteClick', svgBtn.target.id, routeOrigin, routeDestination);
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
  <div class="map-container">
    <!-- <img :src="tamarackJunction" alt="Tamarack Junction Map" @click="handleMapClick" /> -->
    <!-- <TamarackJunction @click="handleMapClick" /> -->
  </div>
</template>
<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

img {
  max-width: 100%;
  height: auto;
}
</style>