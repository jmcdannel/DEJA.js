# WebSocket Protocol for Device-Specific Serial Monitoring

## Overview

The WebSocket server now supports both general broadcast messages and device-specific serial monitoring. This allows the monitor app to:

1. **Receive general broadcast messages** (DCC commands, status updates, etc.)
2. **Subscribe to device-specific serial monitoring** for individual devices
3. **Receive filtered serial communication** for each device separately

## Connection

Connect to the WebSocket server at the configured port (default: 8082).

## Message Types

### 1. General Broadcast Messages

These are sent to all connected clients and include:
- DCC commands (`action: 'dcc'`)
- Connection status (`action: 'connected'`)
- Port lists (`action: 'portList'`)
- Status updates (`action: 'status'`)

### 2. Device-Specific Serial Messages

These are only sent to clients subscribed to specific devices:
- Incoming serial data (`action: 'serial-data', direction: 'incoming'`)
- Outgoing serial commands (`action: 'serial-data', direction: 'outgoing'`)

## Subscription Protocol

### Subscribe to Device Serial Monitoring

To start monitoring a specific device's serial communication:

```json
{
  "action": "subscribe-device",
  "deviceId": "device-123"
}
```

**Response:**
```json
{
  "action": "device-subscribed",
  "payload": {
    "deviceId": "device-123",
    "success": true
  }
}
```

### Unsubscribe from Device Serial Monitoring

To stop monitoring a specific device:

```json
{
  "action": "unsubscribe-device",
  "deviceId": "device-123"
}
```

**Response:**
```json
{
  "action": "device-unsubscribed",
  "payload": {
    "deviceId": "device-123",
    "success": true
  }
}
```

## Serial Data Messages

### Incoming Serial Data

When serial data is received from a device:

```json
{
  "action": "serial-data",
  "payload": {
    "deviceId": "device-123",
    "data": "T 1 1",
    "timestamp": "2024-01-15T14:30:22.123Z",
    "direction": "incoming"
  }
}
```

### Outgoing Serial Commands

When serial commands are sent to a device:

```json
{
  "action": "serial-data",
  "payload": {
    "deviceId": "device-123",
    "data": "T 1 1",
    "timestamp": "2024-01-15T14:30:22.123Z",
    "direction": "outgoing"
  }
}
```

## Usage Example

### Monitor App Implementation

```javascript
const ws = new WebSocket('ws://localhost:8082')

// Listen for general broadcast messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  
  if (message.action === 'serial-data') {
    // This is device-specific serial data
    const { deviceId, data, direction, timestamp } = message.payload
    
    // Route to appropriate device monitor window
    if (deviceMonitors[deviceId]) {
      deviceMonitors[deviceId].addSerialMessage(data, direction, timestamp)
    }
  } else {
    // This is a general broadcast message
    handleGeneralMessage(message)
  }
}

// Subscribe to device serial monitoring
function subscribeToDevice(deviceId) {
  ws.send(JSON.stringify({
    action: 'subscribe-device',
    deviceId: deviceId
  }))
}

// Unsubscribe from device serial monitoring
function unsubscribeFromDevice(deviceId) {
  ws.send(JSON.stringify({
    action: 'unsubscribe-device',
    deviceId: deviceId
  }))
}
```

## Benefits

1. **Separation of Concerns**: General broadcast messages don't clutter device-specific monitors
2. **Real-time Monitoring**: See serial communication as it happens for each device
3. **Filtered Views**: Each device monitor only shows its own serial traffic
4. **Efficient**: No need to filter messages on the client side
5. **Scalable**: Multiple clients can monitor different devices independently

## Device Lifecycle

1. **Device Connected**: Serial port is mapped to device ID
2. **Client Subscribes**: Client sends subscription message
3. **Serial Monitoring Active**: All serial I/O for that device is sent to subscribed clients
4. **Device Disconnected**: Port mapping is cleaned up
5. **Client Unsubscribes**: Client stops receiving device-specific messages

## Error Handling

- Invalid device IDs will result in subscription failure
- Disconnected devices will not send serial messages
- WebSocket connection issues will automatically clean up subscriptions 