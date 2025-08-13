import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'
import { useLayout } from '@repo/modules/layouts'

export interface TourEffect extends Effect {
  description?: string
  category?: string
  icon?: string
  hasTimeout?: boolean
  timeoutDuration?: number
  area?: string
}

export interface MediaItem {
  id: string
  title: string
  description: string
  type: 'video' | 'audio'
  category: 'introduction' | 'technical' | 'overview' | 'area-detail'
  area: string
  duration: string
  thumbnail?: string
  url: string
  featured: boolean
}

export const useTourStore = defineStore('tour', () => {
  // Ensure layout ID is set for the tour app
  const layoutId = useStorage('@DEJA/layoutId', import.meta.env.VITE_LAYOUT_ID || 'betatrack')

  // Firebase hooks
  const { getEffects, runEffect, getEfxType } = useEfx()
  const { getLayout } = useLayout()

  // State
  const currentArea = ref<string | null>(null)
  const hasWatchedIntro = ref(false)
  const visitedAreas = ref<string[]>([])
  const isDarkMode = ref(true) // Default to dark mode
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Firebase data
  const firebaseEffects = getEffects()
  const currentLayout = getLayout()

  console.log('Tour store initialized with layout ID:', layoutId.value)

  // Media state
  const media = ref<MediaItem[]>([
    {
      id: 'intro-welcome',
      title: 'Welcome to the Layout',
      description: 'A comprehensive introduction to our model train layout',
      type: 'video',
      category: 'introduction',
      area: 'Overview',
      duration: '3:45',
      url: '/media/intro-welcome.mp4',
      featured: true
    },
    {
      id: 'layout-overview',
      title: 'Complete Layout Overview',
      description: 'Aerial view and complete tour of the entire layout',
      type: 'video',
      category: 'overview',
      area: 'Overview',
      duration: '12:30',
      url: '/media/layout-overview.mp4',
      featured: true
    }
  ])

  // Transform Firebase effects to tour effects with UI enhancements
  const tourEffects = computed(() => {
    console.log('Computing tour effects, firebaseEffects.value:', firebaseEffects.value)
    if (!firebaseEffects.value) return []

    const effects = firebaseEffects.value.map((effect: any): TourEffect => {
      const efxType = getEfxType(effect.type)

      return {
        ...effect,
        description: `${efxType?.label || effect.type} effect${effect.device ? ` on ${effect.device}` : ''}${effect.pin ? ` (Pin ${effect.pin})` : ''}`,
        category: getCategoryFromType(effect.type),
        icon: efxType?.icon || 'mdi-lightning-bolt',
        hasTimeout: shouldHaveTimeout(effect.type),
        timeoutDuration: getTimeoutForType(effect.type),
        area: getAreaFromTags(effect.tags || [])
      }
    })

    console.log('Transformed tour effects:', effects)
    return effects
  })

  // Getters
  const guestEffects = computed(() => {
    const filtered = tourEffects.value.filter(effect => effect.allowGuest === true)
    console.log('Guest effects (allowGuest=true):', filtered)
    return filtered
  })

  const activeEffects = computed(() =>
    tourEffects.value.filter(effect => effect.state === true)
  )

  const featuredMedia = computed(() =>
    media.value.filter(item => item.featured)
  )

  const introMedia = computed(() =>
    media.value.filter(item => item.category === 'introduction')
  )

  // Helper functions
  const getCategoryFromType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'light': 'Lighting',
      'led': 'Lighting',
      'streetlight': 'Lighting',
      'ialed': 'Lighting',
      'sound': 'Sound',
      'relay': 'Animation',
      'power': 'Power',
      'signal': 'Lighting',
      'macro': 'Automation',
      'route': 'Automation'
    }
    return typeMap[type] || 'Other'
  }

  const shouldHaveTimeout = (type: string): boolean => {
    return ['sound', 'relay', 'macro'].includes(type)
  }

  const getTimeoutForType = (type: string): number => {
    const timeouts: Record<string, number> = {
      'sound': 5000,
      'relay': 10000,
      'macro': 15000
    }
    return timeouts[type] || 0
  }

  const getAreaFromTags = (tags: string[]): string => {
    // Look for area tags matching actual layout areas
    const areaTags = tags.filter(tag =>
      ['tamarack-station', 'roseberry-yard', 'payette-subdivision', 'deadmans-curve',
        'round-valley', 'thunder-city', 'eagle-nest', 'tripod-peak'].includes(tag.toLowerCase())
    )
    return areaTags[0] || 'General'
  }

  // Actions
  const activateEffect = async (effectId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const effect = tourEffects.value.find(e => e.id === effectId)
      if (effect && effect.allowGuest) {
        // Use Firebase runEffect to update the state
        await runEffect({
          ...effect,
          state: true
        })

        // Auto-deactivate after timeout if specified
        if (effect.hasTimeout && effect.timeoutDuration) {
          setTimeout(() => {
            deactivateEffect(effectId)
          }, effect.timeoutDuration)
        }

        console.log(`Activating effect: ${effect.name}`)
      }
    } catch (err) {
      error.value = `Failed to activate effect: ${err}`
      console.error('Error activating effect:', err)
    } finally {
      isLoading.value = false
    }
  }

  const deactivateEffect = async (effectId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const effect = tourEffects.value.find(e => e.id === effectId)
      if (effect) {
        // Use Firebase runEffect to update the state
        await runEffect({
          ...effect,
          state: false
        })
        console.log(`Deactivating effect: ${effect.name}`)
      }
    } catch (err) {
      error.value = `Failed to deactivate effect: ${err}`
      console.error('Error deactivating effect:', err)
    } finally {
      isLoading.value = false
    }
  }

  const markIntroWatched = () => {
    hasWatchedIntro.value = true
  }

  const visitArea = (areaId: string) => {
    if (!visitedAreas.value.includes(areaId)) {
      visitedAreas.value.push(areaId)
    }
    currentArea.value = areaId
  }

  const playMedia = (mediaId: string) => {
    const mediaItem = media.value.find(m => m.id === mediaId)
    if (mediaItem) {
      console.log(`Playing media: ${mediaItem.title}`)
      // Here you would integrate with your actual media player

      // Mark intro as watched if it's an intro video
      if (mediaItem.category === 'introduction') {
        markIntroWatched()
      }
    }
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    // Store preference in localStorage
    localStorage.setItem('tour-dark-mode', isDarkMode.value.toString())
  }

  const initializeTheme = () => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('tour-dark-mode')
    if (saved !== null) {
      isDarkMode.value = saved === 'true'
    }
  }

  return {
    // State
    currentArea,
    hasWatchedIntro,
    visitedAreas,
    isDarkMode,
    isLoading,
    error,
    media,

    // Firebase data
    firebaseEffects,
    currentLayout,

    // Computed
    tourEffects,
    guestEffects,
    activeEffects,
    featuredMedia,
    introMedia,

    // Actions
    activateEffect,
    deactivateEffect,
    markIntroWatched,
    visitArea,
    playMedia,
    toggleTheme,
    initializeTheme
  }
})