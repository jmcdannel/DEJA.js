import { ref } from "vue"

declare global {
  interface Window {
    serialOutputStream: WritableStream<string>
  }
}

type SendFunctionPayload = {
  address: number
  func: number
  state: boolean
}

export function useSerial(handleMessage: (message: string) => void) {
  const isConnected = ref(false)
  /*        
      Open a serial port and create a stream to read and write data
      While there is data, we read the results in loop function
  */
  let commandString = ""
  let port: {
      opened: any
      open: (arg0: { baudRate: number }) => any
      writable: WritableStream<Uint8Array>
      readable: { pipeTo: (arg0: WritableStream<BufferSource>) => any }
      close: () => any
    } | null,
    outputDone: Promise<void> | null,
    outputStream: WritableStream<string> | null,
    inputDone: Promise<any> | null,
    inputStream,
    reader: ReadableStreamDefaultReader<string> | null,
    stream: { write: (arg0: string) => void; releaseLock: () => void },
    csVersion: string | number,
    csIsReadyRequestSent: boolean,
    csIsReady: boolean

  async function send(payload: string) {
    try {
      await writeToStream(payload)
    } catch (err) {
      console.error("Error handling message:", err)
    }
  }

  async function disconnect() {
    try {
      disconnectServer()
      isConnected.value = false
    } catch (err) {
      console.error(err)
    }
  }

  async function connect() {
    try {
      if (!(navigator as any)?.serial) return
      // - Request a port and open an asynchronous connection,
      //   which prevents the UI from blocking when waiting for
      //   input, and allows serial to be received by the web page
      //   whenever it arrives.
      if (!port) {
        port = await (navigator as any)?.serial?.requestPort() // prompt user to select device connected to a com port
        // - Wait for the port to open.
        console.log("User selected a port to connect to", port, port?.opened)
      }

      await port?.open({ baudRate: 115200 }) // open the port at the proper supported baud rate
      connectServer()
      isConnected.value = true
      console.log("useSerial", isConnected.value)
    } catch (err) {
      console.error(err)
    }
  }

  async function connectServer() {
    try {
      // create a text encoder output stream and pipe the stream to port.writeable
      const encoder = new TextEncoderStream()
      if (port?.writable) {
        outputDone = encoder.readable.pipeTo(port.writable)
        outputStream = encoder.writable

        window.serialOutputStream = outputStream
      }

      // Create an input stream and a reader to read the data. port.readable gets the readable stream
      // DCC++ commands are text, so we will pipe it through a text decoder.
      let decoder = new TextDecoderStream()
      inputDone = port?.readable.pipeTo(decoder.writable)
      inputStream = decoder.readable
      //  .pipeThrough(new TransformStream(new LineBreakTransformer())); // added this line to pump through transformer
      //.pipeThrough(new TransformStream(new JSONTransformer()));

      // get a reader and start the non-blocking asynchronous read loop to read data from the stream.
      reader = inputStream.getReader()
      readLoop()
      displayLog("[CONNECTION] Serial connected")
      // To put the system into a known state and stop it from echoing back the characters that we send it,
      // we need to send a CTRL-C and turn off the echo
      writeToStream("\x03", "echo(false);")
      return true
    } catch (err) {
      console.log("User didn't select a port to connect to", err)
      return false
    }
  }

  // While there is still data in the serial buffer us an asynchronous read loop
  // to get the data and place it in the "value" variable. When "done" is true
  // all the data has been read or the port is closed
  async function readLoop() {
    while (true) {
      const readerResult = await reader?.read()
      // const { value, done } = readerResult
      // if (value && value.button) { // alternate check and calling a function
      // buttonPushed(value);

      let thisCommandString = ""

      if (readerResult?.value) {
        commandString = commandString + readerResult.value

        var moreToProcess = true
        while (moreToProcess) {
          // displayLog('[RECEIVE] '+ value);
          // console.log('[RECEIVE] '+ value);

          let end = -1,
            i

          for (i = 0; i < commandString.length; i++) {
            if (commandString.charAt(i) == "\n" && i > 0) {
              end = i
              break
            }
          }

          if (end >= 0) {
            thisCommandString = commandString.substring(0, end)
            if (end > 0) {
              commandString = commandString.substring(end)
              moreToProcess = true
            } else {
              moreToProcess = false
            }
            displayLog("[R] " + thisCommandString)
            // console.log(getTimeStamp() + " [R] " + thisCommandString)
            parseResponse(thisCommandString)
          } else {
            moreToProcess = false
          }
        }
      }
      if (readerResult?.done) {
        console.log(
          getTimeStamp() + " [readLoop] DONE " + readerResult?.done.toString()
        )
        reader?.releaseLock()
        break
      }
    }
  }

  function parseResponse(cmd: string) {
    cmd = cmd.replace(/\n/g, "")
    cmd = cmd.replace(/\r/g, "")
    cmd = cmd.replace(/</g, "")
    cmd = cmd.replace(/>/g, "")
    handleMessage(cmd)
  }

  function writeToStream(...lines: (string | number | object | undefined)[]) {
    // Stops data being written to nonexistent port if using emulator
    // if (emulatorClass == null) displayLog("[i] emulatorClass is null")
    // let stream = emulatorClass
    try {
      stream = window.serialOutputStream.getWriter()

      if (stream) {
        lines.forEach((line) => {
          if (line == "\x03" || line == "echo(false);") {
          } else {
            displayLog("[S] &lt;" + line?.toString() + "&gt;")
          }
          const packet = `${line}\n`
          stream.write(packet)
          console.log(packet)
        })
        stream.releaseLock()
      } else {
        console.error("No stream to write to", outputStream, port, stream)
      }
    } catch (err) {
      console.error("Error writing to stream:", err)
    }
  }

  async function disconnectServer() {
    // if ($("#power-switch").is(":checked")) {
    //   displayLog("[i] Turning off track power")
    //   writeToStream("0")
    //   $("#power-switch").prop("checked", false)
    //   $("#power-status").html("Off")
    // }
    csIsReady = false
    csIsReadyRequestSent = false
    // uiDisable(true)
    if (port) {
      // Close the input stream (reader).
      if (reader) {
        await reader.cancel() // .cancel is asynchronous so must use await to wait for it to finish
        await inputDone?.catch(() => {})
        reader = null
        inputDone = null
        console.log("close reader")
      }

      // Close the output stream.
      if (outputStream) {
        await outputStream.getWriter().close()
        await outputDone // have to wait for  the azync calls to finish and outputDone to close
        outputStream = null
        outputDone = null
        console.log("close outputStream")
      }
      // Close the serial port.
      await port.close()
      port = null
      console.log("close port")
      displayLog("[CONNECTION] Serial disconnected")
    } else {
      // Disables emulator
      // emulatorMode = undefined
      displayLog("[CONNECTION] Emulator disconnected")
    }
    // Allows a new method to be chosen
    // selectMethod.disabled = false
  }

  // Connect or disconnect from the command station

  // Display log of events
  function displayLog(data: string) {
    data = data.replace(/\n/g, "")
    data = data.replace(/\r/g, "")
    data = data.replace(/\\n/g, "")
    data = data.replace(/\\r/g, "")
    data = data.replace(/\\0/g, "")
    data = data.replace(/<br>/g, "\n")
    data = data.replace(/</g, "&lt;")
    data = data.replace(/>/g, "&gt;")
    data = data.replace(/\n/g, "<br>")
    if (data.length > 0) data = getTimeStamp() + " <b>" + data + "</b>"
    // console.log(data.toString())
    // $("#log-box").append(data.toString() + "<br>")
    // $("#log-box").scrollTop($("#log-box").prop("scrollHeight"))

    // $("#log-box2").append(data.toString() + "<br>")
    // $("#log-box2").scrollTop($("#log-box2").prop("scrollHeight"))
  }

  function getTimeStamp() {
    // if (getPreference("timestamp") == "off") return ""

    var now = new Date()
    var startOfSec = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    )
    var millsecs = now.getMilliseconds() - startOfSec.getMilliseconds()
    return (
      //(now.getFullYear()) + '/' +
      // (now.getMonth()+1) + '/' +
      // now.getDate() + " " +
      now.getHours() +
      ":" +
      (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) +
      ":" +
      (now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds()) +
      ":" +
      (millsecs < 10
        ? "00" + millsecs
        : millsecs < 100
        ? "0" + millsecs
        : millsecs)
    )
  }

  function browserType() {
    let userAgent = navigator.userAgent
    let browser = "Unknown"
    let browserOk = false

    // Detect Opera
    if (/Opera/.test(userAgent) || /OPR/.test(userAgent)) {
      browser = "Opera"
      browserOk = true
    }
    // Detect Legacy Edge
    else if (/Edge/.test(userAgent)) {
      browser = "Microsoft Edge (Legacy)"
    }
    // Detect Chromium-based Edge
    else if (/Edg/.test(userAgent)) {
      browser = "Microsoft Edge (Chromium)"
      browserOk = true
    }
    // Detect Chrome
    else if (/Chrome/.test(userAgent) && !/Chromium/.test(userAgent)) {
      browser = "Google Chrome or Chromium"
      browserOk = true
    }
    // Detect Safari
    else if (/Safari/.test(userAgent)) {
      browser = "Apple Safari"
    }
    // Detect Firefox
    else if (/Firefox/.test(userAgent)) {
      browser = "Mozilla Firefox"
    }
    // Detect Internet Explorer
    else if (/Trident/.test(userAgent)) {
      browser = "Internet Explorer"
    }

    if (!browserOk) {
      window.alert(
        "EX-WebThrottle is only known to work on Chromium based web browsers. (i.e. Chrome, Edge, Opera).\n\n Your browser '" +
          browser +
          "' is NOT one of these, so EX-WebThrottle will likely not work. You will not be able to select or interact with the USB port."
      )
    }
    return "[i] Web browser: " + browser + " - '" + userAgent + "'"
  }

  return {
    connect,
    disconnect,
    send,
    isConnected,
    getIsConnected: () => isConnected.value,
    getIsActivelyConnected: () => port !== null,
  }
}
export default useSerial
