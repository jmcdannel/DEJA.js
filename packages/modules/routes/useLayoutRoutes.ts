import { ref } from 'vue'
import { useTurnouts, type Turnout, type Effect, type MacroItem } from '@repo/modules'

const DELAY = 2000 // ms delay between turnouts being set in a route

// small helper to pause between calls
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

// Shared reactive state so multiple callers get the same refs
const percentComplete = ref(0)
const isRunning = ref(false)

export const useLayoutRoutes = () => {

    const { setTurnout } = useTurnouts()

    async function runRoute(route: Effect ) {
        console.log('runRoute', route)
        if (isRunning.value) {
            console.log('Route already running, ignoring')
            return
        }
        isRunning.value = true
        percentComplete.value = 0

        const onChips = ref<MacroItem[]>(route.on || [])

        for (let i = 0; i < onChips.value.length; i++) {
            const chip = onChips.value[i] as MacroItem;
            if (chip.type === 'turnout') {
                const newState = chip.state || true
                const turnout: Partial<Turnout> = {
                    state: newState,
                    timestamp: Date.now()
                }
                if (chip.id) {
                    setTurnout(chip.id?.toString(), { ...turnout })
                    percentComplete.value = ((i + 1) / onChips.value.length) * 100

                    // wait 1000ms before processing the next turnout
                    // eslint-disable-next-line no-await-in-loop
                    await sleep(DELAY)
                }
            }
        }
        percentComplete.value = 0
        isRunning.value = false
        console.log('Route complete')
    }

    return {
        isRunning,
        percentComplete,
        runRoute,
    }
}

export default useLayoutRoutes
