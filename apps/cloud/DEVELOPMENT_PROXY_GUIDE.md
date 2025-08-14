# Development Proxy Configuration Guide

## 🚂 Overview

This guide explains how to use the development proxy configuration to bypass CORS and HTTPS constraints when developing the BBC Sound Importer locally.

## 🔧 Proxy Configuration

### **Available Proxy Endpoints**

| Proxy Path | Target | Purpose | Use Case |
|------------|--------|---------|----------|
| `/api/bbc` | `https://sound-effects.bbcrewind.co.uk` | BBC API calls | General BBC API requests |
| `/api/bbc-audio` | `https://sound-effects.bbcrewind.co.uk/audio` | Audio file downloads | Download BBC sound files |
| `/api/bbc-search` | `https://sound-effects.bbcrewind.co.uk/search` | Search functionality | Search BBC sound library |
| `/api/local` | `http://localhost:3000` | Local API | Local development server |
| `/api/https-bypass` | `https://httpbin.org` | HTTPS testing | Test HTTPS bypass |
| `/api/mock` | `http://localhost:5000/mock` | Mock API | Development without external APIs |

## 🚀 Getting Started

### **1. Development Mode with Proxy**

```bash
# Start with BBC API proxy
pnpm run dev

# Start with explicit proxy mode
pnpm run dev:proxy

# Start with mock API (no external calls)
pnpm run dev:mock
```

### **2. Environment Configuration**

Copy the appropriate environment file:

```bash
# For BBC API proxy development
cp env.development .env.local

# For mock API development
cp env.mock .env.local
```

## 📡 Using the Proxy

### **BBC API Proxy Example**

Instead of calling the BBC API directly:

```typescript
// ❌ Direct call (will cause CORS issues)
const response = await fetch('https://sound-effects.bbcrewind.co.uk/search?q=train')

// ✅ Use proxy (no CORS issues)
const response = await fetch('/api/bbc/search?q=train')
```

### **Audio Download Proxy Example**

```typescript
// ❌ Direct download (HTTPS constraints)
const audioUrl = 'https://sound-effects.bbcrewind.co.uk/audio/train-whistle.mp3'

// ✅ Use proxy (no HTTPS constraints)
const audioUrl = '/api/bbc-audio/train-whistle.mp3'
```

### **Search Proxy Example**

```typescript
// ❌ Direct search (CORS issues)
const searchUrl = 'https://sound-effects.bbcrewind.co.uk/search?q=whistle'

// ✅ Use proxy (no CORS issues)
const searchUrl = '/api/bbc-search?q=whistle'
```

## 🎭 Mock API Development

### **When to Use Mock API**

- **No Internet Connection**: Develop offline
- **BBC API Unavailable**: Service maintenance
- **Rate Limiting**: Avoid hitting API limits
- **Testing**: Consistent test data

### **Mock API Features**

- **Predefined Sounds**: 5 sample sounds in different categories
- **Realistic Delays**: Simulates network latency
- **Full Metadata**: Complete sound information
- **Import Simulation**: Mock import process

### **Using Mock API**

```typescript
import { mockAPIService } from '@/services/mockApi'

// Search mock sounds
const results = await mockAPIService.searchSounds('train')

// Import mock sound
const importResult = await mockAPIService.importSound(
  'https://mock-bbc.com/train-whistle',
  'train',
  'Custom Train Whistle'
)
```

## 🔍 Proxy Debugging

### **Console Logs**

The proxy configuration includes detailed logging:

```
🚂 Proxying to BBC API: GET /search?q=train
🚂 BBC API Response: 200 /search?q=train
🎵 Proxying BBC Audio: GET /audio/train-whistle.mp3
🔍 Proxying BBC Search: GET /search?q=whistle
```

### **Error Handling**

```typescript
// Proxy errors are logged with emojis
🚂 BBC API Proxy Error: Connection timeout
🎵 BBC Audio Proxy Error: File not found
🔍 BBC Search Proxy Error: Rate limit exceeded
```

### **Health Check**

```typescript
// Check proxy health
const health = await mockAPIService.healthCheck()
console.log('Mock API Status:', health.status)
```

## 🌐 CORS Configuration

### **Development Origins**

The proxy allows these origins:

```typescript
cors: {
  origin: [
    'http://localhost:5000',  // Cloud app
    'http://localhost:3000',  // Local API
    'http://localhost:5173',  // Throttle app
    'http://localhost:5174',  // Cloud app (alt port)
    'http://localhost:5175',  // Monitor app
    'http://localhost:5176'   // Tour app
  ],
  credentials: true
}
```

### **Headers Configuration**

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
}
```

## 🔐 HTTPS Bypass

### **Development HTTPS**

```bash
# Enable HTTPS in development
VITE_DEV_HTTPS=true
VITE_DEV_HTTPS_KEY=/path/to/key.pem
VITE_DEV_HTTPS_CERT=/path/to/cert.pem
```

### **HTTPS Bypass Proxy**

```typescript
// Test HTTPS bypass
const response = await fetch('/api/https-bypass/get')
const data = await response.json()
```

## 📱 Mobile Development

### **External Access**

```bash
# Allow external connections
pnpm run dev  # Uses --host flag
```

### **Network Configuration**

```typescript
server: {
  host: true,  // Allow external connections
  port: 5000
}
```

## 🧪 Testing Different Configurations

### **1. BBC API Proxy**

```bash
# Start with BBC API proxy
pnpm run dev:proxy

# Test BBC search
curl "http://localhost:5000/api/bbc/search?q=train"
```

### **2. Mock API**

```bash
# Start with mock API
pnpm run dev:mock

# Test mock search
curl "http://localhost:5000/api/mock/search?q=train"
```

### **3. Local API**

```bash
# Start with local API proxy
VITE_LOCAL_API_URL=http://localhost:3000 pnpm run dev

# Test local API
curl "http://localhost:5000/api/local/health"
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Proxy Not Working**
   ```bash
   # Check if proxy is enabled
   VITE_USE_PROXY=true
   
   # Check proxy mode
   VITE_PROXY_MODE=bbc
   ```

2. **CORS Still Blocking**
   ```bash
   # Ensure CORS is enabled
   VITE_CORS_ENABLED=true
   
   # Check allowed origins
   VITE_CORS_ORIGINS=http://localhost:5000
   ```

3. **HTTPS Issues**
   ```bash
   # Disable HTTPS in development
   VITE_DEV_HTTPS=false
   
   # Use HTTP bypass proxy
   /api/https-bypass
   ```

### **Debug Commands**

```bash
# Check proxy configuration
grep -r "proxy" vite.dev.config.ts

# Check environment variables
cat .env.local | grep VITE

# Test proxy endpoints
curl -v "http://localhost:5000/api/bbc/search?q=test"
```

## 📚 API Reference

### **Mock API Methods**

```typescript
// Search sounds
await mockAPIService.searchSounds(query: string, category?: string)

// Import sound
await mockAPIService.importSound(url: string, category: string, customName?: string, customTags?: string[])

// Get metadata
await mockAPIService.getSoundMetadata(bbcId: string)

// Download audio
await mockAPIService.downloadAudio(downloadUrl: string)

// Health check
await mockAPIService.healthCheck()

// Add custom sound
mockAPIService.addMockSound(sound: MockBBCSound)
```

### **Proxy Configuration**

```typescript
// BBC API proxy
'/api/bbc': {
  target: 'https://sound-effects.bbcrewind.co.uk',
  changeOrigin: true,
  secure: true
}

// Audio proxy
'/api/bbc-audio': {
  target: 'https://sound-effects.bbcrewind.co.uk',
  changeOrigin: true,
  secure: true
}

// Search proxy
'/api/bbc-search': {
  target: 'https://sound-effects.bbcrewind.co.uk',
  changeOrigin: true,
  secure: true
}
```

## 🎯 Best Practices

### **Development Workflow**

1. **Start with Mock API**: Use `pnpm run dev:mock` for initial development
2. **Test with Proxy**: Switch to `pnpm run dev:proxy` for BBC API testing
3. **Production Build**: Use `pnpm run build` for production deployment

### **Environment Management**

1. **Keep .env.local in .gitignore**: Never commit local environment files
2. **Use env.* files**: Template files for different environments
3. **Validate Configuration**: Check environment variables on startup

### **Proxy Usage**

1. **Use Relative URLs**: Always use proxy paths in development
2. **Handle Errors**: Implement proper error handling for proxy failures
3. **Fallback to Mock**: Use mock API when external APIs fail

---

## 🆘 Support

For proxy configuration issues:

1. **Check Console Logs**: Look for proxy error messages
2. **Verify Environment**: Ensure correct .env.local file
3. **Test Endpoints**: Use curl to test proxy endpoints
4. **Check Network**: Verify network connectivity
5. **Review Configuration**: Check vite.dev.config.ts settings

**Remember**: The proxy is for development only. Production builds should use direct API calls or server-side proxies.
