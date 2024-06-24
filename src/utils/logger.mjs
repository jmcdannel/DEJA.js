import signale from 'signale'

const opts = {
  logLevel: 'info',
  scope: 'DEJA.JS',
}

export const log = new signale.Signale(opts)

export default log
