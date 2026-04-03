import { createLogger } from '@repo/utils'

const log = createLogger('MockDCC')

interface MockConfig {
  /** Base delay in ms before responding (default: 200) */
  baseDelay?: number
  /** Random jitter range in ms (default: 100) */
  jitter?: number
}

const DEFAULT_CONFIG: Required<MockConfig> = {
  baseDelay: 200,
  jitter: 100,
}

function delay(config: Required<MockConfig>): Promise<void> {
  const ms = config.baseDelay + Math.random() * config.jitter
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Simulated telemetry state */
const telemetryState = {
  currentA: 0.45,
  currentB: 0.32,
  voltage: 14.8,
  trackPower: true,
}

export function createMockResponder(config?: MockConfig) {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  async function handleCommand(action: string, payload: unknown): Promise<void> {
    log.debug(`[MOCK] ${action}`, payload)
    await delay(cfg)

    switch (action) {
      case 'throttle': {
        const p = payload as { address: number; speed: number; direction: number }
        log.info(`[MOCK] Loco ${p.address} → speed ${p.speed}, dir ${p.direction}`)
        break
      }
      case 'turnout': {
        const p = payload as { id: number; state: boolean }
        log.info(`[MOCK] Turnout ${p.id} → ${p.state ? 'thrown' : 'closed'}`)
        break
      }
      case 'function': {
        const p = payload as { address: number; func: number; state: boolean }
        log.info(`[MOCK] Loco ${p.address} F${p.func} → ${p.state ? 'ON' : 'OFF'}`)
        break
      }
      case 'output': {
        const p = payload as { pin: number; state: boolean }
        log.info(`[MOCK] Output pin ${p.pin} → ${p.state ? 'ON' : 'OFF'}`)
        break
      }
      case 'dcc': {
        const p = payload as { power?: boolean }
        if (p.power !== undefined) {
          telemetryState.trackPower = p.power
          log.info(`[MOCK] Track power → ${p.power ? 'ON' : 'OFF'}`)
        }
        break
      }
      case 'signal': {
        const p = payload as { id: number; aspect: string }
        log.info(`[MOCK] Signal ${p.id} → ${p.aspect}`)
        break
      }
      default:
        log.debug(`[MOCK] Unhandled action: ${action}`)
    }
  }

  function getTelemetry() {
    return {
      currentA: telemetryState.currentA + (Math.random() - 0.5) * 0.1,
      currentB: telemetryState.currentB + (Math.random() - 0.5) * 0.05,
      voltage: telemetryState.voltage + (Math.random() - 0.5) * 0.2,
      trackPower: telemetryState.trackPower,
    }
  }

  function getLcdLines(): string[] {
    return [
      'DCC-EX DEMO v5.2.75',
      `Trk Pwr: ${telemetryState.trackPower ? 'ON' : 'OFF'}`,
      `A: ${telemetryState.currentA.toFixed(2)}A  B: ${telemetryState.currentB.toFixed(2)}A`,
      `${telemetryState.voltage.toFixed(1)}V`,
    ]
  }

  return {
    handleCommand,
    getTelemetry,
    getLcdLines,
  }
}
