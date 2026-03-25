<script setup lang="ts">
</script>

<template>
  <div class="aurora-bg">
    <div class="aurora-cyan" />
    <div class="aurora-magenta" />
    <div class="aurora-center" />
  </div>
</template>

<style scoped>
.aurora-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, #070215, #0a0a1a, #050112);
  overflow: hidden;
}

.aurora-cyan {
  position: absolute;
  width: 700px;
  height: 700px;
  top: -15%;
  left: -10%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%);
  filter: blur(80px);
  animation: aurora-drift-1 18s ease-in-out infinite;
}

.aurora-magenta {
  position: absolute;
  width: 600px;
  height: 600px;
  top: -10%;
  right: -5%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217, 70, 239, 0.2) 0%, transparent 70%);
  filter: blur(80px);
  animation: aurora-drift-2 22s ease-in-out infinite;
}

.aurora-center {
  position: absolute;
  width: 500px;
  height: 400px;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
  filter: blur(100px);
  animation: aurora-drift-3 25s ease-in-out infinite;
}

@keyframes aurora-drift-1 {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(80px, 60px); }
  50%  { transform: translate(30px, 120px); }
  75%  { transform: translate(-50px, 40px); }
  100% { transform: translate(0, 0); }
}

@keyframes aurora-drift-2 {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(-70px, 80px); }
  50%  { transform: translate(-120px, 30px); }
  75%  { transform: translate(-40px, -50px); }
  100% { transform: translate(0, 0); }
}

@keyframes aurora-drift-3 {
  0%   { transform: translateX(-50%) translate(0, 0); }
  25%  { transform: translateX(-50%) translate(60px, -40px); }
  50%  { transform: translateX(-50%) translate(-50px, 50px); }
  75%  { transform: translateX(-50%) translate(40px, 70px); }
  100% { transform: translateX(-50%) translate(0, 0); }
}
</style>
