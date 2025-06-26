
import type { LogEntry, DccMessage } from './types'

export const defuaultEntry: LogEntry = {
  id: Date.now(),
  action: '',
  payload: {},
}
export const dccMessages: DccMessage[] = [
  {
    key: '*',
    action: 'Status',
    color: 'green',
    icon: 'mdi-information',
  },
  {
    key: 'l',
    action: 'Locomotive',
    color: 'yellow',
    icon: 'mdi-train',
  },
  {
    key: 'p',
    action: 'Power',
    color: 'red',
    icon: 'mdi-power',
  },
  {
    key: 'H',
    action: 'Turnout',
    color: 'blue',
    icon: 'mdi-directions-fork',
  },
  {
    key: 'Y',
    action: 'Accessory',
    color: 'purple',
    icon: 'mdi-lightbulb',
  },
]