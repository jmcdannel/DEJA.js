// 🛠️ Shared CLI deploy command generator.
//
// Single source of truth for the build/upload commands users can run manually
// to flash a device. Used by:
//   - io/scripts/lib/bundle.ts → DEPLOYMENT.md template inside each bundle
//   - apps/cloud → DeviceDetails.vue "Build & flash from source" panel
//
// Returning null here means the device type doesn't have a CLI build path
// (Pico W copies code.py to CIRCUITPY, dcc-ex flashes via its upstream
// CommandStation-EX tooling — neither uses platformio/arduino-cli).

export interface CliDeployCommands {
  /** Sketch folder name (matches the .ino filename without extension). */
  sketchName: string
  /** PlatformIO env name from platformio.ini. */
  pioEnv: string
  /** arduino-cli FQBN for compile. */
  fqbn: string
  /** arduino-cli FQBN for upload — may include UploadSpeed override. */
  uploadFqbn: string
  /** 1️⃣ Build the bundle. Run from the monorepo root. */
  build: string
  /** 2️⃣ cd into the bundle directory. */
  cd: string
  /** 3a️⃣ PlatformIO build + upload (single command). */
  platformio: string
  /** 3b️⃣ arduino-cli compile + upload (chained with &&). */
  arduinoCli: string
}

interface CliCommandsInput {
  deviceType: string
  deviceId: string
  layoutId: string
}

// 🎯 Per-device-type build settings. Keep in sync with io/scripts/lib/bundle.ts
// `BOARD_CONFIGS` — that file is the canonical source for the build pipeline,
// and these values must match it 1:1 so the commands the user sees here are
// the same commands `pnpm run deploy` would actually run under the hood.
const BUILD_PROFILES: Record<
  string,
  { sketchName: string; pioEnv: string; fqbn: string; uploadSpeed?: number; cppFlags?: string }
> = {
  'deja-arduino': {
    sketchName: 'deja-arduino',
    pioEnv: 'megaatmega2560',
    fqbn: 'arduino:avr:mega:cpu=atmega2560',
  },
  'deja-esp32': {
    sketchName: 'deja-arduino', // 🤝 deja-esp32 reuses the deja-arduino sketch over USB serial
    pioEnv: 'esp32dev',
    fqbn: 'esp32:esp32:esp32',
    uploadSpeed: 460800,
    cppFlags: ' --build-property "compiler.cpp.extra_flags=-std=c++17"',
  },
  'deja-esp32-wifi': {
    sketchName: 'deja-esp32-wifi',
    pioEnv: 'esp32dev',
    fqbn: 'esp32:esp32:esp32',
    uploadSpeed: 460800,
    cppFlags: ' --build-property "compiler.cpp.extra_flags=-std=c++17"',
  },
}

/**
 * 🛠️ Build the manual CLI deploy commands for a given device.
 * Returns null for non-Arduino-family device types (Pico W, dcc-ex, deja-server).
 */
export function getCliDeployCommands(
  input: CliCommandsInput,
): CliDeployCommands | null {
  const profile = BUILD_PROFILES[input.deviceType]
  if (!profile) return null

  const { sketchName, pioEnv, fqbn, uploadSpeed, cppFlags = '' } = profile
  const uploadFqbn = uploadSpeed ? `${fqbn}:UploadSpeed=${uploadSpeed}` : fqbn

  return {
    sketchName,
    pioEnv,
    fqbn,
    uploadFqbn,
    build: `pnpm --filter=@deja/io build -- --layout ${input.layoutId} --device ${input.deviceId}`,
    cd: `cd io/dist/${input.layoutId}/arduino/${input.deviceId}`,
    platformio: `platformio run -e ${pioEnv} --target upload --upload-port /dev/cu.usbserial-*`,
    arduinoCli: `arduino-cli compile --fqbn ${fqbn}${cppFlags} ${sketchName} && arduino-cli upload -p /dev/cu.usbserial-* --fqbn ${uploadFqbn} ${sketchName}`,
  }
}
