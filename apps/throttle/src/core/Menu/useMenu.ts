import { computed } from 'vue'
import { useRouter, } from 'vue-router'
import { useStorage } from '@vueuse/core'
import type { MenuItem } from './types'

const _menuConfig: MenuItem[] = [
  {
    label: 'Layouts',
    icon: 'mdi-grid',
    color: 'indigo',
    name: 'home',
  },
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
    name: 'throttles',
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
    label: "Settings",
    icon: 'mdi-cog',
    color: 'grey',
    name: 'settings',
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
    const savedFavorites = useStorage<string[]>('@DEJA/throttle/footerMenuFavorites', defaultFavorites)

    const menuConfig = computed(() =>
        _menuConfig.map(item => ({ ...item, isFavorite: savedFavorites.value.includes(item.name) }))
    )

    const menuFavorites = computed(() =>
        _menuConfig.filter(item => savedFavorites.value.includes(item.name))
    )

    function handleMenu(item: MenuItem) {
        router.push({ name: item.name })
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
