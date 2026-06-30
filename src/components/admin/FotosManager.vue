<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

interface Foto {
  name: string
  url: string
}

const fotos = ref<Foto[]>([])
const cargando = ref(true)
const subiendo = ref(false)
const progreso = ref('')
const error = ref('')

const IMG_RE = /\.(png|jpe?g|webp|avif|gif)$/i

async function cargar() {
  cargando.value = true
  const { data } = await supabase.storage.from('galeria').list('', {
    limit: 200,
    sortBy: { column: 'created_at', order: 'asc' },
  })
  fotos.value = (data ?? [])
    .filter((f) => IMG_RE.test(f.name))
    .map((f) => ({
      name: f.name,
      url: supabase.storage.from('galeria').getPublicUrl(f.name).data.publicUrl,
    }))
  cargando.value = false
}

async function subir(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return
  error.value = ''
  subiendo.value = true
  let n = 0
  for (const file of files) {
    n++
    progreso.value = `Subiendo ${n}/${files.length}…`
    const ext = file.name.split('.').pop()
    const nombre = `foto-${Date.now()}-${n}.${ext}`
    const { error: err } = await supabase.storage.from('galeria').upload(nombre, file, {
      upsert: false,
      contentType: file.type,
    })
    if (err) error.value = `Error al subir ${file.name}: ${err.message}`
  }
  subiendo.value = false
  progreso.value = ''
  input.value = ''
  await cargar()
}

async function eliminar(f: Foto) {
  if (!confirm('¿Eliminar esta foto?')) return
  await supabase.storage.from('galeria').remove([f.name])
  await cargar()
}

onMounted(cargar)
</script>

<template>
  <div>
    <label class="uploader">
      <input type="file" accept="image/*" multiple hidden @change="subir" :disabled="subiendo" />
      <span class="uploader__icon">↑</span>
      <span>{{ subiendo ? progreso : 'Seleccionar fotos para subir' }}</span>
      <small>Puedes elegir varias a la vez</small>
    </label>

    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="cargando" class="muted">Cargando…</p>
    <p v-else-if="!fotos.length" class="muted">Aún no hay fotos. Sube las primeras arriba.</p>

    <div v-else class="grid">
      <figure v-for="f in fotos" :key="f.name" class="cell">
        <img :src="f.url" :alt="f.name" loading="lazy" />
        <button class="del" @click="eliminar(f)" aria-label="Eliminar">✕</button>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 2.2rem;
  border: 1px dashed var(--color-hairline);
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  margin-bottom: 2rem;
  transition: border-color 0.3s, background-color 0.3s;
}
.uploader:hover {
  border-color: var(--color-sage);
  background: color-mix(in srgb, var(--color-sand) 12%, transparent);
}
.uploader__icon {
  font-size: 1.6rem;
  color: var(--color-sage);
}
.uploader small {
  font-size: 0.72rem;
  color: var(--color-ink-soft);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.6rem;
}
.cell {
  position: relative;
  margin: 0;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--color-hairline);
}
.cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.del {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: none;
  background: color-mix(in srgb, var(--color-ink) 70%, transparent);
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity 0.25s;
}
.cell:hover .del { opacity: 1; }

.muted { color: var(--color-ink-soft); padding: 1rem 0; }
.error { color: #b3261e; font-size: 0.85rem; margin-bottom: 1rem; }
</style>
