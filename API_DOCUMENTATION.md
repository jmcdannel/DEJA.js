# Deja DCC-EX API Documentation

A comprehensive guide to all public APIs, functions, and components in the Deja DCC-EX control system.

## Table of Contents

1. [Overview](#overview)
2. [Packages](#packages)
   - [UI Components](#ui-components)
   - [Utilities](#utilities)
   - [Authentication](#authentication)
   - [DCC-EX Integration](#dcc-ex-integration)
   - [Deja Core](#deja-core)
   - [Modules](#modules)
3. [Applications](#applications)
   - [Server](#server)
   - [Throttle](#throttle)
4. [Types and Interfaces](#types-and-interfaces)
5. [Examples](#examples)

## Overview

Deja is a modern web-based DCC-EX control system built with Vue.js, TypeScript, and Firebase. It provides a comprehensive set of tools for controlling model trains through DCC-EX command stations.

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Throttle App  │    │   Server App    │    │   DCC-EX HW     │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   Command       │
│                 │    │                 │    │   Station       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   MQTT Broker   │
│   (Cloud DB)    │    │   (Optional)    │
└─────────────────┘    └─────────────────┘
```

## Packages

### UI Components

**Package:** `@repo/ui`  
**Location:** `packages/ui/`

A collection of Vue.js components for building DCC-EX control interfaces.

#### Components

##### LocoAvatar

A locomotive avatar component with menu functionality.

**Props:**
```typescript
interface LocoAvatarProps {
  loco: Loco;           // Required locomotive object
  size?: number;        // Size in pixels (default: 72)
  color?: string;       // Custom color (falls back to loco.meta.color)
  showConsist?: boolean; // Show consist badge (default: true)
  showMenu?: boolean;   // Show action menu (default: false)
  variant?: 'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'; // Button variant (default: 'tonal')
}
```

**Events:**
```typescript
interface LocoAvatarEvents {
  select: (address: number) => void;  // Emitted when locomotive is selected
  park: (loco: Loco) => void;        // Emitted when locomotive is parked
  stop: (loco: Loco) => void;        // Emitted when locomotive is stopped
}
```

**Usage:**
```vue
<template>
  <LocoAvatar 
    :loco="locomotive"
    :size="96"
    color="blue"
    :show-menu="true"
    @select="handleSelect"
    @park="handlePark"
    @stop="handleStop"
  />
</template>

<script setup>
import { LocoAvatar } from '@repo/ui';

const locomotive = {
  address: 3,
  name: "Big Boy",
  meta: { color: "red" },
  consist: []
};

function handleSelect(address) {
  console.log('Selected locomotive:', address);
}

function handlePark(loco) {
  console.log('Parking locomotive:', loco);
}

function handleStop(loco) {
  console.log('Stopping locomotive:', loco);
}
</script>
```

##### Consist

Main consist (locomotive group) component for controlling multiple locomotives together.

**Usage:**
```vue
<template>
  <Consist />
</template>

<script setup>
import { Consist } from '@repo/ui';
</script>
```

##### MiniConsist

Compact version of the consist component.

**Usage:**
```vue
<template>
  <MiniConsist />
</template>

<script setup>
import { MiniConsist } from '@repo/ui';
</script>
```

##### Functions

Locomotive function control component.

**Usage:**
```vue
<template>
  <Functions />
</template>

<script setup>
import { Functions } from '@repo/ui';
</script>
```

##### FunctionsSpeedDial

Floating action button for quick access to locomotive functions.

**Usage:**
```vue
<template>
  <FunctionsSpeedDial />
</template>

<script setup>
import { FunctionsSpeedDial } from '@repo/ui';
</script>
```

##### UserProfile

User profile management component.

**Usage:**
```vue
<template>
  <UserProfile />
</template>

<script setup>
import { UserProfile } from '@repo/ui';
</script>
```

##### SelectLayout

Layout selection component.

**Usage:**
```vue
<template>
  <SelectLayout />
</template>

<script setup>
import { SelectLayout } from '@repo/ui';
</script>
```

##### LayoutChip

Compact layout display chip.

**Usage:**
```vue
<template>
  <LayoutChip />
</template>

<script setup>
import { LayoutChip } from '@repo/ui';
</script>
```

##### Turnout Components

Collection of turnout (switch) control components:

- **TurnoutList** - List view of all turnouts
- **TurnoutItem** - Individual turnout item
- **TurnoutSwitch** - Toggle switch for turnout control
- **TurnoutCard** - Card layout for turnout
- **TurnoutButton** - Button interface for turnout
- **TurnoutRaw** - Raw turnout data display
- **TurnoutTable** - Table view of turnouts

**Usage:**
```vue
<template>
  <TurnoutList />
  <TurnoutSwitch :turnout="myTurnout" />
  <TurnoutCard :turnout="myTurnout" />
</template>

<script setup>
import { 
  TurnoutList, 
  TurnoutSwitch, 
  TurnoutCard 
} from '@repo/ui';
</script>
```

### Utilities

**Package:** `@repo/utils`  
**Location:** `packages/utils/`

Common utility functions used across the application.

#### Functions

##### slugify

Converts a string to a URL-friendly slug.

**Signature:**
```typescript
function slugify(str: string): string
```

**Usage:**
```typescript
import { slugify } from '@repo/utils';

const title = "My Locomotive Name!";
const slug = slugify(title); // "my-locomotive-name"

// Also available as default export
import slugify from '@repo/utils/slugify';
```

**Example:**
```typescript
// Input: "Big Boy 4014"
// Output: "big-boy-4014"

// Input: "  Special Characters! @#$  "
// Output: "special-characters"
```

### Authentication

**Package:** `@repo/auth`  
**Location:** `packages/auth/`

Authentication utilities and components for the Deja system.

#### Components

##### Login

Login form component with Firebase authentication.

**Usage:**
```vue
<template>
  <Login />
</template>

<script setup>
import { Login } from '@repo/auth';
</script>
```

##### Signout

Sign out component for user logout.

**Usage:**
```vue
<template>
  <Signout />
</template>

<script setup>
import { Signout } from '@repo/auth';
</script>
```

#### Guards

Route guards for protecting authenticated routes.

##### requireAuth

Ensures user is authenticated before accessing route.

**Usage:**
```typescript
import { requireAuth } from '@repo/auth';

const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    beforeEnter: requireAuth
  }
];
```

##### requireDccEx

Ensures DCC-EX connection is established.

**Usage:**
```typescript
import { requireDccEx } from '@repo/auth';

const routes = [
  {
    path: '/control',
    component: ControlPanel,
    beforeEnter: requireDccEx
  }
];
```

##### requireLayout

Ensures a layout is selected.

**Usage:**
```typescript
import { requireLayout } from '@repo/auth';

const routes = [
  {
    path: '/throttle',
    component: Throttle,
    beforeEnter: requireLayout
  }
];
```

### DCC-EX Integration

**Package:** `@repo/dccex`  
**Location:** `packages/dccex/`

Core DCC-EX command station integration utilities.

#### Composables

##### useDcc

Vue composable for DCC-EX command station control.

**Returns:**
```typescript
interface UseDccReturn {
  layoutId: Ref<string>;
  isEmulated: Ref<boolean>;
  isSerial: Ref<boolean>;
  setFunction: (address: number, func: number, state: boolean) => Promise<void>;
  sendOutput: (pin: number, state: boolean) => Promise<void>;
  setPower: (payload: object) => Promise<void>;
  sendDccCommand: (command: DccCommand) => Promise<void>;
  send: (action: string, payload: any) => Promise<void>;
}
```

**Usage:**
```vue
<script setup>
import { useDcc } from '@repo/dccex';

const { 
  layoutId, 
  isEmulated, 
  setFunction, 
  setPower, 
  sendOutput 
} = useDcc();

// Set locomotive function
async function toggleHeadlight() {
  await setFunction(3, 0, true); // Address 3, Function 0 (headlight), ON
}

// Control track power
async function powerOn() {
  await setPower({ command: '1' }); // Power ON
}

async function powerOff() {
  await setPower({ command: '0' }); // Power OFF
}

// Control accessory output
async function throwTurnout() {
  await sendOutput(123, true); // Pin 123, THROWN
}
</script>
```

#### Constants

##### defaultCommands

Predefined DCC-EX commands for common operations.

**Available Commands:**
```typescript
const defaultCommands = [
  {
    id: 'p',
    type: 'toggle',
    label: 'Power',
    icon: 'mdi-power',
    command: ['0', '1'],
  },
  {
    id: 'pmain',
    type: 'toggle',
    label: 'Power MAIN',
    icon: 'mdi-power',
    command: ['0 MAIN', '1 MAIN'],
  },
  {
    id: 'r',
    type: 'dcc',
    label: 'Reset',
    icon: 'mdi-refresh',
    command: 'D RESET',
  },
  {
    id: 's',
    type: 'dcc',
    label: 'Status',
    icon: 'mdi-information',
    command: '=',
  },
  {
    id: 'e',
    type: 'dcc',
    label: 'Save <E>',
    icon: 'mdi-memory-arrow-down',
    command: 'E',
  },
  {
    id: 'z',
    type: 'dcc',
    label: 'List Outputs',
    icon: 'mdi-creation',
    command: 'Z',
  },
  {
    id: 'dcc',
    type: 'text',
    label: 'DCC Command',
    icon: 'mdi-code-tags',
    command: '',
  }
];
```

**Usage:**
```typescript
import { defaultCommands } from '@repo/dccex';

// Use predefined commands in your UI
const powerCommand = defaultCommands.find(cmd => cmd.id === 'p');
console.log(powerCommand.command); // ['0', '1']
```

### Deja Core

**Package:** `@repo/deja`  
**Location:** `packages/deja/`

Core Deja system utilities and composables.

#### Composables

##### useDejaJS

Main Deja system composable (requires further exploration for complete documentation).

**Usage:**
```typescript
import { useDejaJS } from '@repo/deja';

const deja = useDejaJS();
```

### Modules

**Package:** `@repo/modules`  
**Location:** `packages/modules/`

Modular business logic for different aspects of the DCC system.

#### Layout Module

**Import:** `@repo/modules/layouts`

Functions for layout management and configuration.

**Exports:**
- `useLayout` - Layout management composable
- Layout types and constants

**Usage:**
```typescript
import { useLayout } from '@repo/modules';

const { layout, saveLayout, loadLayout } = useLayout();
```

#### Locomotives Module

**Import:** `@repo/modules/locos`

Functions for locomotive management and control.

**Exports:**
- `useLocos` - Locomotive management composable
- `useFunctions` - Locomotive function management
- `useFunctionIcon` - Function icon utilities
- Locomotive types and constants

**Usage:**
```typescript
import { 
  useLocos, 
  useFunctions, 
  useFunctionIcon 
} from '@repo/modules/locos';

const { locos, addLoco, removeLoco } = useLocos();
const { functions, setFunction } = useFunctions();
const { getIcon } = useFunctionIcon();
```

#### Turnouts Module

**Import:** `@repo/modules/turnouts`

Functions for turnout (switch) management and control.

**Exports:**
- `useTurnouts` - Turnout management composable
- Turnout types

**Usage:**
```typescript
import { useTurnouts } from '@repo/modules/turnouts';

const { turnouts, throwTurnout, closeTurnout } = useTurnouts();
```

#### Effects Module

**Import:** `@repo/modules/effects`

Special effects and automation utilities.

**Usage:**
```typescript
import { /* effects */ } from '@repo/modules/effects';
```

#### Types

**Import:** `@repo/modules/types`

Shared TypeScript type definitions.

**Usage:**
```typescript
import type { Loco, Turnout, Layout } from '@repo/modules/types';
```

## Applications

### Server

**Name:** `deja-serverts`  
**Location:** `apps/server/`

Node.js WebSocket server that processes DCC commands and communicates with DCC-EX command stations via serial connection.

#### Features

- WebSocket server for real-time communication
- Serial communication with DCC-EX hardware
- MQTT integration (optional)
- Firebase Cloud integration (optional)

#### Environment Variables

```bash
ENABLE_MQTT=true|false      # Enable MQTT broker connection
ENABLE_WS=true|false        # Enable WebSocket server (default: true)
ENABLE_DEJACLOUD=true|false # Enable Firebase Cloud integration
```

#### Usage

```bash
# Development
npm run dev

# Production
npm start

# With MQTT
npm run mosquitto
```

#### API Endpoints

The server communicates via WebSocket connections and processes DCC commands in real-time.

### Throttle

**Name:** `deja-throttle`  
**Location:** `apps/throttle/`

Vue.js web application providing a modern interface for controlling DCC-EX layouts.

#### Features

- Locomotive control and management
- Turnout control
- Layout selection and configuration
- Real-time updates via WebSocket
- Progressive Web App (PWA) support
- Mobile-responsive design

#### Usage

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Types and Interfaces

### Core Types

#### Loco (Locomotive)

```typescript
interface Loco {
  address: number;
  name: string;
  meta: {
    color?: string;
    [key: string]: any;
  };
  consist: Loco[];
  functions?: LocoFunction[];
}
```

#### LocoFunction

```typescript
interface LocoFunction {
  id: number;
  name: string;
  icon?: string;
  state: boolean;
  type: 'momentary' | 'toggle';
}
```

#### Turnout

```typescript
interface Turnout {
  id: number;
  name: string;
  address: number;
  state: 'thrown' | 'closed';
  type: 'servo' | 'solenoid';
}
```

#### Layout

```typescript
interface Layout {
  id: string;
  name: string;
  description?: string;
  turnouts: Turnout[];
  locos: Loco[];
  routes?: Route[];
}
```

#### DccCommand

```typescript
interface DccCommand {
  action: string;
  payload: any;
}
```

## Examples

### Complete Locomotive Control Example

```vue
<template>
  <div class="locomotive-control">
    <h2>{{ loco.name }}</h2>
    
    <!-- Locomotive Avatar -->
    <LocoAvatar 
      :loco="loco"
      :size="120"
      :show-menu="true"
      @select="selectLoco"
      @stop="emergencyStop"
    />
    
    <!-- Speed Control -->
    <v-slider
      v-model="speed"
      :min="0"
      :max="126"
      @update:model-value="setSpeed"
      label="Speed"
    />
    
    <!-- Direction Control -->
    <v-btn-toggle v-model="direction" mandatory>
      <v-btn value="forward">Forward</v-btn>
      <v-btn value="reverse">Reverse</v-btn>
    </v-btn-toggle>
    
    <!-- Function Controls -->
    <div class="functions">
      <v-btn
        v-for="func in loco.functions"
        :key="func.id"
        :color="func.state ? 'primary' : 'default'"
        @click="toggleFunction(func.id)"
      >
        <v-icon>{{ func.icon }}</v-icon>
        {{ func.name }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { LocoAvatar } from '@repo/ui';
import { useDcc } from '@repo/dccex';
import { useLocos } from '@repo/modules/locos';

// Composables
const { setFunction, sendDccCommand } = useDcc();
const { locos } = useLocos();

// State
const speed = ref(0);
const direction = ref('forward');
const loco = ref({
  address: 3,
  name: "Big Boy 4014",
  meta: { color: "blue" },
  consist: [],
  functions: [
    { id: 0, name: "Headlight", icon: "mdi-lightbulb", state: false, type: "toggle" },
    { id: 1, name: "Bell", icon: "mdi-bell", state: false, type: "momentary" },
    { id: 2, name: "Horn", icon: "mdi-bugle", state: false, type: "momentary" },
    { id: 3, name: "Coupler", icon: "mdi-link", state: false, type: "momentary" }
  ]
});

// Methods
async function setSpeed(newSpeed) {
  const directionBit = direction.value === 'forward' ? 1 : 0;
  const speedByte = (newSpeed & 0x7F) | (directionBit << 7);
  
  await sendDccCommand({
    action: 'throttle',
    payload: {
      address: loco.value.address,
      speed: speedByte
    }
  });
}

async function toggleFunction(functionId) {
  const func = loco.value.functions.find(f => f.id === functionId);
  if (func) {
    func.state = !func.state;
    await setFunction(loco.value.address, functionId, func.state);
  }
}

function selectLoco(address) {
  console.log('Selected locomotive:', address);
}

async function emergencyStop(locomotive) {
  speed.value = 0;
  await setSpeed(0);
  console.log('Emergency stop for:', locomotive.name);
}

// Watchers
watch(direction, () => {
  setSpeed(speed.value);
});
</script>
```

### Layout Management Example

```vue
<template>
  <div class="layout-manager">
    <SelectLayout @layout-changed="handleLayoutChange" />
    
    <div v-if="currentLayout">
      <h2>{{ currentLayout.name }}</h2>
      
      <!-- Turnout Controls -->
      <div class="turnouts">
        <h3>Turnouts</h3>
        <TurnoutList :turnouts="currentLayout.turnouts" />
      </div>
      
      <!-- Locomotive Roster -->
      <div class="locomotives">
        <h3>Locomotives</h3>
        <div class="loco-grid">
          <LocoAvatar
            v-for="loco in currentLayout.locos"
            :key="loco.address"
            :loco="loco"
            @select="selectLoco"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { SelectLayout, TurnoutList, LocoAvatar } from '@repo/ui';
import { useLayout } from '@repo/modules';

const { currentLayout, setLayout } = useLayout();

function handleLayoutChange(layout) {
  setLayout(layout);
  console.log('Layout changed to:', layout.name);
}

function selectLoco(address) {
  // Navigate to locomotive control
  console.log('Selected locomotive:', address);
}
</script>
```

### Authentication Setup Example

```vue
<template>
  <router-view v-if="user" />
  <Login v-else />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Login } from '@repo/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@repo/firebase-config/firebase';

const router = useRouter();
const user = ref(null);

onMounted(() => {
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    if (firebaseUser) {
      router.push('/dashboard');
    }
  });
});
</script>
```

### Server Integration Example

```typescript
// Server-side DCC command processing
import { WebSocketServer } from 'ws';
import { SerialPort } from 'serialport';

class DccServer {
  private wss: WebSocketServer;
  private serial: SerialPort;

  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });
    this.serial = new SerialPort({ 
      path: '/dev/ttyUSB0', 
      baudRate: 115200 
    });
    
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws) => {
      ws.on('message', (data) => {
        const command = JSON.parse(data.toString());
        this.processCommand(command);
      });
    });
  }

  private async processCommand(command: DccCommand) {
    switch (command.action) {
      case 'throttle':
        await this.sendToSerial(`<t ${command.payload.address} ${command.payload.speed} 1>`);
        break;
      case 'function':
        await this.sendToSerial(`<F ${command.payload.address} ${command.payload.func} ${command.payload.state ? 1 : 0}>`);
        break;
      case 'power':
        await this.sendToSerial(`<${command.payload.command}>`);
        break;
    }
  }

  private async sendToSerial(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serial.write(command, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Start server
const server = new DccServer();
```

---

This documentation covers all the major public APIs, components, and functions available in the Deja DCC-EX system. For specific implementation details or advanced usage, refer to the source code in each package directory.