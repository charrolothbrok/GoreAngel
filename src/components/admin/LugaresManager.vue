<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getConfig, saveConfig, uploadImagen } from '../../lib/config'

interface Evento {
  hora: string
  lugar: string
  direccion: string
  mapa: string
  imagen: string
}

function vacio(): Evento {
  return { hora: '', lugar: '', direccion: '', mapa: '', imagen: '' }
}

const ceremonia = ref<Evento>(vacio())
const recepcion = ref<Evento>(vacio())
const cargando = ref(true)
const guardando = ref(false)
const guardado = ref(false)

const bloques = [
  { key: 'ceremonia', titulo: 'Ceremonia', model: ceremonia },
  { key: 'recepcion', titulo: 'Recepción', model: recepcion },
] as const

async function cargar() {
  const v = await getConfig('venues')
  if (v.ceremonia) ceremonia.value = { ...vacio(), ...v.ceremonia }
  if (v.recepcion) recepcion.value = { ...vacio(), ...v.recepcion }
  cargando.value = false
}

async function subirImagen(e: Event, model: typeof ceremonia) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const url = await uploadImagen(file, 'lugares')
  model.value.imagen = url
  input.value = ''
}

async function guardar() {
  guardando.value = true
  guardado.value = false
  await saveConfig('venues', {
    ceremonia: ceremonia.value,
    recepcion: recepcion.value,
  })
  guardando.value = false
  guardado.value = true
  setTimeout(() => (guardado.value = false), 2500)
}

onMounted(cargar)
</script>

<template>
  <div v-if="cargando" class="muted">Cargando…</div>
  <div v-else>
    <div v-for="b in bloques" :key="b.key" class="bloque">
      <h3 class="bloque__title">{{ b.titulo }}</h3>

      <div class="bloque__foto">
        <img v-if="b.model.value.imagen" :src="b.model.value.imagen" alt="" />
        <label class="foto-btn">
          <input type="file" accept="image/*" hidden @change="(e) => subirImagen(e, b.model)" />
          {{ b.model.value.imagen ? 'Cambiar foto' : 'Subir foto del lugar' }}
        </label>
      </div>

      <div class="campos">
        <label class="f">
          <span>Hora</span>
          <input v-model="b.model.value.hora" class="inp" placeholder="5:00 PM" />
        </label>
        <label class="f">
          <span>Lugar</span>
          <input v-model="b.model.value.lugar" class="inp" placeholder="Parroquia / Jardín…" />
        </label>
        <label class="f f--wide">
          <span>Dirección</span>
          <input v-model="b.model.value.direccion" class="inp" placeholder="Calle, ciudad…" />
        </label>
        <label class="f f--wide">
          <span>Link de Google Maps</span>
          <input v-model="b.model.value.mapa" class="inp" placeholder="https://maps.google.com/…" />
        </label>
      </div>
    </div>

    <div class="acciones">
      <button class="btn" @click="guardar" :disabled="guardando">
        {{ guardando ? 'Guardando…' : 'Guardar lugares' }}
      </button>
      <span v-if="guardado" class="ok">✓ Guardado</span>
    </div>
  </div>
</template>

<style scoped>
.bloque {
  border: 1px solid var(--color-hairline);
  padding: 1.4rem;
  margin-bottom: 1.5rem;
}
.bloque__title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  margin-bottom: 1rem;
}
.bloque__foto {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
}
.bloque__foto img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border: 1px solid var(--color-hairline);
}
.foto-btn {
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  padding: 0.5rem 1.1rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s;
}
.foto-btn:hover { border-color: var(--color-sage); color: var(--color-sage); }

.campos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
.f { display: flex; flex-direction: column; gap: 0.35rem; }
.f--wide { grid-column: 1 / -1; }
.f span {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.64rem;
  color: var(--color-ink-soft);
}
.inp {
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  padding: 0.6rem 0.7rem;
  font-family: var(--font-body);
  font-size: 0.92rem;
  color: var(--color-ink);
  outline: none;
}
.inp:focus { border-color: var(--color-sage); }

.acciones { display: flex; align-items: center; gap: 1rem; }
.btn {
  background: var(--color-ink);
  color: var(--color-bone);
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.8rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: transform 0.4s var(--ease-spring);
}
.btn:hover:not(:disabled) { transform: scale(1.03); }
.btn:disabled { opacity: 0.6; }
.ok { color: var(--color-sage); font-size: 0.85rem; }
.muted { color: var(--color-ink-soft); }

@media (max-width: 560px) {
  .campos { grid-template-columns: 1fr; }
}
</style>
