# 📊 DEJA Monitor - System Monitoring & Diagnostics

> **🔍 Your Window into Model Railroad System Performance**

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
</p>

---

## 🎯 What is DEJA Monitor?

**DEJA Monitor** is your comprehensive system monitoring and diagnostics dashboard for DEJA railroad operations. It provides real-time insights into system performance, detailed logging, error tracking, and operational analytics. Think of it as the "control tower" for monitoring your entire railroad ecosystem! 🚂

### ✨ Key Features

- 📈 **Real-Time Metrics** - Live system performance monitoring
- 📋 **Activity Logging** - Detailed operation history and audit trails
- 🚨 **Alert System** - Instant notifications for issues and events
- 🔍 **Error Tracking** - Comprehensive error detection and reporting
- 📊 **Performance Analytics** - Insights into system efficiency
- 🎮 **Device Monitoring** - Track all locomotives, turnouts, and sensors
- 🌐 **WebSocket Monitoring** - Real-time communication diagnostics
- 🔐 **Secure Dashboard** - Firebase authentication for access control

---

## 🏗️ Core Components

### 📊 System Dashboard
- **⚡ Performance Metrics** - CPU, memory, and network usage
- **🔗 Connection Status** - Server, MQTT, and device connectivity
- **📈 Live Charts** - Real-time data visualization
- **🎯 Key Performance Indicators** - Critical system health metrics

### 📋 Activity Logs
- **🚂 Train Operations** - Speed changes, direction, function calls
- **🔀 Layout Events** - Turnout switches, sensor triggers
- **👥 User Actions** - Login events, configuration changes
- **🔧 System Events** - Startup, shutdown, error conditions

### 🚨 Alert Center
- **⚠️ Error Alerts** - System failures and critical issues
- **📢 Status Notifications** - Connection changes and updates
- **🎯 Performance Warnings** - Resource usage thresholds
- **📱 Custom Alerts** - User-defined monitoring rules

### 🔍 Diagnostic Tools
- **🧪 System Health Check** - Automated diagnostics
- **📡 Communication Testing** - WebSocket and MQTT verification
- **🔧 Configuration Validation** - Settings and environment checks
- **📊 Performance Profiling** - Detailed system analysis

---

## 🚀 Getting Started

### 📋 Prerequisites

- 🔥 **Firebase Project** - For authentication and data storage
- 🖥️ **DEJA Server** - Running and connected to DCC-EX CommandStation
- 🌐 **Modern Browser** - Chrome, Firefox, Safari, or Edge
- 📡 **WebSocket Access** - Network access to DEJA Server

### ⚡ Quick Setup

1. **🔧 Configure Environment**
   ```bash
   # In apps/monitor/.env.local
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_WS_PORT=8082
   # ... other config
   ```

2. **🚀 Start the Application**
   ```bash
   cd apps/monitor
   pnpm install
   pnpm dev
   ```

3. **🌐 Access the Dashboard**
   - Open http://localhost:5175
   - 🔑 Sign in with your Firebase account
   - 📊 Start monitoring your system!

---

## 💡 Usage Guide

### 🏠 Dashboard Overview

#### 📊 Main Dashboard
```
┌─────────────────┬─────────────────┬─────────────────┐
│  ⚡ System      │  🔗 Connections │  📈 Performance │
│  Status         │  Status         │  Metrics        │
│                 │                 │                 │
│  🟢 Online       │  🟢 Server       │  📊 CPU: 45%    │
│  🔄 Uptime: 2h   │  🟢 MQTT         │  💾 Memory: 60% │
│  📡 Devices: 8   │  🟢 Firebase     │  🌐 Network: OK │
└─────────────────┼─────────────────┼─────────────────┤
│                     Activity Feed                   │
│  🚂 12:34 - Engine 123 speed set to 50%           │
│  🔀 12:33 - Turnout T1 switched to closed         │
│  👤 12:32 - User john.doe logged in               │
│  ⚠️ 12:30 - Connection timeout recovered          │
└─────────────────────────────────────────────────────┘
```

### 🔍 Monitoring Features

#### 📈 Real-Time Metrics
- **🚂 Train Activity** - Active locomotives and their status
- **🔀 Layout State** - Turnout positions and sensor readings
- **📡 Communication** - WebSocket message rates and latency
- **⚡ System Resources** - CPU, memory, and disk usage

#### 📋 Log Management
- **🕐 Time-Based Filtering** - Filter logs by date and time range
- **🏷️ Category Filtering** - Show only specific types of events
- **🔍 Search Functionality** - Find specific log entries quickly
- **📥 Export Options** - Download logs for external analysis

---

## 🎨 Interface Sections

### 🏠 Dashboard View
- **📊 Quick Stats** - Overview of system health
- **📈 Live Charts** - Real-time performance graphs
- **🚨 Recent Alerts** - Latest warnings and errors
- **🎮 Active Sessions** - Current user activity

### 📋 Logs View
```
┌─────────────────────────────────────────────────────┐
│  📋 Activity Logs                    🔍 [Search...]  │
├─────────────────────────────────────────────────────┤
│  Time     │ Category │ Event                        │
├─────────────────────────────────────────────────────┤
│  12:34:56 │ 🚂 Train  │ Engine 123 speed → 75%     │
│  12:34:45 │ 🔀 Layout │ Turnout T2 → thrown        │
│  12:34:32 │ 👤 User   │ alice.smith logged in       │
│  12:34:18 │ ⚠️ Error  │ Sensor S3 timeout          │
│  12:34:05 │ 🔗 Conn   │ MQTT connection restored   │
└─────────────────────────────────────────────────────┘
```

### ⚙️ Settings View
- **🎨 Theme Selection** - Dark/light mode preferences
- **🔔 Alert Preferences** - Configure notification settings
- **📊 Dashboard Layout** - Customize widget arrangement
- **🔧 Monitoring Options** - Enable/disable specific monitors

---

## 🔧 Configuration

### ⚙️ Monitoring Settings

```typescript
// Monitoring Configuration
interface MonitorConfig {
  refreshInterval: number     // 🔄 Data refresh rate (ms)
  logRetention: number       // 📅 Log retention period (days)
  alertThresholds: {         // 🚨 Alert trigger levels
    cpu: number              // ⚡ CPU usage threshold
    memory: number           // 💾 Memory usage threshold
    latency: number          // 📡 Network latency threshold
  }
  enabledMonitors: string[]  // 🎯 Active monitoring modules
}
```

### 📊 Analytics Configuration

```typescript
// Analytics Settings
interface AnalyticsConfig {
  trackUserActions: boolean   // 👥 Track user interactions
  trackPerformance: boolean   // 📈 Monitor performance metrics
  trackErrors: boolean        // 🚨 Log error events
  retentionPeriod: number     // 📅 Data retention (days)
  exportFormats: string[]     // 📄 Available export formats
}
```

---

## 🌟 Advanced Features

### 📊 Custom Dashboards
- **🎨 Widget Customization** - Drag-and-drop dashboard builder
- **📈 Custom Charts** - Create personalized data visualizations
- **🎯 KPI Tracking** - Define and monitor key performance indicators
- **👥 Role-Based Views** - Different dashboards for different users

### 🚨 Advanced Alerting
- **🔔 Multi-Channel Alerts** - Email, SMS, and in-app notifications
- **📋 Alert Rules** - Custom conditions and trigger logic
- **⏰ Scheduled Reports** - Automated performance summaries
- **🎯 Escalation Policies** - Progressive alert escalation

### 📊 Data Analytics
- **📈 Trend Analysis** - Historical performance patterns
- **🔍 Anomaly Detection** - Identify unusual system behavior
- **📋 Report Generation** - Automated and custom reports
- **📤 Data Export** - CSV, JSON, and API integration

---

## 🛠️ Development

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📊 Dashboard   │    │   🔥 Firebase    │    │   🖥️ DEJA       │
│                 │    │                 │    │   Server        │
│ Vue 3 + Charts  │◄──►│ Auth + Logs     │◄──►│                 │
│ Real-time UI    │    │ Analytics DB    │    │ WebSocket Logs  │
│ Vuetify Design  │    │ User Prefs      │    │ System Metrics  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Tech Stack

- **🖼️ Frontend**: Vue 3 with Composition API
- **🎨 UI Framework**: Vuetify 3 with Material Design
- **📊 Charts**: Chart.js or D3.js for data visualization
- **📝 Language**: TypeScript for type safety
- **🔥 Backend**: Firebase for authentication and logging
- **📡 Real-time**: WebSocket for live data streaming

### 🧪 Development Commands

```bash
# Development
pnpm dev          # 🚀 Start development server
pnpm build        # 📦 Build for production
pnpm preview      # 👀 Preview production build

# Testing & Quality
pnpm lint         # 🔍 Lint code
pnpm type-check   # 🔬 TypeScript checking
pnpm test         # 🧪 Run unit tests

# Monitoring Tools
pnpm monitor:logs # 📋 Stream live logs
pnpm monitor:perf # 📊 Performance monitoring
```

---

## 📋 Monitoring Checklist

### 🔍 Daily Monitoring
- [ ] 📊 **System Performance** - Check CPU, memory, disk usage
- [ ] 🔗 **Connection Health** - Verify all services are connected
- [ ] 🚨 **Error Rates** - Review error counts and trends
- [ ] 👥 **User Activity** - Monitor login patterns and usage
- [ ] 🚂 **Train Operations** - Verify locomotive control functionality

### 📅 Weekly Reviews
- [ ] 📈 **Performance Trends** - Analyze week-over-week metrics
- [ ] 📋 **Log Analysis** - Review significant events and patterns
- [ ] 🔧 **System Maintenance** - Check for needed updates or optimizations
- [ ] 📊 **Capacity Planning** - Monitor resource usage growth
- [ ] 🚨 **Alert Effectiveness** - Review and tune alert thresholds

---

## 🗺️ Roadmap

### 🔥 Coming Soon
- 🤖 **AI-Powered Insights** - Machine learning anomaly detection
- 📱 **Mobile Monitoring** - Native iOS and Android apps
- 🔔 **Advanced Alerting** - Smart notifications and escalation
- 📊 **Predictive Analytics** - Forecast system performance

### 💡 Future Enhancements
- 🌐 **Multi-Layout Monitoring** - Monitor multiple railroad systems
- 📸 **Visual Monitoring** - Integration with camera systems
- 🎯 **Custom Metrics** - User-defined performance indicators
- 🔄 **Automated Remediation** - Self-healing system capabilities

---

## 🆘 Troubleshooting

### 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| 📊 **No Data Showing** | Check WebSocket connection to DEJA Server |
| 🚨 **Missing Alerts** | Verify alert configuration and thresholds |
| 📋 **Logs Not Loading** | Check Firebase connection and permissions |
| 📈 **Charts Not Updating** | Refresh page or check data refresh interval |

### 🛠️ Diagnostic Steps

1. **🔍 Check System Status** - Verify all components are running
2. **📡 Test Connections** - Validate WebSocket and Firebase connectivity
3. **🔧 Review Configuration** - Ensure all settings are correct
4. **📋 Check Logs** - Look for error messages in browser console
5. **🔄 Restart Services** - Try restarting DEJA Server if needed

---

## 📄 License

This project is part of the DEJA suite and is licensed under the MIT License.

---

<p align="center">
  <strong>📊 Monitor Everything, Miss Nothing! 🚂</strong><br>
  <em>Built with ❤️ for system administrators and railroad operators</em>
</p>
