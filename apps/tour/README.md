# 🎪 DEJA Tour - Interactive Railroad Experiences

> **🌟 Bringing Magic to Model Railroad Visitors**

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/WebAudio-FF6B6B?style=for-the-badge&logo=webaudio&logoColor=white" />
</p>

---

## 🎯 What is DEJA Tour?

**DEJA Tour** transforms your model railroad into an interactive experience center! It creates engaging, visitor-friendly interfaces that turn passive observation into active participation. Perfect for exhibitions, museums, open houses, and educational demonstrations. Let your visitors become part of the railroad story! 🚂

### ✨ Key Features

- 🎮 **Interactive Experiences** - Touch-friendly interfaces for all ages
- 🎵 **Audio Integration** - Realistic sound effects and narration
- 🎪 **Guided Tours** - Self-paced or automated experience journeys
- 📱 **QR Code Integration** - Smartphone-activated special effects
- 🎨 **Visual Effects** - Synchronized lighting and display controls
- 🏆 **Gamification** - Scavenger hunts and achievement systems
- 👶 **Kid-Friendly** - Designed for young railroad enthusiasts
- 🌐 **Accessibility** - Screen reader and touch-friendly design

---

## 🏗️ Core Components

### 🎮 Interactive Controls
- **🚂 Train Control** - Simplified locomotive operation for visitors
- **🎵 Sound Triggers** - Play horn, bell, and ambient sounds
- **💡 Effect Controls** - Activate lights, smoke, and special effects
- **📸 Photo Modes** - Trigger scenic lighting for photos

### 🎪 Experience Modules
- **🗺️ Layout Tours** - Guided exploration of layout sections
- **📚 Educational Content** - Learn about railroading and history
- **🎯 Interactive Games** - Railroad-themed challenges and puzzles
- **🏆 Achievement System** - Unlock rewards and collect badges

### 🎵 Audio System
- **🔊 Realistic Sounds** - Authentic train and ambient audio
- **🎙️ Narration** - Professional voice-over for tours
- **🎶 Background Music** - Period-appropriate musical accompaniment
- **🔇 Volume Controls** - Visitor-adjustable audio levels

### 📱 Mobile Integration
- **📲 QR Code Scanner** - Smartphone-triggered experiences
- **📱 Companion App** - Extended content on visitor devices
- **📷 AR Features** - Augmented reality overlays (future)
- **🔗 Social Sharing** - Easy sharing of experiences

---

## 🚀 Getting Started

### 📋 Prerequisites

- 🖥️ **DEJA Server** - Running and connected to DCC-EX CommandStation
- 🔊 **Audio Device** - Speakers or headphones for sound effects
- 📱 **QR Code System** - Optional for mobile integration
- 🎮 **Touch Display** - Recommended for interactive experiences

### ⚡ Quick Setup

1. **🔧 Configure Environment**
   ```bash
   # In apps/tour/.env.local
   VITE_LAYOUT_NAME=your-layout-name
   VITE_WS_PORT=8082
   VITE_ENABLE_AUDIO=true
   VITE_ENABLE_QR=true
   # ... other config
   ```

2. **🚀 Start the Application**
   ```bash
   cd apps/tour
   pnpm install
   pnpm dev
   ```

3. **🌐 Access the Experience**
   - Open http://localhost:5176
   - 🎮 Start creating magical experiences!

---

## 💡 Usage Guide

### 🎪 Setting Up Experiences

#### 🎬 Create a Tour Experience
1. **📋 Define Tour Stops** - Mark key layout features
2. **🎵 Add Audio Content** - Record narration and sound effects
3. **🎮 Set Interactions** - Configure visitor controls
4. **🎯 Test Experience** - Run through visitor journey

#### 🎮 Interactive Controls Setup
```
┌─────────────────┬─────────────────┬─────────────────┐
│   🚂 Train      │   🎵 Sounds     │   💡 Effects    │
│   Controls      │   & Music       │   & Lighting    │
│                 │                 │                 │
│ 🎮 Simple Speed │ 🔊 Horn Button  │ 💡 Station      │
│ 🔄 Direction    │ 🔔 Bell Button  │ 🌫️ Smoke        │
│ 🛑 Emergency    │ 🎶 Ambient      │ 🚨 Crossing     │
└─────────────────┼─────────────────┼─────────────────┤
│                    Tour Control                     │
│     ⏮️ Previous  |  ⏸️ Pause  |  ⏭️ Next          │
│            🔄 Restart Tour                         │
└─────────────────────────────────────────────────────┘
```

### 🎯 Visitor Experience Flow

#### 🏠 Welcome Screen
- **👋 Greeting Message** - Welcome visitors to your layout
- **🎮 Experience Options** - Choose guided tour or free play
- **📋 Instructions** - Simple, clear operating instructions
- **🎨 Theme Selection** - Kid-friendly or educational modes

#### 🗺️ Tour Navigation
- **📍 Location Markers** - Visual indicators of tour stops
- **🎵 Audio Narration** - Informative commentary
- **🎮 Interactive Elements** - Hands-on control opportunities
- **📸 Photo Opportunities** - Special lighting for pictures

---

## 🎨 Experience Types

### 👶 Kid-Friendly Mode
```
┌─────────────────────────────────────────────────────┐
│  🎪 Welcome to the Magic Railroad! 🚂              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎮 [BIG CHOO-CHOO BUTTON] 🎮                      │
│                                                     │
│  🔊 [HORN] 🔔 [BELL] 💡 [LIGHTS]                   │
│                                                     │
│  🏆 Trains Driven: ⭐⭐⭐ (3)                       │
│  🎵 Sounds Made: ⭐⭐⭐⭐⭐ (15)                    │
│                                                     │
│  👨‍👩‍👧‍👦 Ask a grown-up to help! 👨‍👩‍👧‍👦                │
└─────────────────────────────────────────────────────┘
```

### 🎓 Educational Mode
- **📚 Historical Information** - Learn about railroad history
- **🔧 Technical Details** - Understand how model trains work
- **🏗️ Layout Construction** - See how the layout was built
- **🎯 Quiz Questions** - Test knowledge with interactive questions

### 🎪 Exhibition Mode
- **🎬 Automated Shows** - Scripted train performances
- **🎵 Synchronized Audio** - Music and sound effects
- **💡 Lighting Effects** - Dramatic scene illumination
- **📱 Crowd Interaction** - Multiple visitor participation

---

## 🎵 Audio & Effects System

### 🔊 Sound Categories

| Type | Description | Examples |
|------|-------------|----------|
| 🚂 **Train Sounds** | Locomotive audio | Steam, diesel, horn, bell |
| 🌍 **Ambient** | Environmental audio | Wind, birds, city sounds |
| 🎵 **Music** | Background tracks | Period music, instrumental |
| 🗣️ **Narration** | Voice content | Tour guides, character voices |

### 💡 Visual Effects

```typescript
// Effect Configuration
interface EffectConfig {
  type: 'lighting' | 'smoke' | 'motion'  // 🎨 Effect type
  trigger: 'manual' | 'auto' | 'qr'      // 🎯 Activation method
  duration: number                        // ⏱️ Effect length (ms)
  intensity: number                       // 💪 Effect strength (0-100)
  synchronized: boolean                   // 🎵 Sync with audio
}
```

---

## 📱 QR Code Integration

### 🎯 QR-Activated Features

- **📍 Location-Based Content** - Context-aware information
- **🎮 Special Controls** - Unlock hidden features
- **🏆 Achievement Unlocks** - Collect digital badges
- **📷 Photo Modes** - Trigger scenic lighting setups

### 🔗 QR Code Setup

```bash
# Generate QR codes for different experiences
npm run generate-qr --type=tour-stop --id=station-1
npm run generate-qr --type=effect --id=crossing-lights
npm run generate-qr --type=achievement --id=engineer-badge
```

---

## 🎮 Gamification Features

### 🏆 Achievement System

| Achievement | Description | Reward |
|-------------|-------------|---------|
| 🚂 **First Engineer** | Drive your first train | Engineer Badge |
| 🔔 **Bell Ringer** | Ring the bell 10 times | Sound Master Badge |
| 🎪 **Tour Complete** | Finish the full tour | Explorer Badge |
| 📸 **Photographer** | Take 5 scenic photos | Documentarian Badge |

### 🎯 Interactive Challenges

- **🕐 Speed Challenges** - Navigate courses within time limits
- **🎵 Sound Matching** - Identify different train sounds
- **🗺️ Route Planning** - Plan efficient train routes
- **🔍 Scavenger Hunts** - Find hidden details in the layout

---

## 🛠️ Development

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   🎪 Frontend    │    │   🎵 Audio       │    │   🖥️ DEJA       │
│                 │    │   System        │    │   Server        │
│ Vue 3 + Touch   │◄──►│                 │◄──►│                 │
│ Vuetify UI      │    │ Web Audio API   │    │ Effect Control  │
│ QR Integration  │    │ Sound Library   │    │ Device Commands │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Tech Stack

- **🖼️ Frontend**: Vue 3 with Composition API
- **🎨 UI Framework**: Vuetify 3 optimized for touch
- **📝 Language**: TypeScript for reliability
- **🎵 Audio**: Web Audio API and VueUse Sound
- **📱 QR Codes**: QR scanner integration
- **🎮 Interactions**: Touch-optimized controls

### 🧪 Development Commands

```bash
# Development
pnpm dev              # 🚀 Start development server
pnpm build            # 📦 Build for production
pnpm preview          # 👀 Preview production build

# Content Management
pnpm audio:process    # 🎵 Process audio files
pnpm qr:generate      # 📱 Generate QR codes
pnpm content:validate # 📋 Validate tour content

# Testing
pnpm test             # 🧪 Run tests
pnpm test:touch       # 📱 Touch interaction tests
pnpm test:audio       # 🎵 Audio system tests
```

---

## 🎪 Experience Templates

### 🏛️ Museum Setup
```typescript
const museumExperience = {
  mode: 'educational',
  features: [
    'historical-narration',
    'technical-explanations',
    'interactive-quizzes',
    'photo-opportunities'
  ],
  accessibility: {
    audioDescriptions: true,
    largeButtons: true,
    slowPacing: true
  }
}
```

### 🎠 Family Event
```typescript
const familyExperience = {
  mode: 'entertainment',
  features: [
    'simplified-controls',
    'fun-sound-effects',
    'achievement-system',
    'group-activities'
  ],
  ageGroups: ['kids', 'teens', 'adults']
}
```

### 🏫 School Visit
```typescript
const educationalExperience = {
  mode: 'learning',
  features: [
    'curriculum-aligned',
    'group-challenges',
    'stem-concepts',
    'safety-education'
  ],
  duration: '45-minutes'
}
```

---

## 🗺️ Roadmap

### 🔥 Coming Soon
- 🥽 **AR Integration** - Augmented reality overlays
- 🎮 **Multi-Player Games** - Cooperative railroad challenges
- 🌐 **Multi-Language** - Support for international visitors
- 📊 **Analytics Dashboard** - Visitor engagement metrics

### 💡 Future Enhancements
- 🤖 **AI Tour Guide** - Personalized experience recommendations
- 🎥 **Video Integration** - Historical footage and documentaries
- 🌍 **Virtual Reality** - Immersive railroad experiences
- 🎪 **Special Events** - Holiday and themed experiences

---

## 🎯 Best Practices

### 👥 Visitor Experience
- **👶 Keep It Simple** - Intuitive controls for all ages
- **🔊 Audio Clear** - Ensure good speaker placement
- **📱 Test Everything** - Regular experience validation
- **🛡️ Safety First** - Clear emergency stop procedures

### 🎪 Exhibition Tips
- **📋 Clear Instructions** - Visual and audio guidance
- **👥 Crowd Management** - Handle multiple visitors gracefully
- **🔄 Reset Systems** - Automatic return to welcome screen
- **📊 Monitor Usage** - Track popular features and improvements

---

## 🆘 Troubleshooting

### 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| 🔇 **No Audio** | Check speaker connections and audio permissions |
| 📱 **QR Not Scanning** | Verify camera permissions and lighting |
| 🎮 **Controls Unresponsive** | Check DEJA Server connection |
| 🎪 **Tour Stuck** | Use admin reset or refresh browser |

### 🛠️ Maintenance Tasks

- **🧹 Daily Cleanup** - Reset experiences and check audio
- **📊 Weekly Review** - Analyze visitor interaction data
- **🔄 Content Updates** - Refresh seasonal or special content
- **🔧 Hardware Check** - Verify displays and audio equipment

---

## 📄 License

This project is part of the DEJA suite and is licensed under the MIT License.

---

<p align="center">
  <strong>🎪 Create Magical Railroad Experiences! 🚂</strong><br>
  <em>Built with ❤️ for railroad enthusiasts and their visitors</em>
</p>
