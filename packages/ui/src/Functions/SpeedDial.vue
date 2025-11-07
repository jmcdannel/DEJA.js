<script setup lang="ts">
  import { computed, ref, type PropType } from 'vue'
  import FunctionButton from './FunctionButton.vue'
  import FunctionList from './FunctionList.vue'
  import type { Loco, LocoFunction } from '@repo/modules/locos'
  import { useEfx, type Effect } from '@repo/modules/effects'

  const SOUND_BUTTONS = [
    { tag: 'horn', label: 'Horn', icon: 'mdi-bullhorn' },
    { tag: 'bell', label: 'Bell', icon: 'mdi-bell' },
    { tag: 'coupler', label: 'Coupler', icon: 'mdi-link-variant' },
    { tag: 'wheel-squeal', label: 'Wheel Squeal', icon: 'mdi-sine-wave' },
  ] as const

  const props = defineProps({
    loco: {
      type: Object as PropType<Loco>,
      required: true
    }
  })

  const listRef = ref<InstanceType<typeof FunctionList> | null>(null)

  defineExpose({
    openAll: () => listRef.value?.showModal(),
  })

  const { getEffects, runEffect } = useEfx()
  const effects = getEffects()

  const hasSound = computed(() => props.loco?.hasSound !== false)
  const baseFunctions = computed(() => props.loco?.functions ?? [])
  const lightFunction = computed(() => baseFunctions.value.find((func) => func.id === 0))

  const favoriteFunctions = computed<LocoFunction[]>(() => {
    const favorites = baseFunctions.value.filter((func) => func?.isFavorite)
    const result: LocoFunction[] = []
    if (lightFunction.value) {
      result.push(lightFunction.value)
    }
    favorites.forEach((func) => {
      if (!result.some((existing) => existing.id === func.id)) {
        result.push(func)
      }
    })
    return result
  })

  const displayFunctions = computed(() => {
    if (!hasSound.value) {
      return favoriteFunctions.value.filter((func) => func.id === 0)
    }
    return favoriteFunctions.value
  })

  const soundEffectButtons = computed(() => {
    const availableEffects = (effects.value || []) as Effect[]
    return SOUND_BUTTONS.map((button) => {
      const tag = button.tag.toLowerCase()
      const candidates = [tag, tag.replace(/-/g, ' '), tag.replace(/-/g, '')]
      const matchingEffect = availableEffects.find((effect) => {
        const tags = (effect.tags || []).map((t) => t.toLowerCase())
        if (candidates.some((candidate) => tags.includes(candidate))) {
          return true
        }
        const name = effect.name?.toLowerCase() || ''
        return candidates.some((candidate) => candidate && name.includes(candidate))
      })
      return {
        ...button,
        effect: matchingEffect,
      }
    })
  })

  const hasAnySoundEffect = computed(() =>
    soundEffectButtons.value.some((button) => Boolean(button.effect))
  )

  function openAllFunctions() {
    listRef.value?.showModal()
  }

  async function triggerSoundEffect(effect?: Effect) {
    if (!effect) {
      return
    }
    await runEffect({ ...effect, state: true })
  }

</script>
<template>
  <template v-if="loco">
    <section class="flex flex-col flex-grow justify-center">
      <ul v-if="displayFunctions.length" class="grid grid-cols-3 justify-center mx-2 items-center gap-1">
        <li v-for="locoFunc in displayFunctions" :key="locoFunc.id">
          <FunctionButton :func="locoFunc" :address="loco.address" class="w-full" />
        </li>
      </ul>
      <v-btn
        class="relative w-full mx-2 mt-2 bg-gradient-to-br from-green-600 to-teal-600 p-2"
        prepend-icon="mdi-more"
        @click="openAllFunctions()"
      >
        View All
      </v-btn>
      <div v-if="!hasSound" class="mt-3 flex flex-col gap-2 px-2">
        <div class="grid grid-cols-2 gap-2 w-full">
          <v-btn
            v-for="button in soundEffectButtons"
            :key="button.tag"
            class="relative w-full bg-gradient-to-br from-amber-600 to-orange-600 p-2"
            :prepend-icon="button.icon"
            :disabled="!button.effect"
            @click="triggerSoundEffect(button.effect)"
          >
            {{ button.label }}
          </v-btn>
        </div>
        <p v-if="!hasAnySoundEffect" class="text-xs text-slate-400 text-center">
          Assign horn, bell, coupler, and wheel squeal sound effects in the Effects panel to enable these triggers.
        </p>
      </div>
    </section>
    <!-- <pre>{{ loco.functions?.filter(lf => lf.isFavorite) }}</pre> -->
    <FunctionList
      ref="listRef"
      :loco="loco"
    />
  </template>
</template>