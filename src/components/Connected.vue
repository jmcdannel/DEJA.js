<script setup lang="ts"></script>
<template>
  <div class="circle"></div>
  <svg class="circle-svg">
    <filter id="wavy">
      <feTurbulence x="0" y="0" baseFrequency="0.009" numOctaves="5" speed="2">
        <animate attributeName="baseFrequency" dur="60s" values="0.02; 0.005; 0.02" repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" scale="30" />
    </filter>
  </svg>
</template>
<style scoped>
.circle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 55vh;
  height: 55vh;
  filter: url(#wavy) blur(1px);
  pointer-events: none;
  opacity: .25;
}

.circle:before,
.circle:after {
  content: "";
  position: absolute;
  top: calc(55vh / 6);
  left: calc(55vh / 6);
  right: calc(55vh / 6);
  bottom: calc(55vh / 6);
  border-radius: 50%;
  border: calc(55vh / 30) solid #fff;
}
.circle:before {
  box-shadow: 0 0 calc(55vh / 12) #0f0, inset 0 0 calc(55vh / 12) #0f0;
  -webkit-box-reflect: below 10px
    linear-gradient(transparent, transparent, #0002);
  animation: move 5s linear infinite;
}

.circle:after {
  box-shadow: 0 0 calc(calc(55vh / 30)/2) #fff, inset 0 0 calc(55vh / 30) #fff;
}

@keyframes move {
  0% {
    box-shadow: 0 0 calc(55vh / 12) #0f0, inset 0 0 calc(55vh / 12) #0f0;
    filter: hue-rotate(0deg);
  }
  20% {
    box-shadow: 0 0 60px #0f0, inset 0 0 60px #0f0;
  }

  40% {
    box-shadow: 0 0 40px #0f0, inset 0 0 40px #0f0;
  }
  60% {
    box-shadow: 0 0 80px #0f0, inset 0 0 80px #0f0;
  }
  80% {
    box-shadow: 0 0 100px #0f0, inset 0 0 100px #0f0;
  }
  100% {
    box-shadow: 0 0 calc(55vh / 12) #0f0, inset 0 0 calc(55vh / 12) #0f0;
    filter: hue-rotate(360deg);
  }
}

svg.circle-svg {
  width: 0;
  height: 0;
}
</style>