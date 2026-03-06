<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showErrorDetails = ref(false)
const currentPath = ref('')
const timestamp = ref('')
const userAgent = ref('')

onMounted(() => {
  currentPath.value = route.fullPath
  timestamp.value = new Date().toLocaleString()
  userAgent.value = navigator.userAgent
  
  // Add some fun console messages
  console.log('🚂 Choo choo! Looks like we hit a 404!')
  console.log('💡 Pro tip: Check your track switches and ensure proper routing!')
  console.log('☕ Time for a coffee break while we figure this out!')
})
</script>

<template>
  <div class="not-found-page">
    <div class="text-center py-16">
      <!-- Train Icon -->
      <div class="train-icon mb-6">
        <v-icon size="120" color="error" class="train-crash">
          🚂💥
        </v-icon>
      </div>
      
      <!-- 404 Title -->
      <h1 class="text-h1 mb-4 text-error">
        4🚂4 - Track Not Found!
      </h1>
      
      <!-- Funny Subtitle -->
      <h2 class="text-h4 mb-6 text-grey-darken-1">
        Looks like this train has derailed from the schedule!
      </h2>
      
      <!-- Funny Message -->
      <div class="funny-message mb-8">
        <p class="text-h6 mb-4">
          🚨 <strong>Emergency Brake Applied!</strong> 🚨
        </p>
        <p class="text-body-1 mb-3">
          This page seems to have taken an unexpected detour to the 
          <v-chip color="warning" size="small" class="mx-1">scrap yard</v-chip>.
        </p>
        <p class="text-body-1 mb-3">
          Maybe it's on a coffee break? ☕ After all, even trains need their 
          <v-chip color="brown" size="small" class="mx-1">steam</v-chip>!
        </p>
        <p class="text-body-1">
          Or perhaps it's just <v-chip color="info" size="small" class="mx-1">conducting</v-chip> 
          some maintenance in the roundhouse?
        </p>
      </div>
      
      <!-- Navigation Options -->
      <div class="navigation-options mb-8">
        <h3 class="text-h5 mb-4">🚂 Get Back on Track:</h3>
        <div class="d-flex flex-wrap justify-center gap-3">
          <v-btn
            to="/"
            color="primary"
            size="large"
            prepend-icon="mdi-home"
          >
            Back to the Roundhouse
          </v-btn>
          
          <v-btn
            to="/effects"
            color="success"
            size="large"
            prepend-icon="mdi-rocket-launch"
          >
            Effects Depot
          </v-btn>
          
          <v-btn
            to="/layout"
            color="info"
            size="large"
            prepend-icon="mdi-map"
          >
            Layout Yard
          </v-btn>
          
          <v-btn
            to="/locos"
            color="warning"
            size="large"
            prepend-icon="mdi-train"
          >
            Locomotive Shed
          </v-btn>
        </div>
      </div>
      
      <!-- Funny Train Facts -->
      <div class="train-facts mb-8">
        <v-card variant="outlined" class="pa-4">
          <h4 class="text-h6 mb-3">🚂 Fun Train Facts While You Wait:</h4>
          <div class="text-body-2">
            <p class="mb-2">
              • The first steam locomotive was built in 1804 by Richard Trevithick
            </p>
            <p class="mb-2">
              • The longest train ever was 4.6 miles long (7.3 km) with 682 cars
            </p>
            <p class="mb-2">
              • The fastest steam locomotive reached 126 mph (203 km/h) in 1938
            </p>
            <p class="mb-0">
              • Coffee was essential for railroad workers - hence "coffee break"!
            </p>
          </div>
        </v-card>
      </div>
      
      <!-- Error Details (for developers) -->
      <div v-if="showErrorDetails" class="error-details">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              🔧 Technical Details (For Engineers)
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="text-left">
                <p><strong>Requested URL:</strong> {{ currentPath }}</p>
                <p><strong>Timestamp:</strong> {{ timestamp }}</p>
                <p><strong>User Agent:</strong> {{ userAgent }}</p>
                <p><strong>Error Code:</strong> 404 - Not Found</p>
                <p><strong>Suggested Action:</strong> Check the track switch and ensure proper routing!</p>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      
      <!-- Toggle Error Details -->
      <v-btn
        variant="text"
        size="small"
        @click="showErrorDetails = !showErrorDetails"
        class="mt-4"
      >
        {{ showErrorDetails ? 'Hide' : 'Show' }} Technical Details
      </v-btn>
      
      <!-- Footer Message -->
      <div class="footer-message mt-8">
        <p class="text-caption text-grey">
          🚂 Remember: Every wrong turn is just a scenic route in disguise! 🚂
        </p>
        <p class="text-caption text-grey">
          DEJA.js - Where Model Railroading Meets Modern Technology
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  padding: 20px;
}

.train-crash {
  animation: derail 2s ease-in-out infinite;
}

@keyframes derail {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-10px) rotate(-5deg); }
  75% { transform: translateX(10px) rotate(5deg); }
}

.funny-message {
  max-width: 600px;
  margin: 0 auto;
}

.navigation-options {
  max-width: 800px;
  margin: 0 auto;
}

.train-facts {
  max-width: 500px;
  margin: 0 auto;
}

.error-details {
  max-width: 600px;
  margin: 0 auto;
}

.footer-message {
  max-width: 400px;
  margin: 0 auto;
}

/* Responsive design */
@media (max-width: 768px) {
  .text-h1 {
    font-size: 3rem !important;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .d-flex.flex-wrap {
    flex-direction: column;
    align-items: center;
  }
  
  .d-flex.flex-wrap .v-btn {
    width: 100%;
    max-width: 300px;
  }
}

/* Hover effects */
.v-btn:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}
</style>
