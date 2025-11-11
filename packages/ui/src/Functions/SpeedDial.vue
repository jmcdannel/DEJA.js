<script setup lang="ts">
  import { computed, ref, type PropType, watch } from 'vue'
  import FunctionButton from './FunctionButton.vue'
  import FunctionList from './FunctionList.vue'
  import type { Loco, LocoFunction } from '@repo/modules/locos'
  import { useEfx, type Effect } from '@repo/modules/effects'
  import { useLayout, defaultLayoutSounds } from '@repo/modules'
  import type { LayoutDefaultSound } from '@repo/modules'

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

  const { getEffect, runEffect } = useEfx()
  const { getLayout } = useLayout()

  const layout = getLayout()

  const layoutDefaultSounds = computed<LayoutDefaultSound[]>(() => {
    const sounds = layout?.value?.defaultSounds
    if (Array.isArray(sounds) && sounds.length > 0) {
      return sounds
    }
    return defaultLayoutSounds
  })

  type SoundButtonWithEffect = LayoutDefaultSound & { effect?: Effect }

  const soundEffects = ref<Record<string, Effect | undefined>>({})
  const isLoadingEffects = ref(false)

  async function loadSoundEffects() {
    if (isLoadingEffects.value) {
      return
    }
    isLoadingEffects.value = true
    try {
      const buttons = layoutDefaultSounds.value

      if (!buttons.length) {
        soundEffects.value = {}
      } else {
        const entries = await Promise.all(
          buttons.map(async (button) => {
            try {
              const effect = await getEffect(button.effectId)
              return [button.effectId, effect ?? undefined] as const
            } catch (error) {
              console.error('Failed to load sound effect', button.effectId, error)
              return [button.effectId, undefined] as const
            }
          })
        )

        soundEffects.value = entries.reduce<Record<string, Effect | undefined>>((acc, [id, effect]) => {
          acc[id] = effect
          return acc
        }, {})
      }
    } finally {
      isLoadingEffects.value = false
    }
  }

  watch(
    [() => props.loco?.id, layoutDefaultSounds],
    () => {
      loadSoundEffects()
    },
    { immediate: true, deep: true }
  )

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

  const soundEffectButtons = computed<SoundButtonWithEffect[]>(() =>
    layoutDefaultSounds.value.map((button) => ({
      ...button,
      effect: soundEffects.value[button.effectId],
    }))
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
        <template v-if="!hasSound">
          <li v-for="button in soundEffectButtons" :key="button.effectId">
            <v-btn
              class="relative bg-gradient-to-br from-red-600 to-indigo-600 p-2"
              :icon="button.icon"
              :disabled="!button.effect"
              @click="triggerSoundEffect(button.effect)" />
          </li>
        </template>
      </ul>
      <v-btn
        class="relative w-full mx-2 mt-2 bg-gradient-to-br from-green-600 to-teal-600 p-2"
        prepend-icon="mdi-more"
        @click="openAllFunctions()"
      >
        View All
      </v-btn>
      
    </section>
    <!-- <pre>{{ loco.functions?.filter(lf => lf.isFavorite) }}</pre> -->
    <FunctionList
      ref="listRef"
      :loco="loco"
    />
  </template>
</template>