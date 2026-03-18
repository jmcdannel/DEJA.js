<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import TourLogo from '../components/TourLogo.vue'
import { BackgroundFallingStars } from '@repo/ui'

const layoutId = useStorage('@DEJA/layoutId', '')

const tourCards = [
  {
    title: 'Welcome Tour',
    description: 'Start with an introduction and overview of the layout',
    icon: 'mdi-play-circle',
    class: 'welcome-background',
    color: 'purple-lighten-2',
    to: '/welcome',
    enabled: true,
  },
  {
    title: 'Explore Layout',
    description: 'Browse videos and audio about each layout area. Control effects in the areas you visit.',
    icon: 'mdi-play-circle',
    class: 'explore-background',
    color: 'red',
    to: '/sections',
    enabled: true,
  },
  {
    title: 'Control Effects',
    description: 'Interact with guest-accessible layout effects',
    icon: 'mdi-lightning-bolt',
    class: 'effects-background',
    color: 'blue',
    to: '/effects',
    enabled: true,
  },
  {
    title: 'Drive Trains',
    description: 'Experience driving model trains on the layout',
    icon: 'mdi-train-car',
    color: 'green',
    to: '/throttle',
    enabled: false,
  },
  {
    title: 'Technical Details',
    description: 'Learn about the implementation behind the scenes',
    icon: 'mdi-cog',
    color: 'cyan',
    to: '/media?filter=technical',
    enabled: true,
  }
]

const enabledTourCards = [
  ...tourCards.filter(card => card.enabled)
]

const quickStartSteps = [
  { title: 'Watch Welcome', subtitle: 'Start here' },
  { title: 'Explore Areas', subtitle: 'Browse content' },
  { title: 'Try Effects', subtitle: 'Interactive fun' },
  { title: 'Learn More', subtitle: 'Technical deep dive' }
]
</script>

<template>
  <div>
    <v-row justify="center" class="mb-8">
      <v-col cols="12" md="8" class="text-center">
        <v-card outlined class="pa-4 bg-transparent border-0">
          <v-card-title class="text-transparent t text-xl mb-4  bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600">
              Welcome to <br>
              <span class="text-5xl font-bold uppercase bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">Tamarack</span>
              <br>
              <span class="text-6xl font-light uppercase bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-400">Junction</span>           
          </v-card-title>
          <v-card-text>
              <img src="/TamarackJunctionLogo.png" alt="Tamarack Logo" />

              <h2 class="text-h6 text-medium-emphasis my-6">Featuring:</h2>
              <v-carousel height="250" :show-arrows="false" cycle>
                <v-carousel-item src="/tamarack-logo.png" alt="Tamarack Logo" cover></v-carousel-item>
                <v-carousel-item src="/DejaJsLogo.png" alt="DEJA.js Logo" cover></v-carousel-item>
                <v-carousel-item src="/tc-casino.png" alt="Thunder City Logo" cover></v-carousel-item>
                <v-carousel-item src="/oa-trestle.png" alt="Oregon Trestle Logo" cover></v-carousel-item>
              </v-carousel>
              <!-- <img src="/oa-trestle.jpeg" /> -->
              <!-- v-carousel -->
              <!-- DEJA.js -->
              <!-- Thunder City -->
              <!-- Payette Canyon -->
          </v-card-text>
        </v-card>
        <p class="text-h6 text-medium-emphasis my-6">
          Explore our interactive model train layout, control guest-accessible effects, 
          and learn about the technical implementation behind each area.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" lg="3" v-for="card in enabledTourCards" :key="card.title">
        <v-card 
          :color="card.color" 
          class="tour-card" 
          :class="card.class ? card.class : ''"
          elevation="4"
          :to="card.to"
          hover
          variant="outlined"
        >
          <BackgroundFallingStars v-if="card.title === 'Technical Details'" />
          <v-card-text class="text-center pa-6 relative z-10">
            <v-icon :icon="card.icon" size="64" class="mb-4"></v-icon>
            <h3 class="text-h5 mb-2">{{ card.title }}</h3>
            <p class="text-body-1">{{ card.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12" md="8">
        <v-card elevation="2" variant="tonal" :color="layoutId ? 'success' : 'warning'">
          <v-card-title class="text-h5">Layout Status</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon 
                    :icon="layoutId ? 'mdi-check-circle' : 'mdi-alert-circle'" 
                    :color="layoutId ? 'success' : 'warning'"
                  ></v-icon>
                </template>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ layoutId ? 'Connected to Layout: ' + layoutId : 'Not Connected to Layout' }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.tour-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.tour-card:hover {
  transform: translateY(-4px);
}

.welcome-background {
  --s: 100px; /* control the size*/
  --c1: #1d1d1d;
  --c2: #7112af;
  --c3: #050505;
  
  background:
    repeating-conic-gradient(from 30deg,#0000 0 120deg,var(--c3) 0 50%) 
     calc(var(--s)/2) calc(var(--s)*tan(30deg)/2),
    repeating-conic-gradient(from 30deg,var(--c1) 0 60deg,var(--c2) 0 120deg,var(--c3) 0 50%);
  background-size: var(--s) calc(var(--s)*tan(30deg));
}
.welcome-background .v-card-text {
  background: rgba(0,0,0,.7) !important;
}
  
.explore-background {
  --s: 20px; /* control the size*/
  --c1: #fc0303;
  --c2: #000000;
  
  --_s: calc(2*var(--s)) calc(2*var(--s));
  --_g: var(--_s) conic-gradient(at 40% 40%,#0000 75%,var(--c1) 0);
  --_p: var(--_s) conic-gradient(at 20% 20%,#0000 75%,var(--c2) 0);
  background:
    calc( .9*var(--s)) calc( .9*var(--s))/var(--_p),
    calc(-.1*var(--s)) calc(-.1*var(--s))/var(--_p),
    calc( .7*var(--s)) calc( .7*var(--s))/var(--_g),
    calc(-.3*var(--s)) calc(-.3*var(--s))/var(--_g),
    conic-gradient(from 90deg at 20% 20%,var(--c2) 25%,var(--c1) 0) 
     0 0/var(--s) var(--s);
}
.explore-background .v-card-text {
  background: rgba(0,0,0,.8) !important;
}

/* .effects-background {
  background-color: #02020c;
  opacity: 1;
  background-image: radial-gradient(#4b96bc 0.8px, #02020c 0.8px);
  background-size: 16px 16px;
}
.effects-background .v-card-text {
  background: rgba(0,0,0,.6) !important;
} */

.effects-background {
  background-color: #022733;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%230D3E44' stroke-width='3.5'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%230E4B55'%3E%3Ccircle cx='769' cy='229' r='7'/%3E%3Ccircle cx='539' cy='269' r='7'/%3E%3Ccircle cx='603' cy='493' r='7'/%3E%3Ccircle cx='731' cy='737' r='7'/%3E%3Ccircle cx='520' cy='660' r='7'/%3E%3Ccircle cx='309' cy='538' r='7'/%3E%3Ccircle cx='295' cy='764' r='7'/%3E%3Ccircle cx='40' cy='599' r='7'/%3E%3Ccircle cx='102' cy='382' r='7'/%3E%3Ccircle cx='127' cy='80' r='7'/%3E%3Ccircle cx='370' cy='105' r='7'/%3E%3Ccircle cx='578' cy='42' r='7'/%3E%3Ccircle cx='237' cy='261' r='7'/%3E%3Ccircle cx='390' cy='382' r='7'/%3E%3C/g%3E%3C/svg%3E");
}

</style>
