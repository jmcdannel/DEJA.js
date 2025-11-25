import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import type { MenuItem } from './types'

export const DEFAULT_MENU_CONFIG: MenuItem[] = [
  {
    label: 'Locos',
    icon: 'mdi-train',
    color: 'pink',
    name: 'roster',
    path: '/locos',
    componentPath: './views/RosterView.vue',
    requireDccEx: true
  },
  {
    label: 'Throttles',
    icon: 'mdi-gamepad-variant',
    color: 'green',
    name: 'throttle-list',
    path: '/throttles',
    componentPath: './views/ThrottleListView.vue',
    requireDccEx: true
  },
  {
    label: 'Effects',
    icon: 'mdi-rocket',
    color: 'purple',
    name: 'effects',
    path: '/effects',
    componentPath: './views/EffectsView.vue'
  },
  {
    label: "Conductor",
    icon: 'mdi-account-tie-hat',
    color: 'red',
    name: 'conductor',
    path: '/conductor',
    componentPath: './views/ConductorView.vue',
    requireDccEx: true
  },
  {
    label: "Throttle",
    icon: 'mdi-speedometer',
    color: 'lime',
    name: 'throttle',
    path: '/throttle/:address',
    componentPath: './views/ThrottleView.vue',
    requireDccEx: true
  },
  {
    label: "Routes",
    icon: 'mdi-map',
    color: 'teal',
    name: 'routes',
    path: '/routes',
    componentPath: './views/RoutesView.vue'
  },
  {
    label: "Turnouts",
    icon: 'mdi-call-split',
    color: 'blue',
    name: 'turnouts',
    path: '/turnouts',
    componentPath: './views/TurnoutsView.vue'
  },
  {
    label: "Signals",
    icon: 'mdi-traffic-light',
    color: 'blue',
    name: 'signals',
    path: '/signals',
    componentPath: './views/SignalsView.vue'
  }
]

const defaultFavorites = [
    'throttles',
    'conductor',
    'throttle',
    'effects',
    'routes',
    'turnouts',
    'signals'    
]

export function useMenu() {
  const router = useRouter()
  const route = useRoute()
  const savedFavorites = useStorage<string[]>('@DEJA/throttle/footerMenuFavorites', defaultFavorites)

  const lastThrottleAddress = useStorage<number>('@DEJA/lastThrottleAddress', parseInt(route.params.address?.toString()) || 3)

  const menuConfig = computed(() =>
    DEFAULT_MENU_CONFIG.map(item => ({ ...item, isFavorite: savedFavorites.value.includes(item.name) }))
  )

  const menuFavorites = computed(() =>
    DEFAULT_MENU_CONFIG.filter(item => savedFavorites.value.includes(item.name))
  )

  function handleMenu(item: MenuItem) {
    router.push({
      name: item.name,
      params: {
        address: lastThrottleAddress.value
      }
    })
  }

  function saveFavorite(name: string) {
    if (!savedFavorites.value.includes(name)) {
        savedFavorites.value = [...savedFavorites.value, name]
    } else {
        savedFavorites.value = savedFavorites.value.filter(fav => fav !== name)
    }
  }

  function removeFavorite(name: string) {
    savedFavorites.value = savedFavorites.value.filter(fav => fav !== name)
  }

  return {
    defaultFavorites,
    menuConfig,
    handleMenu,
    menuFavorites,
    saveFavorite,
    removeFavorite,
  }
}

export default useMenu
