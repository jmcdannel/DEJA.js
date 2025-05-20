import { useConnectionStore } from "@/connections/connectionStore"

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

export function useSerial() {
  const connStore = useConnectionStore()

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
    csIsReady: boolean,
    last,
    rosterComplete,
    routesComplete

  async function send(action: string, payload: object | undefined | number) {
    try {
      switch (action) {
        case "dcc":
          await writeToStream(payload)
          break
        case "power":
          if (typeof payload === "number") {
            await power(payload)
          }
          break
        case "throttle":
          await sendSpeed(payload as { address: number; speed: number })
          break
        case "turnout":
          await sendTurnout(
            payload as {
              turnoutId: number
              state: Boolean | undefined
            }
          )
          break
        case "output":
          await sendOutput(payload as { pin: number; state: Boolean })
          break
        case "function":
          await sendFunction(payload as SendFunctionPayload)
          break
        default:
          //noop
          console.warn("Unknown action in `handleMessage`", action, payload)
      }
    } catch (err) {
      console.error("Error handling message:", err)
    }
  }
  const power = async (state: number) => {
    await writeToStream(state)
    console.log("Power", state)
  }

  const sendSpeed = async ({
    address,
    speed,
  }: {
    address: number
    speed: number
  }) => {
    const direction = speed > 0 ? 1 : 0
    const absSpeed = Math.abs(speed)
    console.log("Throttle", address, speed, direction)
    const cmd = `t ${address} ${absSpeed} ${direction}`
    await writeToStream(cmd)
  }

  const sendTurnout = async ({
    turnoutId,
    state,
  }: {
    turnoutId: number
    state: Boolean | undefined
  }) => {
    console.log("Turnout", turnoutId, state)
    const cmd = `T ${turnoutId} ${state ? 1 : 0}`
    await writeToStream(cmd)
  }

  const sendFunction = async ({
    address,
    func,
    state,
  }: SendFunctionPayload) => {
    const cmd = `F ${address} ${func} ${state ? 1 : 0}`
    await writeToStream(cmd)
  }

  const sendOutput = async ({
    pin,
    state,
  }: {
    pin: number
    state: Boolean | undefined
  }) => {
    console.log("Output", pin, state)
    const cmd = `Z ${pin} ${state ? 1 : 0}`
    await writeToStream(cmd)
  }

  async function disconnect() {
    try {
      disconnectServer()
      connStore.disconnect()
    } catch (err) {
      console.error(err)
    }
  }

  async function connect() {
    // - Request a port and open an asynchronous connection,
    //   which prevents the UI from blocking when waiting for
    //   input, and allows serial to be received by the web page
    //   whenever it arrives.
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
      connStore.connect("serial")
    } catch (err) {
      console.error(err)
    }
  }
  // - Request a port and open an asynchronous connection,
  //   which prevents the UI from blocking when waiting for
  //   input, and allows serial to be received by the web page
  //   whenever it arrives.
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
            console.log(getTimeStamp() + " [R] " + thisCommandString)
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

    if (!csIsReadyRequestSent) {
      writeToStream("s")
      csIsReadyRequestSent = true
    } else if ((cmd.includes("<iDCC") || cmd.includes("RAM=")) && !csIsReady) {
      csIsReady = true
      // uiEnableThrottleControlOnReady()
      // ToastMaker("Your Command Station has Started.", 4000, {
      //   valign: "bottom",
      //   align: "left",
      // })
      // ToastMaker("Checking Roster and Routes, Turnouts, etc,.", 1000, {
      //   valign: "bottom",
      //   align: "right",
      // })

      //intialise the roster
      writeToStream("JR")
    } else if (cmd.charAt(0) == "<") {
      let locoAddr, cmdArray: string | any[], cmdArrayClean

      cmdArray = cmd.split(" ")
      cmdArrayClean = cmd
        .substring(0, cmd.length - 1)
        .split(/ (?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)

      if (cmd.charAt(1) == "p") {
        // if (cmd.charAt(2) == "0") {
        //   $("#power-switch").prop("checked", false)
        //   $("#power-status").html("is Off")
        // } else {
        //   $("#power-switch").prop("checked", true)
        //   $("#power-status").html("is On")
        // }
        // --------------------------------------------------------------------
      } else if (cmd.charAt(1) == "i") {
        let versionText = ""
        if (cmdArray[1].charAt(0) == "V")
          //version
          try {
            versionText = cmdArray[1].substring(2, cmdArray[1].length)
            let versionArray = versionText.split(".")
            csVersion =
              parseInt(versionArray[0]) +
              parseInt(versionArray[1]) / 100 +
              parseInt(versionArray[2]) / 100000
            displayLog("[i] Version:" + csVersion)
          } catch (e) {
            console.log(
              getTimeStamp() +
                "[ERROR] Unable process version: " +
                versionText +
                "  - " +
                csVersion
            )
          }

        // --------------------------------------------------------------------
      } else if (cmd.charAt(1) == "l") {
        try {
          console.log("parseCommand", cmd)
          // let lastLocoReceived = parseInt(cmdArray[1])
          // let speedbyte = parseInt(cmdArray[3])
          // let functMap = parseInt(cmdArray[4])
          // if (getCV() == lastLocoReceived) {
          //   let now = new Date()
          //   lastTimeReceived = now
          //   if (
          //     getSecondSinceMidnight(now) -
          //       getSecondSinceMidnight(lastTimeSent) >
          //     0.1
          //   ) {
          //     if (speedbyte >= 2 && speedbyte <= 127) {
          //       // reverse
          //       lastSpeedReceived = speedbyte - 1
          //       lastDirReceived = DIRECTION_REVERSED
          //     } else if (speedbyte >= 130 && speedbyte <= 255) {
          //       //forward
          //       lastSpeedReceived = speedbyte - 129
          //       lastDirReceived = DIRECTION_FORWARD
          //     } else if (speedbyte == 0) {
          //       //stop
          //       lastSpeedReceived = 0
          //       lastDirReceived = DIRECTION_REVERSED
          //     } else if (speedbyte == 128) {
          //       //stop
          //       lastSpeedReceived = 0
          //       lastDirReceived = DIRECTION_FORWARD
          //     } else {
          //       lastSpeedReceived = 0
          //       lastDirReceived = getDirection()
          //     }

          //     setDirection(lastDirReceived)
          //     setSpeed(lastSpeedReceived)
          //     setPositionOfDirectionSlider(lastDirReceived)
          //     setPositionofControllers()
          //   } else {
          //     console.log(
          //       "[i] Ignoring Received Speed - too soon since last speed sent."
          //     )
          //   }
          //   for (i = 0; i <= 28; i++) {
          //     fnState = (functMap >> i) & 0x1
          //     fnStateText = fnState == 1 ? "true" : "false"
          //     if (getFunCurrentVal("f" + i) != fnStateText) {
          //       // $("#f" + i).attr("aria-pressed", fnStateText)
          //     }
          //   }
          // }
        } catch (e) {
          console.log(getTimeStamp + "[ERROR] Unable to process speed commands")
        }

        // --------------------------------------------------------------------
      } else if (cmd.charAt(1) == "r" && cmdArray.length == 2) {
        try {
          locoAddr = parseInt(cmdArray[1])
          if (locoAddr > 0) {
            // $("#cv-locoid").val(locoAddr)
          } else {
            displayLog("[i] DCC Address Read Failed!")
          }
        } catch (e) {
          console.log(
            getTimeStamp + "[ERROR] Unable to process read address response"
          )
        }

        // --------------------------------------------------------------------
      } else if (cmd.charAt(1) == "w") {
        try {
          locoAddr = parseInt(cmdArray[1])
          if (locoAddr > 0) {
          } else {
            displayLog("[i] DCC Address Write Failed!")
          }
        } catch (e) {
          console.log(
            getTimeStamp + "[ERROR] Unable to process write address response"
          )
        }

        // --------------------------------------------------------------------
      } else if (cmd.charAt(1) == "v" || cmd.charAt(1) == "r") {
        try {
          let cvid = parseInt(cmdArray[1])
          let cvValue = parseInt(cmdArray[2])
          if (cvid > 0 && cvValue > -1) {
            // $("#cv-cvid").val(cvid)
            // $("#cv-cvvalue").val(cvValue)

            if (cvid == 29) {
              if (!isBitOn(cvValue, 1)) {
                displayLog("CV29- Direction: Forward")
              } else {
                displayLog("CV29- Direction: Reverse")
              }
              if (!isBitOn(cvValue, 2)) {
                displayLog("CV29- Speed Steps: 14")
              } else {
                displayLog("CV29- Speed Steps: 28/128")
              }
              if (!isBitOn(cvValue, 3)) {
                displayLog("CV29- Analogue Conversion: Off")
              } else {
                displayLog("CV29- Analogue Conversion: On")
              }
              if (!isBitOn(cvValue, 5)) {
                displayLog("CV29- Speed Table: Not Used (uses CV 2,5 & 6)")
              } else {
                displayLog("CV29- Speed Table: Enabled")
              }
              if (!isBitOn(cvValue, 6)) {
                displayLog("CV29- Address Size: 2 bit (Short 1-127)")
              } else {
                displayLog("CV29- Address Size: 4 bit (Long 128-10239)")
              }

              displayLog(
                "CV29- Write a value of " +
                  toggleBit(cvValue, 1) +
                  " to CV29 to toggle the direction"
              )
              displayLog(
                "CV29- Write a value of " +
                  toggleBit(cvValue, 5) +
                  " to CV29 to toggle the Speed Table usage"
              )
            }
          } else {
            displayLog("[i] CV Read/Write Failed!")
          }
        } catch (e) {
          console.log(
            getTimeStamp + " [ERROR] Unable to process read CV response"
          )
        }

        // *********************************************************************
      } else if (cmd.charAt(1) == "j") {
        // --------------------------------------------------------------------

        if (cmdArray[0].charAt(2) == "R") {
          //roster
          // last = cmdArray.length - 1
          // if (cmdArrayClean.length > 1) {
          //   // if ==1, then no roster
          //   if (
          //     cmdArrayClean.length == 2 ||
          //     (cmdArrayClean.length > 2 && cmdArrayClean[2].charAt(0) != '"')
          //   ) {
          //     let rosterCount = cmdArrayClean.length - 1,
          //     rosterIds = [],
          //     rosterNames = [],
          //     rosterFunctions = [],
          //     rosterFunctionsJSON = [],
          //     console.log(getTimeStamp() + " Processing roster: " + rosterCount)
          //     try {
          //       for (i = 1; i < cmdArrayClean.length; i++) {
          //         rosterIds[i - 1] = cmdArrayClean[i]
          //         rosterNames[i - 1] = ""
          //         rosterFunctions[i - 1] = ""
          //         rosterFunctionsJSON[i - 1] = ""
          //         // writeToStream("JR " + cmdArrayClean[i]);
          //       }
          //       if (!rosterRequested) {
          //         writeToStream("JR " + rosterIds[0]) // get the details for the first
          //         ToastMaker("Please wait - Loading Roster", 1000, {
          //           valign: "bottom",
          //           align: "center",
          //         })
          //         rosterRequested = true
          //       }
          //     } catch (e) {
          //       console.log(getTimeStamp() + " [ERROR] Unable process roster: ")
          //     }
          //   } else {
          //     // individual roster entry
          //     console.log(
          //       getTimeStamp() +
          //         " Processing individual roster entry: " +
          //         cmdArrayClean[1]
          //     )
          //     rosterComplete = true
          //     for (i = 0; i < rosterIds.length; i++) {
          //       if (rosterIds[i] == cmdArrayClean[1]) {
          //         rosterNames[i] = cmdArrayClean[2].substring(
          //           1,
          //           cmdArrayClean[2].length - 1
          //         )
          //         rosterFunctions[i] = cmdArrayClean[3].substring(
          //           1,
          //           cmdArrayClean[3].length - 1
          //         )
          //         splitFns = rosterFunctions[i].split("/")
          //         empty = true
          //         for (j = 0; j < splitFns.length; j++) {
          //           if (splitFns[j].length > 0) {
          //             empty = false
          //             break
          //           }
          //         }
          //         rosterFunctionsJSON[i] =
          //           '{"mname":"' + rosterNames[i] + '","fnData":{'
          //         if (!empty) {
          //           for (j = 0; j < splitFns.length; j++) {
          //             // console.log(getTimeStamp() + ' splitFns: ' + j + " : " + splitFns[j]);
          //             momentary = 0
          //             if (splitFns[j].charAt(0) == "*") {
          //               momentary = 1
          //               splitFns[j] = splitFns[j].substring(1)
          //             }
          //             rosterFunctionsJSON[i] =
          //               rosterFunctionsJSON[i] +
          //               '"f' +
          //               j +
          //               '":[0,' +
          //               momentary +
          //               ',"' +
          //               splitFns[j] +
          //               '",1]'
          //             if (j < splitFns.length - 1)
          //               rosterFunctionsJSON[i] = rosterFunctionsJSON[i] + ","
          //           }
          //         }
          //         rosterFunctionsJSON[i] = rosterFunctionsJSON[i] + "}}"
          //       }
          //     }
          //     for (i = 0; i < rosterIds.length; i++) {
          //       if (rosterNames[i].length == 0) {
          //         writeToStream("JR " + rosterIds[i]) // get the next
          //         rosterComplete = false
          //         break
          //       }
          //     }
          //     if (rosterComplete) {
          //       rosterJSON = "["
          //       for (i = 0; i < rosterCount; i++) {
          //         rosterJSON = rosterJSON + '{"name":"' + rosterNames[i] + '",'
          //         rosterJSON = rosterJSON + '"cv":"' + rosterIds[i] + '",'
          //         rosterJSON = rosterJSON + '"type":"ROSTER",'
          //         rosterJSON = rosterJSON + '"brand":"_",'
          //         rosterJSON = rosterJSON + '"decoder":"_",'
          //         rosterJSON = rosterJSON + '"map":"' + rosterNames[i] + '"'
          //         rosterJSON = rosterJSON + "}"
          //         if (i < rosterCount - 1) rosterJSON = rosterJSON + ","
          //       }
          //       rosterJSON = rosterJSON + "]"
          //       combinedLocoList = getCombinedLocoList()
          //       loadmaps()
          //       //intialise the routes
          //       if (!routesRequested) {
          //         writeToStream("JA")
          //       }
          //     }
          //   }
          // } else {
          //   //intialise the routes
          //   rosterComplete = true
          //   writeToStream("JA")
          // }
          // --------------------------------------------------------------------
        } else if (cmdArray[0].charAt(2) == "A") {
          //routes/automations
          // last = cmdArray.length - 1
          // if (cmdArrayClean.length > 1) {
          //   // if ==1, then no routes
          //   if (
          //     cmdArrayClean.length == 2 ||
          //     (cmdArrayClean.length > 3 && cmdArrayClean[3].charAt(0) != '"')
          //   ) {
          //     routesCount = cmdArrayClean.length - 1
          //     console.log(getTimeStamp() + " Processing routes: " + routesCount)
          //     try {
          //       for (i = 1; i < cmdArrayClean.length; i++) {
          //         routesIds[i - 1] = cmdArrayClean[i]
          //         routesTypes[i - 1] = ""
          //         routesNames[i - 1] = ""
          //         routesStates[i - 1] = -1 // unknown
          //         routesLabels[i - 1] = "Set"
          //       }
          //       if (!routesRequested) {
          //         // If we havn't already asked
          //         writeToStream("JA " + routesIds[0]) // get the details for the first
          //         routesRequested = true
          //       }
          //       ToastMaker("Please wait - Loading Routes/Automations", 1000, {
          //         valign: "bottom",
          //         align: "right",
          //       })
          //     } catch (e) {
          //       console.log(getTimeStamp() + " [ERROR] Unable process routes: ")
          //     }
          //   } else {
          //     // individual entry
          //     console.log(
          //       getTimeStamp() +
          //         " Processing individual route entry: " +
          //         cmdArrayClean[1]
          //     )
          //     routesComplete = true
          //     for (i = 0; i < routesIds.length; i++) {
          //       if (routesIds[i] == cmdArrayClean[1]) {
          //         routesTypes[i] = cmdArrayClean[2]
          //         routesNames[i] = cmdArrayClean[3].substring(
          //           1,
          //           cmdArrayClean[3].length - 1
          //         )
          //       }
          //     }
          //     for (i = 0; i < routesIds.length; i++) {
          //       if (routesNames[i].length == 0) {
          //         writeToStream("JA " + routesIds[i]) // get the next
          //         routesComplete = false
          //         break
          //       }
          //     }
          //     if (routesComplete) {
          //       buildRoutesJSON()
          //       routesComplete = true
          //       //intialise the turnouts/points
          //       if (!turnoutsRequested) {
          //         writeToStream("JT")
          //       }
          //     }
          //   }
          // } else {
          //   routesComplete = true
          // }
          // --------------------------------------------------------------------
        } else if (cmdArray[0].charAt(2) == "B") {
          //routes/automations updates
          // <jB id state>    state: 0=inactive 1=active 2=hidden

          console.log(
            getTimeStamp() +
              " Processing individual route entry update: " +
              cmdArrayClean?.[1]
          )

          // routesComplete = true
          // for (i = 0; i < routesIds.length; i++) {
          //   if (routesIds[i] == cmdArrayClean[1]) {
          //     if (cmdArrayClean[2].charAt(0) != '"') {
          //       // state change
          //       routesStates[i] = cmdArrayClean[2]
          //     } else {
          //       // label change
          //       routesLabels[i] = cmdArrayClean[2].substring(
          //         1,
          //         cmdArrayClean[2].length - 1
          //       )
          //     }
          //   }
          // }
          // buildRoutesJSON()
          // loadRoutes()

          // --------------------------------------------------------------------
        } else if (cmdArray[0].charAt(2) == "T") {
          //turnouts/points
          //   last = cmdArray.length - 1
          //   if (cmdArrayClean.length > 1) {
          //     // if ==1, then no turnouts
          //     if (
          //       cmdArrayClean.length == 2 ||
          //       (cmdArrayClean.length > 3 && cmdArrayClean[3].charAt(0) != '"')
          //     ) {
          //       turnoutsCount = cmdArrayClean.length - 1
          //       console.log(
          //         getTimeStamp() + " Processing turnouts: " + turnoutsCount
          //       )
          //       try {
          //         for (i = 1; i < cmdArrayClean.length; i++) {
          //           turnoutsIds[i - 1] = cmdArrayClean[i]
          //           turnoutsStates[i - 1] = ""
          //           turnoutsNames[i - 1] = ""
          //         }
          //         if (!turnoutsRequested) {
          //           // If we havn't already asked
          //           writeToStream("JT " + turnoutsIds[0]) // get the details for the first
          //           turnoutsRequested = true
          //         }
          //         ToastMaker("Please wait - Loading Turnouts/Points", 1000, {
          //           valign: "bottom",
          //           align: "right",
          //         })
          //       } catch (e) {
          //         console.log(
          //           getTimeStamp() + " [ERROR] Unable process turnouts: "
          //         )
          //       }
          //     } else {
          //       // individual entry
          //       console.log(
          //         getTimeStamp() +
          //           " Processing individual turnout entry: " +
          //           cmdArrayClean[1]
          //       )
          //       turnoutsComplete = true
          //       for (i = 0; i < turnoutsIds.length; i++) {
          //         if (turnoutsIds[i] == cmdArrayClean[1]) {
          //           turnoutsStates[i] = cmdArrayClean[2]
          //           tName = cmdArrayClean[3].substring(
          //             1,
          //             cmdArrayClean[3].length - 1
          //           )
          //           turnoutsNames[i] = tName.length > 0 ? tName : "-blank-"
          //         }
          //       }
          //       for (i = 0; i < turnoutsIds.length; i++) {
          //         if (turnoutsNames[i].length == 0) {
          //           writeToStream("JT " + turnoutsIds[i]) // get the next
          //           turnoutsComplete = false
          //           break
          //         }
          //       }
          //       if (turnoutsComplete) {
          //         buildTurnoutsJSON()
          //         turnoutsComplete = true
          //         ToastMaker("Your Command Station is ready.", 15000, {
          //           valign: "bottom",
          //           align: "left",
          //         })
          //         ToastMaker("Use the [Loco ID] field select a Loco.", 10000, {
          //           valign: "bottom",
          //           align: "right",
          //         })
          //       }
          //     }
          //   } else {
          //     turnoutsComplete = true
          //     ToastMaker("Your Command Station is ready.", 15000, {
          //       valign: "bottom",
          //       align: "left",
          //     })
          //     ToastMaker("Use the [Loco ID] field select a Loco.", 10000, {
          //       valign: "bottom",
          //       align: "right",
          //     })
          //   }
          // }
          // *********************************************************************
        } else if (cmd.charAt(1) == "H") {
          // turnout/point update
          // console.log(
          //   getTimeStamp() +
          //     " Processing individual turnout state change: " +
          //     cmdArrayClean[1]
          // )
          // turnoutsComplete = true
          // for (i = 0; i < turnoutsIds.length; i++) {
          //   if (turnoutsIds[i] == cmdArrayClean[1]) {
          //     turnoutsStates[i] = cmdArrayClean[2]
          //     if (turnoutsStates[i] == "1") {
          //       turnoutsStates[i] = "T"
          //     } else if (turnoutsStates[i] == "0") {
          //       turnoutsStates[i] = "C"
          //     }
          //     break
          //   }
          // }
          // buildTurnoutsJSON()
          // loadTurnouts()
          // *********************************************************************
        } else if (cmdArray[0].charAt(1) == "m") {
          // announcement/messages
          if (cmdArrayClean?.length == 2) {
            // ToastMaker(
            //   cmdArrayClean[1].substring(1, cmdArrayClean[1].length - 1),
            //   10000,
            //   { valign: "top", align: "center" }
            // )
          }

          // *********************************************************************
        } else if (cmdArray[0].charAt(1) == "*") {
          // alert
          if (
            cmdArrayClean?.length >= 2 &&
            cmdArrayClean?.[1] == "TRACK" &&
            cmdArrayClean?.[3] == "ALERT"
          ) {
            // ToastMaker(
            //   "FAULT on Track: " + cmdArrayClean[2] + " - Response: " + cmd,
            //   5000,
            //   { valign: "top", align: "center" }
            // )
          }

          // *********************************************************************
        }
      }
    }
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
          const packet = `<${line}>\n`
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
        await reader.cancel() // .cancel is asynchronous so must use await to wave for it to finish
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

  function getSecondSinceMidnight(myDate: Date) {
    var seconds = myDate.getHours() * 60 * 60
    seconds = seconds + myDate.getMinutes() * 60
    seconds = seconds + myDate.getSeconds()
    seconds = seconds + myDate.getMilliseconds() / 1000
    return seconds
  }

  function copyLogToClipboard() {
    // let text = document.getElementById("log-box").innerText
    // text = "```\n" + text + "\n```"
    // navigator.clipboard.writeText(text)
    // console.log("[i] Content copied to clipboard")
    // displayLog("[i] Content copied to clipboard")
  }

  function isBitOn(n: number, index: number) {
    let i = index - 1
    // return Boolean(number & (1 << index));

    var mask = 1 << i // gets the i'th bit
    if ((n & mask) != 0) {
      return true
    } else {
      return false
    }
  }

  function toggleBit(n: number, index: number) {
    let i = index - 1
    var mask = 1 << i // gets the index'th bit
    n ^= mask
    return n
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
  }
}
export default useSerial
