<script setup lang="ts">
import Logo from './Logo.vue'

interface NavLink {
  label: string
  to: string // Internal vue-router paths only. External URLs are not supported.
  icon?: string
}

interface Props {
  links?: NavLink[]
}

const props = withDefaults(defineProps<Props>(), {
  links: () => [{ label: 'Go Home', to: '/' }],
})
</script>

<template>
  <div class="not-found-page">
    <Logo size="md" class="mb-8" />
    <p class="text-h1 font-weight-bold not-found-code mb-4">404</p>
    <p class="text-h5 mb-2 not-found-heading">Page not found.</p>
    <p class="text-body-2 not-found-sub mb-8">
      Looks like this train has left the station.
    </p>
    <div class="d-flex flex-wrap justify-center gap-3">
      <v-btn
        v-for="link in props.links"
        :key="link.to"
        :to="link.to"
        :prepend-icon="link.icon"
        variant="tonal"
        color="primary"
        size="large"
      >
        {{ link.label }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.not-found-code {
  color: rgb(var(--v-theme-primary));
  font-size: 6rem !important;
  line-height: 1;
}

.not-found-heading {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.not-found-sub {
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
