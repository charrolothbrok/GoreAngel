<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{ novio?: string; novia?: string; fecha?: string }>(),
  { novio: 'Ángel', novia: 'Goretti', fecha: '22 de Agosto, 2026' }
)

const abierto = ref(false)

function abrir() {
  abierto.value = true
  document.body.style.overflow = ''
  // Avisa a la música que arranque (el toque cuenta como gesto del usuario)
  window.dispatchEvent(new CustomEvent('invitacion:abrir'))
}

onMounted(() => {
  // Bloquea el scroll detrás mientras el sobre está cerrado
  document.body.style.overflow = 'hidden'
})
</script>

<template>
  <Transition name="welcome">
    <div v-if="!abierto" class="welcome" role="dialog" aria-label="Bienvenida">
      <div class="welcome__inner">
        <p class="eyebrow">Nos casamos</p>

        <div class="welcome__monogram">
          <span>{{ novio.charAt(0) }}</span>
          <span class="welcome__amp">&amp;</span>
          <span>{{ novia.charAt(0) }}</span>
        </div>

        <h1 class="welcome__names">{{ novio }} &amp; {{ novia }}</h1>
        <p class="welcome__fecha">{{ fecha }}</p>

        <button class="welcome__btn" @click="abrir">
          <span class="welcome__btn-ico" aria-hidden="true">✉</span>
          Abrir invitación
        </button>

        <p class="welcome__hint">Toca para abrir</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.welcome {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 2rem;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(124, 138, 110, 0.12), transparent 60%),
    radial-gradient(100% 70% at 50% 100%, rgba(217, 199, 179, 0.25), transparent 55%),
    var(--color-bone);
  text-align: center;
}

.welcome__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  animation: subir 1s var(--ease-elegant) both;
}

.welcome__monogram {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 9vw, 4rem);
  color: var(--color-sage-dark);
  border: 1px solid var(--color-gold);
  border-radius: 999px;
  width: clamp(5.5rem, 22vw, 8rem);
  height: clamp(5.5rem, 22vw, 8rem);
  justify-content: center;
  margin-block: 0.5rem;
}
.welcome__amp {
  font-style: italic;
  font-size: 0.6em;
  color: var(--color-sand);
}

.welcome__names {
  font-family: var(--font-display);
  font-size: clamp(2rem, 8vw, 3.4rem);
  line-height: 1.05;
}

.welcome__fecha {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1rem, 3.5vw, 1.4rem);
  color: var(--color-ink-soft);
}

.welcome__btn {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 2.2rem;
  border: none;
  border-radius: 999px;
  background: var(--color-ink);
  color: var(--color-bone);
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.82rem;
  cursor: pointer;
  transition: transform 0.4s var(--ease-spring);
}
.welcome__btn:hover {
  transform: scale(1.04);
}
.welcome__btn:active {
  transform: scale(0.97);
}
.welcome__btn-ico {
  font-size: 1.1rem;
}

.welcome__hint {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--color-ink-soft);
  animation: latido 2s var(--ease-elegant) infinite;
}

@keyframes subir {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: none; }
}
@keyframes latido {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Salida del sobre — por capas para que se sienta cinematográfica */
.welcome-leave-active {
  transition:
    opacity 1.1s var(--ease-elegant),
    transform 1.2s var(--ease-elegant),
    filter 1.1s var(--ease-elegant);
}
.welcome-leave-to {
  opacity: 0;
  transform: scale(1.12);
  filter: blur(6px);
}

/* El contenido se eleva y desvanece un poco antes que el fondo */
.welcome-leave-active .welcome__inner {
  transition:
    opacity 0.65s var(--ease-elegant),
    transform 0.9s var(--ease-elegant);
}
.welcome-leave-to .welcome__inner {
  opacity: 0;
  transform: translateY(-44px) scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .welcome__inner { animation: none; }
  .welcome__hint { animation: none; }
}
</style>
