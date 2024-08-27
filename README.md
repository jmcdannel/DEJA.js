# <span style="color: #16c5d9;">DEJA</span>.js
## <span style="color: #16c5d9;">D</span>CC-<span style="color: #16c5d9;">E</span>X <span style="color: #16c5d9;">J</span>avaScript <span style="color: #16c5d9;">A</span>pi
### The Definitive, Tranformative, Innovative DCC-EX CommandStation API
---
> This API runs on any supported device with a [DCC-EX EX-CommandStation](https://dcc-ex.com/ex-commandstation/index.html) connected via USB. DEJA.js can replace JMRI as a lightweight replacement that runs in modern environments.

## What is DEJA.js

- 🧠 NodeJS application that runs on a 💻 Mac/PC/Linux/Raspberry Pi that is connection to a [DCC-EX EX-CommandStation](https://dcc-ex.com/ex-commandstation/index.html)
- 🔥 Use [🛰️ DEJA Throttle](https://github.com/jmcdannel/DEJAThrottle) to connect to DEJA.js and send DCC Loco commands to your track
- 🌎 DEJA.js is written in JavaScript - the most popular programming language in the world<sup>*</sup>
- ✨ Replace JMRI. DEJA.js is 🌟 modern, ⚡ blazing fast, it's requirements are simple 🎯, and you'll never look back 👀!

<p align="center">
  <img src="./resources/DEJA-simple.drawio.svg" alt="Architecture Diagram of DEJA.js" />
</p>

## 🚀 Getting Started

### 📦 Prerequisites

- 📦 [Install & Configure DCC-EX CommandStation](https://dcc-ex.com/ex-commandstation/index.html) connected via USB to  a 💻 Mac/PC/Linux/Raspberry Pi
- 📦 [Install NodeJS 20+](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) on the same 💻 Mac/PC/Linux/Raspberry Pi

  ```bash
  $ nvm install 21
  ```

### 📝 Configure Environment
  
  Create a `.env` file in this directory.
  ```bash
  $ touch .env
  ```

  Copy & Paste the values below into the`.env` file.
  
  ```
  LAYOUT_ID=[your-layout-name]
  VITE_MQTT_BROKER=wss://test.mosquitto.org
  VITE_MQTT_PORT=8081
  ENABLE_MQTT=true
  ENABLE_WS=true
  VITE_WS_PORT=8082
  VITE_WS_ID=DEJA.js
  ```

## ❗❗❗ 📣 📣 📣 ❗❗❗ 
## Replace `your-layout-name` with a descriptive name of your layout. Only use lowercase letter, numbers, and dashed. No spaces. No special characters. No emoji.

#### 🤌 GOOD Examples 
`LAYOUTID=[my-basement-empire]`

`LAYOUTID=[idaho-crossing]`

`LAYOUTID=[something-unique]`

`LAYOUTID=[apple-munchkin-fairy]`

#### 💩 BAD Examples 
`LAYOUTID=[My B@sement "Empire"!]`

`LAYOUTID=[ID_cross]`

`LAYOUTID=[my-basement-empire]` (already used!)

`LAYOUTID=['🍎👶🧚']`

### 🧩 Usage

- 🚀 Install & Run

  Clone this repository and open a terminal in the projet root.

  ```bash
  $ npm i -g pnpm
  $ pnpm install
  $ pnpm run start
  ```

- 🛤️ Open a [Supported Throttle](https://trestle-tt-suite-ttt-throttle-app.vercel.app/) and connect to the DCC-EX CommandStation via DEJA.js

## Command Reference

>> // TODO: imporove with examples, MQTT Explorer instructions

| action    | payload                                                                           | notes                                                                                  |                                           |     |
| --------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- | --- |
| connect   | `{Object}`<br>serial: `{String}`                                                  | Returns: ```{ 'action': 'connected', payload: { path: {String}, baudRate: {String} } }``` | example: `{ serial: '/devv/ttyusb2301' }` | --- |
| dcc       | `{String}`                                                                        | send raw DCC command (omit `<` and `>`)                                                |                                           |     |
| getStatus | `{Object}`<br>`{ action: 'status', payload: { isConnected: {Boolean} }`           |                                                                                        |                                           |     |
| listPorts | `{Object}`<br>`{ 'action': 'listPorts', [ports] }`                                | Returns array of available USB ports                                                   |                                           |     |
| power     | `{Integer}`                                                                       | Toggle track power. 1 = ON, 0 = OFF                                                    |                                           |     |
| throttle  | `{Object}`<br>address: `{Integer}`<br>speed: `{Integer}`                          | Forward = positive `speed`, Reverse = negative `-speed`                                |                                           |     |
| turnout   | `{Object}`<br>turnoutId: `{Integer}`<br>state: `{Boolean}`                        | Toggle DCC-EX Turnout                                                                  |                                           |     |
| output    | `{Object}`<br>pin: `{Integer}`<br>state: `{Boolean}`                              | Toggle DCC-EX Output                                                                   |                                           |     |
| function  | `{Object}`<br>address: `{Integer}`<br>function: `{Integer}`<br>state: `{Boolean}` | Toggle DCC-EX Locomotive Function                                                      |                                           |     |

## Roadmap

- [ ] Convert to TypeScript
- [ ] Write Unit Tests
- [ ] Support Turnouts
- [ ] Support Outputs


## 🛠️ Built With

[![Node][Node.js]][Node-url]
[![MQTT][MQTT.js]][MQTT-url]
[![Arduino][Arduino]][Arduino-url]
[![pnpm][pnpm]][pnpm-url]
[![ESLint][ESLint]][ESLint-url]
[![Prettier][Prettier]][Prettier-url]


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[Node.js]: https://img.shields.io/badge/node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[MQTT.js]: https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white
[MQTT-url]: https://mqtt.org/
[pnpm]: https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white
[pnpm-url]: https://pnpm.io/
[TypeScript]: https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Arduino]: https://img.shields.io/badge/Arduino-00878F?style=for-the-badge&logo=arduino&logoColor=white
[Arduino-url]: https://www.arduino.cc/
[ESLint]: https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white
[ESLint-url]: https://eslint.org/
[Prettier]: https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white
[Prettier-url]: https://prettier.io/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/