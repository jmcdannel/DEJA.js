import { ref, toRefs } from "vue"
import { useConnectionStore } from "../connections/connectionStore.jsx"
import { storeToRefs } from "pinia"
import { useMQTT } from "mqtt-vue-hook"
import { useSerial } from "@/api/serialApi.js"

export function useDcc() {
  const mqttHook = useMQTT()
  const serialApi = useSerial()
  const connStore = useConnectionStore()
  const { layoutId } = storeToRefs(connStore)

  let ports: never[] = []

  async function parseMessage(topic: string, message: string) {
    try {
      const { action, payload } = JSON.parse(message)
      console.log("[DCC API] parseMessage", topic, message, action, payload)
      switch (action) {
        case "portList":
          ports = payload || []
          connStore.ports = ports
          break
        case "status":
          connStore.dejaConnected = !!payload?.isConnected
          break
        case "connected":
          connStore.dejaConnected = true
          break
      }
    } catch {
      console.warn("Message not in JSON format.")
    }
  }

  async function setPower(payload: object) {
    try {
      console.log("[DCC API].setPower", payload)
      await send("power", payload)
    } catch (err: any) {
      console.error("[DCC API].setPower", err)
      throw new Error(err)
    }
  }

  async function setSpeed(address: any, speed: any) {
    try {
      await send("throttle", { address, speed })
    } catch (err: any) {
      console.error("[DCC API].setPower", err)
      throw new Error(err)
    }
  }

  async function setTurnout(turnoutId: any, state: any) {
    try {
      send("turnout", { turnoutId, state })
    } catch (err: any) {
      console.error("[DCC API].setTurnout", err)
      throw new Error(err)
    }
  }

  async function setFunction(address: any, func: any, state: any) {
    try {
      await send("function", { address, func, state })
    } catch (err: any) {
      console.error("[DCC API].setPower", err)
      throw new Error(err)
    }
  }

  async function sendOutput(pin: any, state: any) {
    try {
      console.log("[DCC API].sendOutput", pin, state)
      await send("output", { pin, state })
    } catch (err: any) {
      console.error("[DCC API].setPower", err)
      throw new Error(err)
    }
  }

  async function send(action: string, payload?: object) {
    try {
      if (connStore.isEmulated) {
        console.log("[DEJA EMULATOR] send", action, payload)
        return
      } else if (connStore.serialConnected) {
        console.log("[SERIAL] send", action, payload)
        serialApi.send(action, payload)
        return
      } else if (connStore.dejaConnected) {
        console.log(
          "[dccApi] send",
          `@ttt/dcc/${layoutId.value}`,
          action,
          payload
        )
        mqttHook.publish(
          `@ttt/dcc/${layoutId.value}`,
          JSON.stringify({ action, payload })
        )
      } else if (connStore.mqttConnected) {
        console.log(
          "[mqtt] send",
          `@ttt/dcc/${layoutId.value}`,
          action,
          payload
        )
        mqttHook.publish(
          `@ttt/dcc/${layoutId.value}`,
          JSON.stringify({ action, payload })
        )
      } else {
        console.error("[DISCONNECTED] !send", action, payload, connStore)
      }
    } catch (err) {
      console.error("[DCC API].send", err)
    }
  }

  return {
    send,
    setPower,
    setSpeed,
    setFunction,
    sendOutput,
    setTurnout,
    parseMessage,
    ports: ports,
  }
}

export default useDcc
