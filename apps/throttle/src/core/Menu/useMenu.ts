import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import type { MenuItem } from '@repo/ui/src/Menu/types'

export const DEFAULT_MENU_CONFIG: MenuItem[] = [
  {
    label: 'Locos',
    icon: 'mdi-train',
    color: 'pink',
    name: 'roster',
  },
  {
    label: 'Throttles',
    icon: 'mdi-gamepad-variant',
    color: 'green',
    name: 'throttle-list',
  },
  {
    label: 'Effects',
    icon: 'mdi-rocket',
    color: 'purple',
    name: 'effects',
  },
  {
    label: "Conductor",
    icon: 'mdi-account-tie-hat',
    color: 'red',
    name: 'conductor',
  },
  {
    label: "Throttle",
    icon: 'mdi-speedometer',
    color: 'lime',
    name: 'throttle',
  },
  {
    label: "Routes",
    icon: 'mdi-map',
    color: 'teal',
    name: 'routes',
  },
  {
    label: "Turnouts",
    icon: 'mdi-call-split',
    color: 'blue',
    name: 'turnouts',
  },
  {
    label: "Signals",
    icon: 'mdi-traffic-light',
    color: 'blue',
    name: 'signals',
  },
  {
    label: 'Settings',
    icon: 'mdi-cog',
    color: 'gray',
    name: 'settings'
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
