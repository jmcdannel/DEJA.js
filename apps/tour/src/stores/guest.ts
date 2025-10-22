import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'

// Pre-generated train-related usernames for guests
const GUEST_USERNAMES = [
  'Conductor Casey',
  'Engineer Emma',
  'Brake Man Ben',
  'Switchman Sam',
  'Signalman Sarah',
  'Track Inspector Tom',
  'Yard Master Mike',
  'Dispatcher Diana',
  'Fireman Frank',
  'Hostler Henry',
  'Car Inspector Carol',
  'Trainmaster Tim',
  'Roundhouse Ralph',
  'Tower Operator Tina',
  'Crossing Guard Greg',
  'Station Agent Alice',
  'Baggage Handler Bob',
  'Telegrapher Terry',
  'Tank Car Ted',
  'Boxcar Betty',
  'Gondola Gary',
  'Flatcar Fred',
  'Caboose Charlie',
  'Tender Tom',
  'Tank Engine Tony',
  'Steam Locomotive Steve',
  'Diesel Dave',
  'Electric Ellie',
  'Freight Train Fred',
  'Passenger Pete',
  'Express Eddie',
  'Local Larry',
  'Through Train Theo',
  'Way Freight Will',
  'Milk Run Molly',
  'Overnight Express Oscar',
  'Commuter Carl',
  'Subway Sally',
  'Streetcar Stan',
  'Trolley Tracy',
  'Interurban Irene',
  'Monorail Mark',
  'Cable Car Cathy',
  'Funicular Fiona',
  'Cog Railway Chris',
  'Narrow Gauge Nancy',
  'Standard Gauge Stan',
  'Broad Gauge Bill',
  'Meter Gauge Mary',
  'Decauville Dave',
  'Tramway Tim',
  'Light Rail Lucy',
  'Heavy Rail Harry',
  'High Speed Henry',
  'Bullet Train Betty',
  'Shinkansen Sam',
  'TGV Thomas',
  'Eurostar Emma',
  'Acela Alex',
  'Amtrak Annie',
  'Metro Mike',
  'Subway Sam',
  'El Train Ellie',
  'Elevated Ed',
  'Underground Ursula',
  'Tunnel Tom',
  'Bridge Builder Bob',
  'Trestle Tracy',
  'Viaduct Victor',
  'Causeway Carl',
  'Grade Crossing Grace',
  'Level Crossing Larry',
  'Flying Junction Fred',
  'Wye Junction Wendy',
  'Turntable Tony',
  'Transfer Table Tina',
  'Coaling Tower Tom',
  'Water Tower Wendy',
  'Sand House Sam',
  'Roundhouse Ralph',
  'Backshop Betty',
  'Car Shop Carl',
  'Paint Shop Pete',
  'Machine Shop Mike',
  'Blacksmith Bob',
  'Boilermaker Bill',
  'Sheet Metal Sam',
  'Welder Wendy',
  'Electrician Ed',
  'Plumber Pete',
  'Carpenter Carl',
  'Mason Mary',
  'Painter Paul',
  'Roofer Ralph',
  'Insulator Irene',
  'Pipefitter Pete',
  'Millwright Mike',
  'Rigger Ralph',
  'Crane Operator Carl',
  'Forklift Frank',
  'Truck Driver Tom',
  'Loader Larry',
  'Unloader Ursula',
  'Weighmaster Will',
  'Scale Operator Sam',
  'Tank Filler Tom',
  'Grain Loader Gary',
  'Coal Loader Carl',
  'Ore Loader Oscar',
  'Lumber Loader Larry',
  'Steel Loader Sam',
  'Container Carl',
  'Flatbed Fred',
  'Boxcar Betty',
  'Gondola Gary',
  'Hopper Harry',
  'Tank Car Tom',
  'Refrigerator Ralph',
  'Livestock Larry',
  'Autorack Annie'
]

export interface GuestUser {
  id: string
  username: string
  isGuest: true
  createdAt: Date
  lastActive: Date
  preferences: {
    theme: 'light' | 'dark'
    soundEnabled: boolean
    notificationsEnabled: boolean
  }
}

export const useGuestStore = defineStore('guest', () => {
  // Guest user state
  // useStorage serializes to JSON by default which will turn Dates into strings.
  // Provide a custom serializer to revive Date objects when reading and
  // serialize Dates as ISO strings when writing so the in-memory type stays consistent.
  const guestStorageSerializer: { read: (v: string | null) => GuestUser | null; write: (v: GuestUser | null) => string } = {
    read: (raw: string | null) => {
      if (!raw) return null
      try {
        let parsed: unknown = JSON.parse(raw)

        // Handle legacy case where the stored value was a JSON string of the object
        // e.g. stored value is '"{...}"' -> JSON.parse(raw) returns a string.
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed)
          } catch (e) {
            // If double-parse fails, fall back to null
            console.warn('Failed to double-parse legacy guest value', e)
            return null
          }
        }

        const guest = parsed as GuestUser
        if (guest) {
          // revive date strings into Date objects
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(guest as any).createdAt = guest.createdAt ? new Date(guest.createdAt as unknown as string) : undefined
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(guest as any).lastActive = guest.lastActive ? new Date(guest.lastActive as unknown as string) : undefined
        }
        return guest
      } catch (e) {
        console.error('Failed to parse guest from storage', e)
        return null
      }
    },
    write: (val: GuestUser | null) => {
      // convert Date objects to ISO strings for storage
      if (!val) return ''
      const copy = {
        ...val,
        createdAt: val.createdAt ? val.createdAt.toISOString() : null,
        lastActive: val.lastActive ? val.lastActive.toISOString() : null
      }
      return JSON.stringify(copy)
    }
  }

  // Explicitly tell useStorage the stored type is GuestUser | null
  const currentGuest = useStorage<GuestUser | null>('@DEJA/guest-user', null, localStorage, { serializer: guestStorageSerializer as any })
  console.log('Guest store initialized, current guest:', currentGuest.value)
  const availableUsernames = ref<string[]>([...GUEST_USERNAMES])
  const usedUsernames = ref<Set<string>>(new Set())

  // Initialize used usernames from storage
  const initializeUsedUsernames = () => {
    const stored = localStorage.getItem('@DEJA/used-usernames')
    if (stored) {
      usedUsernames.value = new Set(JSON.parse(stored))
    }
  }

  // Save used usernames to storage
  const saveUsedUsernames = () => {
    localStorage.setItem('@DEJA/used-usernames', JSON.stringify([...usedUsernames.value]))
  }

  // Get available usernames (excluding used ones)
  const getAvailableUsernames = computed(() => {
    return availableUsernames.value.filter(name => !usedUsernames.value.has(name))
  })

  // Get random available username
  const getRandomUsername = (): string => {
    const available = getAvailableUsernames.value
    if (available.length === 0) {
      // If all usernames are used, reset the used list
      usedUsernames.value.clear()
      saveUsedUsernames()
      return availableUsernames.value[Math.floor(Math.random() * availableUsernames.value.length)]
    }
    
    const randomIndex = Math.floor(Math.random() * available.length)
    return available[randomIndex]
  }

  // Create guest user
  const createGuestUser = (username?: string): GuestUser => {
    const selectedUsername = username || getRandomUsername()
    
    // Mark username as used
    usedUsernames.value.add(selectedUsername)
    saveUsedUsernames()

    const guestUser: GuestUser = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: selectedUsername,
      isGuest: true,
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'dark',
        soundEnabled: true,
        notificationsEnabled: true
      }
    }

    // Store the guest user object directly. useStorage will handle serialization.
    currentGuest.value = guestUser
    return guestUser
  }

  // Update guest user preferences
  const updateGuestPreferences = (updates: Partial<GuestUser['preferences']>) => {
    if (currentGuest.value) {
      currentGuest.value.preferences = { ...currentGuest.value.preferences, ...updates }
      currentGuest.value.lastActive = new Date()
    }
  }

  // Update last active time
  const updateLastActive = () => {
    if (currentGuest.value) {
      currentGuest.value.lastActive = new Date()
    }
  }

  // Clear guest user
  const clearGuestUser = () => {
    currentGuest.value = null
  }

  // Check if user is guest
  const isGuestUser = computed(() => {
    // currentGuest is stored as an object via useStorage, so we can read properties directly.
    console.log('Checking if current user is guest:', currentGuest.value, currentGuest.value?.isGuest, typeof currentGuest.value)
    return currentGuest.value?.isGuest === true
  })

  // Get current user (either guest or null)
  const getCurrentUser = computed(() => {
    return currentGuest.value
  })

  // Initialize store
  const initialize = () => {
    initializeUsedUsernames()
    
    // Update last active time every minute
    setInterval(updateLastActive, 60000)
  }

  return {
    // State
    currentGuest,
    availableUsernames,
    usedUsernames,
    
    // Computed
    getAvailableUsernames,
    isGuestUser,
    getCurrentUser,
    
    // Actions
    createGuestUser,
    updateGuestPreferences,
    updateLastActive,
    clearGuestUser,
    getRandomUsername,
    initialize
  }
})
