<script setup lang="ts">
import ServerSetupInfo from '../ServerSetupInfo.vue'

interface Props {
  /** Step numbers (1-based) that the parent considers already completed. */
  completed?: number[]
  /** Firebase UID — passed to ServerSetupInfo for a personalized install URL.
   *  `string | null` matches ServerSetupInfo's own prop type exactly. */
  uid?: string | null
  /** Layout ID — passed to ServerSetupInfo for a personalized install URL. */
  layoutId?: string
}

const props = withDefaults(defineProps<Props>(), {
  completed: () => [],
  uid: undefined,
  layoutId: undefined,
})

const isComplete = (step: number) => props.completed.includes(step)

const ctaLinks = [
  { label: 'Docs', url: 'https://docs.dejajs.com' },
  { label: 'DEJA IO', url: 'https://dejajs.com/io' },
  { label: 'Help', url: 'https://dejajs.com/help' },
  { label: 'FAQ', url: 'https://dejajs.com/faq' },
]
</script>

<template>
  <div class="quick-start">
    <p class="quick-start__section-label">Quick Start</p>

    <!-- Step 1: Register -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="
            isComplete(1)
              ? 'quick-start__circle--complete'
              : 'quick-start__circle--active'
          "
        >
          <span>{{ isComplete(1) ? '✓' : '1' }}</span>
        </div>
        <div
          class="quick-start__connector"
          :class="isComplete(1) ? 'quick-start__connector--complete' : ''"
        />
      </div>
      <div
        class="quick-start__content"
        :class="{ 'quick-start__content--done': isComplete(1) }"
      >
        <p class="quick-start__title">Create your account</p>
        <p class="quick-start__desc">Sign up at DEJA Cloud to get your Layout ID</p>
        <v-btn
          v-if="!isComplete(1)"
          href="https://cloud.dejajs.com/sign-up"
          target="_blank"
          rel="noopener"
          color="primary"
          size="small"
          variant="flat"
          append-icon="mdi-open-in-new"
        >
          Register at cloud.dejajs.com
        </v-btn>
        <p v-else class="quick-start__hint">You're already registered</p>
      </div>
    </div>

    <!-- Step 2: Install -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="
            isComplete(2)
              ? 'quick-start__circle--complete'
              : isComplete(1)
                ? 'quick-start__circle--active'
                : 'quick-start__circle--pending'
          "
        >
          <span>{{ isComplete(2) ? '✓' : '2' }}</span>
        </div>
      </div>
      <div
        class="quick-start__content"
        :class="{ 'quick-start__content--done': isComplete(2) }"
      >
        <p class="quick-start__title">Install the server</p>
        <p class="quick-start__desc">Run on Raspberry Pi, Mac, or Linux</p>
        <ServerSetupInfo :uid="uid" :layout-id="layoutId" />
      </div>
    </div>

    <!-- CTA links -->
    <div class="quick-start__links">
      <a
        v-for="link in ctaLinks"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noopener"
        class="quick-start__link"
      >{{ link.label }}</a>
    </div>
  </div>
</template>

<style scoped>
.quick-start {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.quick-start__section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.7);
  margin-bottom: 1.25rem;
}

/* Step row */
.quick-start__step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

/* Left track: circle + connector */
.quick-start__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

/* Step circle */
.quick-start__circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: background-color 300ms ease, border-color 300ms ease, color 300ms ease;
}

.quick-start__circle--active {
  background-color: #38bdf8;
  color: #0f172a;
}

.quick-start__circle--pending {
  border: 2px solid rgba(56, 189, 248, 0.3);
  color: rgba(148, 163, 184, 0.5);
}

.quick-start__circle--complete {
  background-color: #22c55e;
  color: #fff;
}

/* Connector line between circles */
.quick-start__connector {
  width: 1px;
  height: 4rem;
  margin-top: 0.25rem;
  background-color: rgba(56, 189, 248, 0.25);
  transition: background-color 300ms ease;
}

.quick-start__connector--complete {
  background-color: rgba(34, 197, 94, 0.25);
}

/* Step content */
.quick-start__content {
  flex: 1;
  padding-top: 0.25rem;
  padding-bottom: 1.5rem;
  transition: opacity 300ms ease;
}

.quick-start__content--done {
  opacity: 0.55;
}

.quick-start__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #e0f2fe;
  margin-bottom: 0.25rem;
}

.quick-start__content--done .quick-start__title {
  text-decoration: line-through;
  text-decoration-color: rgba(148, 163, 184, 0.4);
}

.quick-start__desc {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.7);
  margin-bottom: 0.625rem;
}

.quick-start__hint {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.5);
  font-style: italic;
}

/* CTA links */
.quick-start__links {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding-top: 0.875rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  margin-top: 0.25rem;
}

.quick-start__link {
  font-size: 0.75rem;
  color: #38bdf8;
  text-decoration: none;
  transition: color 150ms ease;
}

.quick-start__link:hover {
  color: #bae6fd;
  text-decoration: underline;
}
</style>
