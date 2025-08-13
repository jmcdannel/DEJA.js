<script setup lang="ts">
// No script logic needed for static landing page
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex flex-col">
    <!-- Hero Section -->
    <section class="flex-1 flex items-center justify-center py-12 px-4">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <!-- Welcome Header -->
        <div class="space-y-4">
          <div class="flex justify-center">
            <v-icon size="64" color="primary" icon="mdi-train" />
          </div>
          <h1 class="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to <span class="text-primary">Tamarack Junction</span>
          </h1>
          <p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Experience our interactive model train layout! Control locomotives, trigger effects, and explore the
            scenic areas of our miniature world.
          </p>
        </div>

        <!-- Quick Start Options -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          <QuickStartCard
            icon="mdi-help-circle"
            title="Need Help?"
            description="Get started with a quick guide"
            action="<GuideDialog />"
            variant="outline"
          />

          <QuickStartCard
            icon="mdi-headphones"
            title="Audio Tours"
            description="Listen to guided tours of layout areas"
            action='<Link href="/tours"><Button class="w-full">Start Tours</Button></Link>'
          />

          <QuickStartCard
            icon="mdi-lightbulb"
            title="Control Effects"
            description="Lights, sounds, and animations"
            action='<Link href="/effects"><Button class="w-full">View Effects</Button></Link>'
          />

          <QuickStartCard
            icon="mdi-train"
            title="Drive Trains"
            description="Control locomotive speed and direction"
            action='<Link href="/locomotives"><Button class="w-full">Control Trains</Button></Link>'
          />
        </div>

        <!-- Layout Overview -->
        <div class="mt-12 p-6 bg-muted/50 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
            <v-icon size="24" icon="mdi-map-marker" />
            Layout Areas
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <!-- List of layout areas - clickable links to area details -->
            <router-link to="/area/tamarack-station" class="p-2 bg-background rounded border text-center hover:bg-primary/10 transition-colors cursor-pointer">Tamarack Station</router-link>
            <router-link to="/area/roseberry-yard" class="p-2 bg-background rounded border text-center hover:bg-primary/10 transition-colors cursor-pointer">Roseberry Yard</router-link>
            <router-link to="/area/payette-subdivision" class="p-2 bg-background rounded border text-center hover:bg-primary/10 transition-colors cursor-pointer">Payette Subdivision</router-link>
            <router-link to="/area/deadmans-curve" class="p-2 bg-background rounded border text-center hover:bg-primary/10 transition-colors cursor-pointer">Deadman's Curve</router-link>
            <router-link to="/area/round-valley" class="p-2 bg-background rounded border text-center hover:bg-primary/10 transition-colors cursor-pointer">Round Valley</router-link>
            <router-link to="/area/thunder-city" class="p-2 bg-background rounded border text-center hover:bg-primary/10 transition-colors cursor-pointer">Thunder City</router-link>
            <router-link to="/area/eagle-nest" class="p-2 bg-background rounded border text-center hover:bg-primary/10 transition-colors cursor-pointer">Eagle Nest</router-link>
            <router-link to="/area/tripod-peak" class="p-2 bg-background rounded border text-center hover:bg-primary/10 transition-colors cursor-pointer">Tripod Peak</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>