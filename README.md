# EX-JS-API
NodeJS Rest API and WebSocket server that connects to a DCC-EX EX-Command Station via USB Serial.

## Usage

```Bash
$ yarn
$ yarn start
```

## Example(s)

```JavaScript
// TODO
```

## Command Reference

| action  | payload | example | meta  | desc  | notes  |
|---|---|---|---|---|---|
| connect  | {Object} @serial: String  | `{ serial: '/devv/ttyusb2301' }`  | Required  | serial: Path to serial port  |   |
| listPorts  | NA  |   |   |   |
| power  | {Integer}  | 1  | 1 or 0 |   |   |
| throttle  |   |   |   | |   |
| output  |   |   |   |  |  |
| function  |   |   |   |   | |
| tbd  |   |   |   | |   |

## Roadmap

- [ ] TypeScript
- [ ] Unit Tests