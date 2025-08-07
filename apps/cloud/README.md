# ☁️ DEJA Cloud - Layout Management & Control Hub

> **🌟 Your Command Center for Modern Model Railroad Operations**

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

---

## 🎯 What is DEJA Cloud?

**DEJA Cloud** is the central management hub for your model railroad layout. It provides a web-based interface for managing devices, coordinating multiple operators, monitoring system status, and maintaining your layout configuration. Think of it as the "mission control" for your railroad empire! 🚂

### ✨ Key Features

- 🏗️ **Layout Management** - Visual layout builder and device placement
- 👥 **Multi-User Coordination** - Manage multiple operators and permissions
- 📊 **Device Monitoring** - Real-time status of locomotives, turnouts, and sensors
- 🎮 **Remote Control** - Control trains and accessories from anywhere
- 🔥 **Real-Time Sync** - Instant updates across all connected devices
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🌙 **Dark/Light Themes** - Choose your preferred interface style
- 🔐 **Secure Authentication** - Firebase-powered user management

---

## 🏗️ Core Components

### 🗺️ Layout Designer
- **📐 Visual Builder** - Drag-and-drop layout creation
- **🔧 Device Configuration** - Setup locomotives, turnouts, sensors
- **📍 Position Management** - Precise device placement and routing
- **💾 Cloud Storage** - Automatic backup of layout configurations

### 👥 User Management
- **🔑 Authentication** - Secure login with Firebase Auth
- **👤 User Profiles** - Personal settings and preferences
- **🎭 Role Management** - Admin, operator, and viewer roles
- **📞 Session Coordination** - Manage who controls what devices

### 📊 Device Dashboard
- **🚂 Locomotive Status** - Speed, direction, location tracking
- **🔀 Turnout Control** - Remote switching with visual feedback
- **💡 Output Management** - Control lights, sounds, and effects
- **📡 Sensor Monitoring** - Real-time occupancy and detection

### 🎮 Control Interface
- **🎛️ Throttle Controls** - Speed and direction adjustment
- **🔘 Function Buttons** - Lights, horn, bell, and custom functions
- **🚨 Emergency Stop** - Instant power cutoff for safety
- **📋 Consist Management** - Multi-unit locomotive coordination

---

## 🚀 Getting Started

### 📋 Prerequisites

- 🔥 **Firebase Project** - For authentication and data storage
- 🖥️ **DEJA Server** - Running and connected to DCC-EX CommandStation
- 🌐 **Modern Browser** - Chrome, Firefox, Safari, or Edge

### ⚡ Quick Setup

1. **🔧 Configure Environment**
   ```bash
   # In apps/cloud/.env.local
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   # ... other Firebase config
   ```

2. **🚀 Start the Application**
   ```bash
   cd apps/cloud
   pnpm install
   pnpm dev
   ```

3. **🌐 Access the Interface**
   - Open http://localhost:5174
   - 🔑 Sign in with your Firebase account
   - 🎯 Start managing your layout!

---

## 💡 Usage Guide

### 🏠 First-Time Setup

1. **📝 Create Account**
   - 🔑 Sign up with email or Google account
   - ✅ Verify your email address
   - 🎭 Set up your user profile

2. **🗺️ Configure Layout**
   - 📍 Select or create a layout configuration
   - 🔧 Add your locomotives and devices
   - 🎨 Customize the visual appearance

3. **🔗 Connect to Server**
   - 📡 Enter your DEJA Server connection details
   - ✅ Test the connection
   - 🚀 Start controlling your railroad!

### 🎮 Daily Operations

#### 🚂 Train Control
- **🎛️ Speed Control** - Use the throttle slider or buttons
- **🔄 Direction** - Forward/reverse toggle
- **💡 Functions** - Control lights, sounds, and special features
- **🛑 Emergency Stop** - Red button for immediate stopping

#### 🔀 Layout Management
- **📊 Device Status** - Monitor all connected devices
- **🔧 Configuration** - Adjust settings and parameters
- **📈 Performance** - View system metrics and logs
- **👥 User Activity** - See who's online and what they're controlling

---

## 🎨 Interface Overview

### 🏠 Dashboard View
```
┌─────────────────┬─────────────────┬─────────────────┐
│  🚂 Active      │  🔀 Turnouts    │  💡 Outputs     │
│  Locomotives    │  Status Grid    │  Control Panel  │
│                 │                 │                 │
│  • Engine 123   │  T1: ⬅️ Closed   │  💡 Station Lights │
│  • Freight 456  │  T2: ➡️ Thrown   │  🎵 Bell Tower    │
│  • Passenger 78 │  T3: ⬅️ Closed   │  💨 Smoke Unit    │
└─────────────────┼─────────────────┼─────────────────┤
│                 Main Control Area                   │
│            🎮 Active Throttle Controls              │
│         📊 Real-time System Status                 │
└─────────────────────────────────────────────────────┘
```

### 🗺️ Layout View
- **📐 Interactive Map** - Visual representation of your layout
- **📍 Device Markers** - See all devices positioned on the layout
- **🎯 Click-to-Control** - Direct interaction with layout elements
- **🔍 Zoom & Pan** - Navigate large layouts easily

---

## 🔧 Configuration

### ⚙️ Application Settings

```typescript
// Layout Configuration
interface LayoutConfig {
  id: string              // 🆔 Unique layout identifier
  name: string            // 📝 Display name
  devices: Device[]       // 🔧 Connected devices
  operators: User[]       // 👥 Authorized users
  theme: 'light' | 'dark' // 🎨 Interface theme
}
```

### 🔥 Firebase Integration

```typescript
// Firebase Configuration
interface FirebaseConfig {
  apiKey: string          // 🔑 Firebase API key
  authDomain: string      // 🌐 Authentication domain
  projectId: string       // 📁 Project identifier
  storageBucket: string   // 💾 Storage bucket
  messagingSenderId: string // 📧 Messaging sender
  appId: string          // 📱 Application ID
}
```

---

## 🌟 Advanced Features

### 🤖 Automation
- **📅 Scheduled Operations** - Time-based train movements
- **🔄 Route Management** - Predefined path sequences
- **⚡ Event Triggers** - Sensor-based automation
- **🛡️ Safety Protocols** - Collision prevention systems

### 📊 Analytics
- **📈 Usage Statistics** - Track layout activity
- **⏱️ Performance Metrics** - Monitor system efficiency
- **📋 Operation Logs** - Detailed activity history
- **💡 Optimization Tips** - Suggestions for improvement

### 🎮 Multi-User Features
- **👥 Concurrent Control** - Multiple operators simultaneously
- **🎭 Permission Levels** - Fine-grained access control
- **💬 Communication** - Built-in chat and messaging
- **📱 Mobile Support** - Full functionality on phones and tablets

---

## 🛠️ Development

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   🖥️ Frontend    │    │   🔥 Firebase    │    │   🖥️ DEJA       │
│                 │    │                 │    │   Server        │
│ Vue 3 + Vuetify │◄──►│ Auth + Database │◄──►│                 │
│ TypeScript      │    │ Real-time DB    │    │ WebSocket API   │
│ Responsive UI   │    │ Cloud Functions │    │ Serial Comm     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Tech Stack

- **🖼️ Frontend**: Vue 3 with Composition API
- **🎨 UI Framework**: Vuetify 3 with Material Design
- **📝 Language**: TypeScript for type safety
- **🔥 Backend**: Firebase for authentication and data
- **📡 Communication**: Real-time WebSocket connections
- **🏗️ Build Tool**: Vite for fast development and building

### 🧪 Testing & Development

```bash
# Development commands
pnpm dev          # 🚀 Start development server
pnpm build        # 📦 Build for production
pnpm preview      # 👀 Preview production build
pnpm lint         # 🔍 Lint code
pnpm type-check   # 🔬 TypeScript checking
```

---

## 🗺️ Roadmap

### 🔥 Coming Soon
- 📱 **Mobile App** - Native iOS and Android versions
- 🎮 **VR Interface** - Virtual reality layout control
- 🤖 **AI Automation** - Smart train scheduling and routing
- 🌐 **Multi-Layout** - Connect and coordinate multiple layouts

### 💡 Future Enhancements
- 🎥 **Video Integration** - Live camera feeds and recording
- 📊 **Advanced Analytics** - Machine learning insights
- 🎪 **Public Displays** - Visitor-friendly information screens
- 🔊 **Audio Features** - Realistic sound effects and announcements

---

## 🆘 Troubleshooting

### 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| 🚫 **Login Failed** | Check Firebase configuration and internet connection |
| 📡 **No Server Connection** | Verify DEJA Server is running and accessible |
| 🎮 **Throttle Not Responding** | Check WebSocket connection and device permissions |
| 🔄 **Data Not Syncing** | Refresh page or check Firebase status |

### 📞 Getting Help

- 📚 **Documentation** - Check the main DEJA repository
- 💬 **Community** - Join our Discord server
- 🐛 **Bug Reports** - Create an issue on GitHub
- 💡 **Feature Requests** - Submit enhancement ideas

---

## 📄 License

This project is part of the DEJA suite and is licensed under the MIT License.

---

<p align="center">
  <strong>☁️ Welcome to the Future of Model Railroad Control! 🚂</strong><br>
  <em>Built with ❤️ for layout operators everywhere</em>
</p>
