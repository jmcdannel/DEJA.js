import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { log } from '../utils/logger.js'

function handleOpen(err: Error | null): boolean | void {
  if (err) {
    log.error('[SERIAL] Error opening port:', err.message)
    return
  }
  return true
}

interface ConnectOptions {
  baudRate: number
  handleMessage: (data: string) => void
  path: string
}

const connect = ({
  path,
  baudRate,
  handleMessage,
}: ConnectOptions): Promise<SerialPort | void> => {
  try {
    if (!path) {
      return Promise.reject(path)
    }
    return new Promise((resolve, reject) => {
      if (!path) {
        reject(new Error(`[SERIAL] No serial port specified: ${path}`))
        return
      }
      log.await('[SERIAL] Attempting to connect to:', path)
      // Create a port
      const port = new SerialPort({ autoOpen: false, baudRate, path })
      port.setEncoding('utf8')
      port.on('open', () => {
        log.complete('[SERIAL] Port opened:', path)
        resolve(port)
      })
      const parser = port.pipe(new ReadlineParser())
      parser.on('data', handleMessage)
      port.open(handleOpen)
    })
  } catch (err) {
    log.fatal('[SERIAL] Error opening port: ', err)
    return Promise.reject(err)
  }
}

function handleSend(err: Error | null | undefined): void {
  if (err) {
    log.error('[SERIAL] Error on write:', err?.message)
  } else {
    // log.complete('[SERIAL] Data written to port')
  }
}

const send = (_port: SerialPort, data: string): void => {
  try {
    log.await('[SERIAL] writing to port', data)
    if (_port) {
      _port.write(data, handleSend)
    }
  } catch (err) {
    log.fatal('[SERIAL] Error writing to port:', err)
  }
}

export const serial = {
  connect,
  send,
}

export default serial
