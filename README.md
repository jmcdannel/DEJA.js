# <span style="color: #16c5d9;">DEJA</span>.js

### The <span style="color: #16c5d9;">D</span>CC-<span style="color: #16c5d9;">E</span>X <span style="color: #16c5d9;">J</span>avaScript <span style="color: #16c5d9;">A</span>pi

This API runs on any supported device with a DCC-EX CommandStation connected via USB. DEJA.js can replace JMRI as a lightweight replacement that runs in modern environments.

## What is DEJA.js

[TODO: add introduction]

> [!NOTE]
> This project uses [pnpm](https://pnpm.io/) to install dependencies and run scripts.

## Getting Started

### Prerequisites

- 📦 [Install & Configure DCC-EX CommandStation](https://dcc-ex.com/ex-commandstation/index.html) via USB to Mac/PC/Linux/Raspberry Pi
- 📦 Install NodeJS 21+ on Mac/PC/Linux/Raspberry Pi

  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  ```

  ```bash
  nvm install 21
  ```

- 📝 Configure Environment
  Environment setup is currently a manual process. The roadmap includes features to enable self-service. See [Track and Trestle Technology](https://github.com/jmcdannel/trestle-tt-suite) to setup your layout.

### Usage

- 🚀 Install & Run

  Clone this repository and open a terminal in the projet root.

  ```bash
  pnpm install
  pnpm run start
  ```

- 🛤️ Open a [Supported Throttle](https://trestle-tt-suite-ttt-throttle-app.vercel.app/) and connect to the DCC-EX CommandStation via DEJA.js

## Command Reference

| action    | payload                                                                           | notes                                                                                  |
| --------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- | --- |
| connect   | `{Object}`<br>serial: `{String}`                                                  | Returns: `({ 'action': 'connected', payload: { path: {String}, baudRate: {String} } }` | example: `{ serial: '/devv/ttyusb2301' }` |
| dcc       | `{String}`                                                                        | send raw DCC command (omit `<` and `>`)                                                |                                           |     |
| getStatus | `{Object}`<br>`{ action: 'status', payload: { isConnected: {Boolean} }`           |                                                                                        |                                           |     |
| listPorts | `{Object}`<br>`{ 'action': 'listPorts', [ports] }`                                | Returns array of available USB ports                                                   |
| power     | `{Integer}`                                                                       | Toggle track power. 1 = ON, 0 = OFF                                                    |
| throttle  | `{Object}`<br>address: `{Integer}`<br>speed: `{Integer}`                          | Forward = positive `speed`, Reverse = negative `-speed`                                |
| turnout   | `{Object}`<br>turnoutId: `{Integer}`<br>state: `{Boolean}`                        | Toggle DCC-EX Turnout                                                                  |
| output    | `{Object}`<br>pin: `{Integer}`<br>state: `{Boolean}`                              | Toggle DCC-EX Output                                                                   |
| function  | `{Object}`<br>address: `{Integer}`<br>function: `{Integer}`<br>state: `{Boolean}` | Toggle DCC-EX Locomotive Function                                                      |

## Roadmap

- [ ] Convert to TypeScript
- [ ] Write Unit Tests
