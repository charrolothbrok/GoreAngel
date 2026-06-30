<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{ target?: string }>(),
  { target: '2026-08-22T17:00:00' }
)

const now = ref(Date.now())
let timer: number | undefined

const targetMs = computed(() => new Date(props.target).getTime())

const parts = computed(() => {
  const diff = Math.max(0, targetMs.value - now.value)
  const s = Math.floor(diff / 1000)
  return [
    { label: 'Días', value: Math.floor(s / 86400) },
    { label: 'Horas', value: Math.floor((s % 86400) / 3600) },
    { label: 'Minutos', value: Math.floor((s % 3600) / 60) },
    { label: 'Segundos', value: s % 60 },
  ]
})

const pad = (n: number) => String(n).padStart(2, '0')

onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="countdown">
    <div v-for="(p, i) in parts" :key="p.label" class="unit">
      <span class="unit__num">{{ pad(p.value) }}</span>
      <span class="unit__label">{{ p.label }}</span>
      <span v-if="i < parts.length - 1" class="unit__sep" aria-hidden="true">·</span>
    </div>
  </div>
</template>

<style scoped>
.countdown {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(1rem, 5vw, 3rem);
}

.unit {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 3.5rem;
}

.unit__num {
  font-family: var(--font-display);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  font-size: clamp(2.5rem, 9vw, 4.5rem);
  line-height: 1;
  color: var(--color-ink);
}

.unit__label {
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.68rem;
  color: var(--color-ink-soft);
}

.unit__sep {
  position: absolute;
  right: calc(-1 * clamp(0.5rem, 2.5vw, 1.5rem));
  top: clamp(0.8rem, 3vw, 1.4rem);
  color: var(--color-sand);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}
</style>
