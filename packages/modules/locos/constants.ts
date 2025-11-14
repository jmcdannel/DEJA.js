import type { LocoFunction, RoadName } from './types'

export const ROADNAMES: RoadName[] = [
  {
    value: 'bnsf',
    label: 'BNSF',
    color: 'orange',
  },
  {
    value: 'amtrak',
    label: 'Amtrak',
    color: 'sky',
  },
  {
    value: 'up',
    label: 'Union Pacific',
    color: 'yellow',
  },
  {
    value: 'cn',
    label: 'Canadian National',
    color: 'red',
  },
  {
    value: 'csx',
    label: 'CSX',
    color: 'indigo',
  },
  {
    value: 'ns',
    label: 'Norfolk Southern',
    color: 'zinc',
  },
  {
    value: 'mrl',
    label: 'Montana Rail Link',
    color: 'blue',
  },
  {
    value: 'gn',
    label: 'Great Northern',
    color: 'orange',
  },
  {
    value: 'bn',
    label: 'Burlington Northern',
    color: 'green',
  },
  {
    value: 'santefe',
    label: 'Santa Fe',
    color: 'red',
  },
]

export const defaultFunctions: LocoFunction[] = Array.from({ length: 32 }, (_, id) => ({
  id,
  label: `F${id}`,
  icon: null,
  isFavorite: false,
  isMomentary: false,
}))

export const FUNCTION_ICONS = [
  { name: 'light', icon: 'mdi-car-light-high' },
  { name: 'bell', icon: 'mdi-bell' },
  { name: 'horn', icon: 'mdi-bullhorn' },
  { name: 'wifi', icon: 'mdi-wifi' },
  { name: 'coupler', icon: 'mdi-connection' },
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
