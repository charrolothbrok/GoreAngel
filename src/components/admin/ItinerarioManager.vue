<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getConfig, saveConfig, uploadImagen } from '../../lib/config'

interface Evento {
  hora: string
  titulo: string
  titulo_en: string
  descripcion: string
  descripcion_en: string
  imagen: string
}

const eventos = ref<Evento[]>([])
const cargando = ref(true)
const guardando = ref(false)
const guardado = ref(false)

const SUGERIDO: Evento[] = [
  { hora: '5:00 PM', titulo: 'Ceremonia', titulo_en: 'Ceremony', descripcion: 'Recepción de invitados', descripcion_en: 'Guest reception', imagen: '' },
  { hora: '6:30 PM', titulo: 'Cóctel', titulo_en: 'Cocktail', descripcion: 'Bebidas y bocadillos', descripcion_en: 'Drinks and appetizers', imagen: '' },
  { hora: '8:00 PM', titulo: 'Cena', titulo_en: 'Dinner', descripcion: 'Banquete', descripcion_en: 'Banquet', imagen: '' },
  { hora: '10:00 PM', titulo: 'Fiesta', titulo_en: 'Party', descripcion: '¡A bailar!', descripcion_en: 'Let’s dance!', imagen: '' },
]

async function cargar() {
  const c = await getConfig('itinerario')
  // Rellena campos nuevos por si el itinerario se guardó antes de tener inglés
  eventos.value = (c.eventos ?? []).map((e: any) => ({
    hora: e.hora ?? '',
    titulo: e.titulo ?? '',
    titulo_en: e.titulo_en ?? '',
    descripcion: e.descripcion ?? '',
    descripcion_en: e.descripcion_en ?? '',
    imagen: e.imagen ?? '',
  }))
  cargando.value = false
}

function agregar() {
  eventos.value.push({ hora: '', titulo: '', titulo_en: '', descripcion: '', descripcion_en: '', imagen: '' })
}

async function subirImagen(e: Event, ev: Evento) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  ev.imagen = await uploadImagen(file, 'itinerario')
  input.value = ''
}
function usarSugerido() {
  eventos.value = SUGERIDO.map((e) => ({ ...e }))
}
function subir(i: number) {
  if (i === 0) return
  const arr = eventos.value
  ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
}
function bajar(i: number) {
  const arr = eventos.value
  if (i === arr.length - 1) return
  ;[arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]
}

async function guardar() {
  guardando.value = true
  guardado.value = false
  await saveConfig('itinerario', { eventos: eventos.value })
  guardando.value = false
  guardado.value = true
  setTimeout(() => (guardado.value = false), 2500)
}

onMounted(cargar)
</script>

<template>
  <div v-if="cargando" class="muted">Cargando…</div>
  <div v-else>
    <div class="head">
      <p class="hint">
        Define la línea de tiempo del día. Si lo dejas vacío, la invitación
        muestra un itinerario de ejemplo.
      </p>
      <button v-if="!eventos.length" class="mini" @click="usarSugerido">
        Usar ejemplo
      </button>
    </div>

    <div v-for="(ev, i) in eventos" :key="i" class="fila">
      <div class="orden">
        <button class="ord" :disabled="i === 0" @click="subir(i)" aria-label="Subir">↑</button>
        <button class="ord" :disabled="i === eventos.length - 1" @click="bajar(i)" aria-label="Bajar">↓</button>
      </div>
      <input v-model="ev.hora" class="inp inp--hora" placeholder="5:00 PM" />
      <div class="campos">
        <input v-model="ev.titulo" class="inp" placeholder="Título en español (ej. Ceremonia)" />
        <input v-model="ev.titulo_en" class="inp inp--en" placeholder="🇬🇧 Título en inglés (Ceremony)" />
        <input v-model="ev.descripcion" class="inp" placeholder="Descripción en español (opcional)" />
        <input v-model="ev.descripcion_en" class="inp inp--en" placeholder="🇬🇧 Descripción en inglés (optional)" />
      </div>
      <label class="foto" :title="ev.imagen ? 'Cambiar foto' : 'Subir foto (opcional)'">
        <img v-if="ev.imagen" :src="ev.imagen" alt="" />
        <span v-else>📷</span>
        <input type="file" accept="image/*" hidden @change="(e) => subirImagen(e, ev)" />
      </label>
      <button class="mini mini--danger" @click="eventos.splice(i, 1)">✕</button>
    </div>

    <button class="mini add" @click="agregar">+ Agregar momento</button>

    <div class="acciones">
      <button class="btn" @click="guardar" :disabled="guardando">
        {{ guardando ? 'Guardando…' : 'Guardar itinerario' }}
      </button>
      <span v-if="guardado" class="ok">✓ Guardado</span>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.4rem;
}
.hint { color: var(--color-ink-soft); font-size: 0.88rem; line-height: 1.6; }

.fila {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.7rem;
}
.orden { display: flex; flex-direction: column; gap: 0.15rem; }
.ord {
  width: 26px;
  height: 20px;
  border: 1px solid var(--color-hairline);
  background: transparent;
  cursor: pointer;
  font-size: 0.7rem;
  color: var(--color-ink-soft);
  border-radius: 3px;
}
.ord:disabled { opacity: 0.35; cursor: not-allowed; }

.inp {
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  padding: 0.55rem 0.65rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-ink);
  outline: none;
  width: 100%;
}
.inp:focus { border-color: var(--color-sage); }
.inp--hora { flex: 0 0 6rem; }
.campos { flex: 1; display: grid; gap: 0.4rem; }

.foto {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-hairline);
  display: grid;
  place-items: center;
  cursor: pointer;
  overflow: hidden;
  font-size: 1.1rem;
  border-radius: 3px;
}
.foto img { width: 100%; height: 100%; object-fit: cover; }
.foto:hover { border-color: var(--color-sage); }

.mini {
  flex-shrink: 0;
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.74rem;
  color: var(--color-ink);
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s;
}
.mini:hover { border-color: var(--color-sage); color: var(--color-sage); }
.mini--danger:hover { border-color: #b3261e; color: #b3261e; }
.add { margin: 0.6rem 0 1.6rem; }

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
</style>
