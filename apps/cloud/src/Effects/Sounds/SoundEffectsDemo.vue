<template>
  <div class="sound-effects-demo">
    <div class="demo-header">
      <h2>Sound Effects Demo</h2>
      <p>This page demonstrates the BBC Sound Effects component for your Vercel blob store.</p>
    </div>
    
    <SoundFileList />
    
    <div class="demo-info">
      <h3>Features</h3>
      <ul>
        <li>List sound files from your Vercel blob store</li>
        <li>Upload new audio files</li>
        <li>Play/pause sound effects</li>
        <li>Delete sound files</li>
        <li>Responsive design</li>
      </ul>
      
      <h3>Setup Instructions</h3>
      <ol>
        <li>Create a Vercel blob store named "bbc-sounds"</li>
        <li>Set environment variables in your <code>.env</code> file:</li>
        <ul>
          <li><code>VITE_VERCEL_BLOB_TOKEN</code> - Your Vercel API token</li>
          <li><code>VITE_VERCEL_BLOB_API_URL</code> - Vercel API base URL (optional)</li>
          <li><code>VITE_SOUNDS_API_ENDPOINT</code> - Custom API endpoint (alternative)</li>
        </ul>
        <li>Upload some audio files to test the functionality</li>
      </ol>
      
      <h3>Environment Variables Example</h3>
      <pre><code># .env.local
VITE_VERCEL_BLOB_TOKEN=your_vercel_token_here
VITE_VERCEL_BLOB_API_URL=https://api.vercel.com/v1
# OR use a custom endpoint
# VITE_SOUNDS_API_ENDPOINT=https://your-api.com/sounds</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import SoundFileList from './SoundFileList.vue'
</script>

<style scoped>
.sound-effects-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.demo-header h2 {
  margin: 0 0 16px 0;
  font-size: 32px;
  font-weight: 600;
}

.demo-header p {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
}

.demo-info {
  margin-top: 40px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #007bff;
}

.demo-info h3 {
  margin: 24px 0 16px 0;
  color: #1a1a1a;
  font-size: 20px;
}

.demo-info h3:first-child {
  margin-top: 0;
}

.demo-info ul,
.demo-info ol {
  margin: 0 0 20px 0;
  padding-left: 24px;
}

.demo-info li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.demo-info code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

.demo-info pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.demo-info pre code {
  background: none;
  padding: 0;
  color: inherit;
}

@media (max-width: 768px) {
  .sound-effects-demo {
    padding: 16px;
  }
  
  .demo-header {
    padding: 20px;
  }
  
  .demo-header h2 {
    font-size: 24px;
  }
  
  .demo-header p {
    font-size: 16px;
  }
  
  .demo-info {
    padding: 20px;
  }
}
</style>
