import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import log from './utils/logger.mjs'

let port

function handleOpen(err) {
  if (err) {
    log.error('[SERIAL] Error opening port:', err.message)
    return
  }
  log.info('[SERIAL] Port Status', port.isOpen, port.settings)
  return true
}

const connect = ({ path, baudRate, handleMessage }) => {
  try {
    if (port) {
      return Promise.resolve(port)
    } else {
      return new Promise(function (resolve, reject) {
        if (!path) reject({ message: '[SERIAL] No serial port specified' })
        log.await('[SERIAL] Attempting to connect to:', path, typeof handleMessage)
        // Create a port
        port = new SerialPort({ path, baudRate, autoOpen: false })
        port.setEncoding('utf8')
        port.on('open', () => {
          log.complete('[SERIAL] Port opened:', path)
          resolve(port)
        })
        const parser = port.pipe(new ReadlineParser())
        parser.on('data', handleMessage)
        port.open(handleOpen)
      })
    }
  } catch (err) {
    log.fatal('[SERIAL] Error opening port: ', err)
  }
}

function handleSend(err) {
  if (err) {
    log.error('[SERIAL] Error on write:', err?.message)
  } else {
    log.complete('[SERIAL] Data written to port')
  }
}

const send = (data) => {
  try {
    log.await('[SERIAL] writing to port', JSON.stringify(data))
    port && port.write(data, handleSend)
  } catch (err) {
    log.fatal('[SERIAL] Error writing to port:', err)
  }
}

export default {
  connect,
  send,
}
