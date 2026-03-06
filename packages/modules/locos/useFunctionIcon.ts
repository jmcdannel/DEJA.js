const icons = [
  { name: 'light', icon: 'mdi-lightbulb' },
  { name: 'bell', icon: 'mdi-bell' },
  { name: 'horn', icon: 'mdi-bullhorn' },
  { name: 'wifi', icon: 'mdi-wifi' },
  { name: 'coupler', icon: 'mdi-power-plug' },
  { name: 'fan', icon: 'mdi-fan' },
  { name: 'brake', icon: 'mdi-stop' },
  { name: 'station', icon: 'mdi-bus-stop' },
  { name: 'mute', icon: 'mdi-volume-off' },
  { name: 'quiet', icon: 'mdi-volume-low' },
  { name: 'sound', icon: 'mdi-volume-high' },
  { name: 'track', icon: 'mdi-train-track' },
  { name: 'air', icon: 'mdi-weather-windy' },
  { name: 'announce', icon: 'mdi-microphone' },
  { name: 'dim', icon: 'mdi-brightness-4' },
]
export function useFunctionIcon() {
  console.log('useFunctionIcon')

  const DEFAULT_ICON = 'mdi-train'

  function getIconComponent(name: string) {
    if (!name) {
      return DEFAULT_ICON
    }
    const icon = icons.find((icon) => icon.name === name)
    return icon ? icon.icon : DEFAULT_ICON
  }

  function getAllIcons() {
    return icons
  }

  return {
    getIconComponent,
    getAllIcons,
    DEFAULT_ICON,
  }
}
export default useFunctionIcon
