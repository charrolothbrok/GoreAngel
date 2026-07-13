<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{ url?: string; t?: Record<string, string> }>(),
  { t: () => ({}) }
)

const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)

function toggle() {
  const el = audio.value
  if (!el) return
  if (playing.value) {
    el.pause()
    playing.value = false
  } else {
    el.play().then(() => (playing.value = true)).catch(() => {})
  }
}

let armado = false

// En cuanto el usuario hace lo primero que sea (toque, clic, scroll o tecla)
// arranca la música. Reintenta en cada gesto hasta que el navegador la deje.
function armarPrimerToque() {
  if (armado) return
  armado = true
  const eventos = ['touchstart', 'pointerdown', 'click', 'keydown', 'scroll']
  const handler = () => {
    const el = audio.value
    if (!el) return
    el.play()
      .then(() => {
        playing.value = true
        eventos.forEach((e) => window.removeEventListener(e, handler))
      })
      .catch(() => {
        /* aún bloqueado: se reintenta en el siguiente gesto */
      })
  }
  eventos.forEach((e) => window.addEventListener(e, handler, { passive: true }))
}

onMounted(() => {
  if (!props.url) return
  // Cuando se abre el "sobre" de bienvenida, arranca la música (gesto seguro)
  window.addEventListener('invitacion:abrir', () => {
    audio.value?.play().then(() => (playing.value = true)).catch(() => {})
  })
  // Intenta arrancar sola (en compu a veces funciona; en móvil casi nunca)
  audio.value?.play().then(() => (playing.value = true)).catch(() => {})
  // Respaldo SIEMPRE activo: arranca al primer gesto del usuario
  armarPrimerToque()
})
</script>

<template>
  <div v-if="url" class="music">
    <audio ref="audio" :src="url" loop preload="auto"></audio>
    <button
      class="music__btn"
      :class="{ 'music__btn--on': playing }"
      :aria-label="playing ? (props.t.music_pause || 'Pausar música') : (props.t.music_play || 'Reproducir música')"
      @click="toggle"
    >
      <span class="music__bars" aria-hidden="true">
        <i></i><i></i><i></i>
      </span>
    </button>
  </div>
</template>

<style scoped>
.music {
  position: fixed;
  right: clamp(1rem, 4vw, 2rem);
  bottom: clamp(1rem, 4vw, 2rem);
  z-index: 50;
}

.music__btn {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid var(--color-hairline);
  background: color-mix(in srgb, var(--color-bone) 85%, transparent);
  backdrop-filter: blur(8px);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.4s var(--ease-spring), background-color 0.3s;
}

.music__btn:hover {
  transform: scale(1.06);
}

.music__btn:active {
  transform: scale(0.95);
}

.music__btn--on {
  background: var(--color-sage);
  border-color: var(--color-sage);
}

.music__bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 18px;
}

.music__bars i {
  width: 3px;
  height: 6px;
  border-radius: 2px;
  background: var(--color-ink);
  transition: background-color 0.3s;
}

.music__btn--on .music__bars i {
  background: #fff;
  animation: bounce 0.9s var(--ease-elegant) infinite;
}

.music__btn--on .music__bars i:nth-child(2) {
  animation-delay: 0.15s;
}
.music__btn--on .music__bars i:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%, 100% { height: 6px; }
  50% { height: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .music__btn--on .music__bars i {
    animation: none;
    height: 12px;
  }
}
</style>
