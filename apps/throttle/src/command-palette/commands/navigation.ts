import { computed, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Command } from '../types'

export function useNavigationCommands(): ComputedRef<Command[]> {
  const router = useRouter()

  return computed<Command[]>(() => [
    {
      id: 'nav.roster',
      title: 'Go to Roster',
      icon: 'mdi-train',
      category: 'navigation',
      shortcut: ['g', 'r'],
      keywords: ['locos', 'trains'],
      run: () => { router.push({ name: 'roster' }) },
    },
    {
      id: 'nav.throttles',
      title: 'Go to Throttles',
      icon: 'mdi-gamepad-variant',
      category: 'navigation',
      shortcut: ['g', 't'],
      keywords: ['throttle', 'drive'],
      run: () => { router.push({ name: 'throttles' }) },
    },
    {
      id: 'nav.conductor',
      title: 'Go to Conductor',
      icon: 'mdi-train-car',
      category: 'navigation',
      shortcut: ['g', 'c'],
      keywords: ['layout', 'dashboard'],
      run: () => { router.push({ name: 'conductor' }) },
    },
    {
      id: 'nav.turnouts',
      title: 'Go to Turnouts',
      icon: 'mdi-call-split',
      category: 'navigation',
      shortcut: ['g', 'u'],
      keywords: ['switches', 'points'],
      run: () => { router.push({ name: 'turnouts' }) },
    },
    {
      id: 'nav.signals',
      title: 'Go to Signals',
      icon: 'mdi-traffic-light',
      category: 'navigation',
      shortcut: ['g', 's'],
      keywords: ['aspect'],
      run: () => { router.push({ name: 'signals' }) },
    },
    {
      id: 'nav.effects',
      title: 'Go to Effects',
      icon: 'mdi-rocket-launch',
      category: 'navigation',
      shortcut: ['g', 'e'],
      keywords: ['sound', 'lights'],
      run: () => { router.push({ name: 'effects' }) },
    },
    {
      id: 'nav.settings',
      title: 'Go to Settings',
      icon: 'mdi-cog',
      category: 'navigation',
      shortcut: ['g', ','],
      keywords: ['preferences'],
      run: () => { router.push({ name: 'settings' }) },
    },
  ])
}
