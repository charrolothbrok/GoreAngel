<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { supabase } from '../lib/supabase'

const props = withDefaults(
  defineProps<{ t?: Record<string, string> }>(),
  { t: () => ({}) }
)

interface Photo {
  name: string
  url: string
}

const photos = ref<Photo[]>([])
const loading = ref(true)
const index = ref(0)

const viewport = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const offset = ref(0)

const IMG_RE = /\.(png|jpe?g|webp|avif|gif)$/i

// --- Navegación (con vuelta circular) ---
function ir(i: number) {
  const n = photos.value.length
  if (!n) return
  index.value = ((i % n) + n) % n
}
const prev = () => ir(index.value - 1)
const next = () => ir(index.value + 1)

// Transform 3D por diapositiva según su distancia a la activa (coverflow)
function estilo(i: number) {
  const d = i - index.value
  if (d === 0) {
    return { transform: 'rotateY(0deg) scale(1)', opacity: '1', zIndex: '3' }
  }
  const izquierda = d < 0
  const grado = izquierda ? 42 : -42
  const escala = Math.max(0.72, 0.88 - (Math.abs(d) - 1) * 0.07)
  return {
    transform: `rotateY(${grado}deg) scale(${escala})`,
    transformOrigin: izquierda ? 'right center' : 'left center',
    opacity: Math.abs(d) === 1 ? '0.6' : '0.3',
    zIndex: '1',
  }
}

// --- Centrar la diapositiva activa con transform (no scroll) ---
function recalcular() {
  const tr = track.value
  const vp = viewport.value
  if (!tr || !vp) return
  const slide = tr.children[index.value] as HTMLElement | undefined
  if (!slide) return
  offset.value = vp.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2)
}

watch(index, () => recalcular())

// --- Deslizar con el dedo / mouse ---
let startX = 0
let dragging = false
function onStart(e: PointerEvent) {
  dragging = true
  startX = e.clientX
}
function onEnd(e: PointerEvent) {
  if (!dragging) return
  dragging = false
  const dx = e.clientX - startX
  if (Math.abs(dx) > 40) {
    dx < 0 ? next() : prev()
  }
}

let ro: ResizeObserver | null = null

onMounted(async () => {
  const { data, error } = await supabase.storage.from('galeria').list('', {
    limit: 100,
    sortBy: { column: 'created_at', order: 'asc' },
  })
  if (!error && data) {
    photos.value = data
      .filter((f) => IMG_RE.test(f.name))
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from('galeria').getPublicUrl(f.name).data.publicUrl,
      }))
  }
  loading.value = false

  await nextTick()
  recalcular()
  if (viewport.value) {
    ro = new ResizeObserver(() => recalcular())
    ro.observe(viewport.value)
  }
})

onUnmounted(() => ro?.disconnect())
</script>

<template>
  <!-- Cargando -->
  <div v-if="loading" class="gstate">
    <span class="gspin" aria-hidden="true"></span>
  </div>

  <!-- Vacío -->
  <div v-else-if="!photos.length" class="gstate gempty">
    <p class="eyebrow">{{ props.t.gallery_empty_eyebrow || 'Galería' }}</p>
    <p class="gempty__txt">
      {{ props.t.gallery_empty_text || 'Pronto compartiremos aquí nuestras fotografías favoritas.' }}
    </p>
  </div>

  <!-- Carrusel -->
  <div v-else class="car">
    <div
      ref="viewport"
      class="car__vp"
      @pointerdown="onStart"
      @pointerup="onEnd"
      @pointercancel="dragging = false"
    >
      <div
        ref="track"
        class="car__track"
        :style="`transform: translate3d(${offset}px,0,0)`"
      >
        <figure
          v-for="(photo, i) in photos"
          :key="photo.name"
          class="car__slide"
          :class="{ 'car__slide--on': i === index }"
          :style="estilo(i)"
          @click="ir(i)"
        >
          <img :src="photo.url" :alt="photo.name" loading="lazy" draggable="false" />
        </figure>
      </div>
    </div>

    <div class="car__ctrl">
      <button type="button" class="car__btn" aria-label="Anterior" @click="prev">‹</button>
      <div class="car__dots">
        <button
          v-for="(photo, i) in photos"
          :key="photo.name"
          type="button"
          class="cdot"
          :class="{ 'cdot--on': i === index }"
          :aria-label="`Foto ${i + 1}`"
          @click="ir(i)"
        ></button>
      </div>
      <button type="button" class="car__btn" aria-label="Siguiente" @click="next">›</button>
    </div>
  </div>
</template>

<style scoped>
.car {
  width: 100%;
}

.car__vp {
  overflow: hidden;
  width: 100%;
  touch-action: pan-y;
  cursor: grab;
  /* Profundidad 3D */
  perspective: 1500px;
  padding-block: clamp(1rem, 3vw, 2rem);
}
.car__vp:active {
  cursor: grabbing;
}

.car__track {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: clamp(0.6rem, 1.5vw, 1rem);
  transition: transform 0.6s var(--ease-elegant);
  transform-style: preserve-3d;
  min-height: 1px;
}

.car__slide {
  flex: 0 0 auto;
  width: clamp(280px, 72vw, 560px);
  aspect-ratio: 4 / 5;
  max-height: 72vh;
  margin: 0;
  overflow: hidden;
  border-radius: 2px;
  background: var(--color-sand);
  /* El transform 3D y la opacidad los controla cada slide por JS (coverflow) */
  transition:
    transform 0.6s var(--ease-elegant),
    opacity 0.6s var(--ease-elegant);
  backface-visibility: hidden;
}

.car__slide--on {
  box-shadow: 0 40px 70px -35px rgba(43, 39, 36, 0.5);
}

.car__slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
}

/* Controles */
.car__ctrl {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.car__btn {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid var(--color-hairline);
  background: transparent;
  color: var(--color-ink);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.4s var(--ease-spring), background-color 0.3s, color 0.3s;
}
.car__btn:hover {
  transform: scale(1.08);
  background: var(--color-sage);
  color: #fff;
}
.car__btn:active {
  transform: scale(0.94);
}

.car__dots {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 12rem;
}
.cdot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: var(--color-hairline);
  cursor: pointer;
  transition: transform 0.4s var(--ease-spring), background-color 0.3s;
}
.cdot:hover {
  background: var(--color-sand);
}
.cdot--on {
  background: var(--color-sage);
  transform: scale(1.4);
}

/* Estados */
.gstate {
  display: grid;
  place-items: center;
  gap: 1rem;
  min-height: 260px;
  text-align: center;
}
.gempty__txt {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.25rem;
  color: var(--color-ink-soft);
  max-width: 28rem;
}
.gspin {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 2px solid var(--color-hairline);
  border-top-color: var(--color-sage);
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
