<script setup lang="ts">
import { ref, computed } from 'vue'

interface Evento {
  hora: string
  titulo: string
  titulo_en?: string
  descripcion?: string
  descripcion_en?: string
  imagen?: string
}

const props = withDefaults(
  defineProps<{ eventos?: Evento[]; lang?: string }>(),
  { eventos: () => [], lang: 'es' }
)

const pick = (es?: string, en?: string) =>
  (props.lang === 'en' ? en || es : es || en) || ''

const DEFAULT_ES: Evento[] = [
  { hora: '5:00 PM', titulo: 'Ceremonia', descripcion: 'Recepción de invitados' },
  { hora: '6:30 PM', titulo: 'Cóctel', descripcion: 'Bebidas y bocadillos' },
  { hora: '8:00 PM', titulo: 'Cena', descripcion: 'Banquete' },
  { hora: '9:30 PM', titulo: 'Brindis', descripcion: 'Por los novios' },
  { hora: '10:00 PM', titulo: 'Fiesta', descripcion: '¡A bailar!' },
]
const DEFAULT_EN: Evento[] = [
  { hora: '5:00 PM', titulo: 'Ceremony', descripcion: 'Guest reception' },
  { hora: '6:30 PM', titulo: 'Cocktail', descripcion: 'Drinks and appetizers' },
  { hora: '8:00 PM', titulo: 'Dinner', descripcion: 'Banquet' },
  { hora: '9:30 PM', titulo: 'Toast', descripcion: 'To the newlyweds' },
  { hora: '10:00 PM', titulo: 'Party', descripcion: 'Let’s dance!' },
]

const lista = computed(() => {
  const base = props.eventos.length
    ? props.eventos
    : props.lang === 'en'
      ? DEFAULT_EN
      : DEFAULT_ES
  return base.map((ev) => ({
    ...ev,
    titulo: pick(ev.titulo, ev.titulo_en) || ev.titulo,
    descripcion: pick(ev.descripcion, ev.descripcion_en),
  }))
})
const activo = ref(0)
const actual = computed(() => lista.value[activo.value])
</script>

<template>
  <div class="show">
    <!-- Rail de momentos (thumbnails) -->
    <ol class="rail">
      <li v-for="(ev, i) in lista" :key="i">
        <button
          class="thumb"
          :class="{ 'thumb--on': activo === i }"
          @click="activo = i"
        >
          <span class="thumb__hora">{{ ev.hora }}</span>
          <span class="thumb__titulo">{{ ev.titulo }}</span>
        </button>
      </li>
    </ol>

    <!-- Panel grande -->
    <div class="panel">
      <Transition name="swap" mode="out-in">
        <div :key="activo" class="card" :class="{ 'card--foto': actual.imagen }">
          <img v-if="actual.imagen" :src="actual.imagen" alt="" class="card__img" />
          <div class="card__overlay">
            <p class="card__hora">{{ actual.hora }}</p>
            <h3 class="card__titulo">{{ actual.titulo }}</h3>
            <p v-if="actual.descripcion" class="card__desc">{{ actual.descripcion }}</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.show {
  display: grid;
  grid-template-columns: 13rem 1fr;
  gap: clamp(1rem, 3vw, 2rem);
  align-items: stretch;
  max-width: 60rem;
  margin-inline: auto;
}

/* Rail */
.rail {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.thumb {
  width: 100%;
  text-align: left;
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-left: 2px solid transparent;
  padding: 0.9rem 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  transition:
    border-color 0.3s var(--ease-elegant),
    background-color 0.3s var(--ease-elegant),
    transform 0.4s var(--ease-spring);
}
.thumb:hover {
  transform: translateX(2px);
  background: color-mix(in srgb, var(--color-sand) 14%, transparent);
}
.thumb--on {
  border-left-color: var(--color-sage);
  background: color-mix(in srgb, var(--color-sand) 22%, transparent);
}
.thumb__hora {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--color-sage-dark);
}
.thumb__titulo {
  font-size: 0.82rem;
  color: var(--color-ink);
}

/* Panel */
.panel {
  position: relative;
  min-height: clamp(18rem, 45vw, 26rem);
}

.card {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 1px solid var(--color-hairline);
  display: flex;
  align-items: flex-end;
  /* Fondo entintado cuando no hay foto (impeccable) */
  background:
    radial-gradient(120% 90% at 30% 0%, rgba(124, 138, 110, 0.16), transparent 60%),
    radial-gradient(100% 80% at 100% 100%, rgba(217, 199, 179, 0.3), transparent 55%),
    var(--color-bone);
}

.card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__overlay {
  position: relative;
  z-index: 1;
  padding: clamp(1.5rem, 4vw, 2.6rem);
  width: 100%;
}

/* Cuando hay foto, un sombreado más marcado abajo para que el texto resalte */
.card--foto .card__overlay {
  background: linear-gradient(
    to top,
    rgba(43, 39, 36, 0.92) 0%,
    rgba(43, 39, 36, 0.6) 38%,
    rgba(43, 39, 36, 0) 100%
  );
  color: #fff;
  padding-top: clamp(4rem, 12vw, 7rem);
}
.card--foto .card__hora { color: rgba(255, 255, 255, 0.85); }

.card__hora {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  color: var(--color-sage-dark);
}
.card__titulo {
  font-family: var(--font-display);
  font-size: clamp(2rem, 6vw, 3.4rem);
  line-height: 1.05;
  margin-top: 0.2rem;
}
.card__desc {
  margin-top: 0.6rem;
  font-size: 1rem;
  max-width: 28rem;
  opacity: 0.92;
}
.card--foto .card__desc { color: rgba(255, 255, 255, 0.92); }

/* Transición al cambiar de momento */
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.4s var(--ease-elegant), transform 0.5s var(--ease-elegant);
}
.swap-enter-from { opacity: 0; transform: translateY(14px); }
.swap-leave-to { opacity: 0; transform: translateY(-10px); }

/* Móvil: rail arriba en horizontal, panel abajo */
@media (max-width: 640px) {
  .show {
    grid-template-columns: 1fr;
  }
  .rail {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.4rem;
    gap: 0.5rem;
  }
  .thumb {
    flex: 0 0 auto;
    min-width: 8rem;
    border-left: 1px solid var(--color-hairline);
    border-top: 2px solid transparent;
  }
  .thumb--on {
    border-left-color: var(--color-hairline);
    border-top-color: var(--color-sage);
  }
}
</style>
