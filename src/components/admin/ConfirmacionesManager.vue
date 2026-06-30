<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../lib/supabase'

interface Confirmacion {
  id: string
  nombre: string
  telefono: string | null
  num_personas: number | null
  asistira: boolean
  restriccion_alimentaria: string | null
  mensaje: string | null
  lado: string | null
  invitado_id: string | null
  created_at: string
}

const items = ref<Confirmacion[]>([])
const cargando = ref(true)
const filtro = ref<'todos' | 'si' | 'no' | 'pasados'>('todos')
const pasandoId = ref<string | null>(null)
const pasandoTodos = ref(false)
const editando = ref<Confirmacion | null>(null)

// Confirmaciones que asisten y aún no están en invitados
const porPasar = computed(() =>
  items.value.filter((c) => c.asistira && !c.invitado_id)
)

const asisten = computed(() => items.value.filter((c) => c.asistira))
const noAsisten = computed(() => items.value.filter((c) => !c.asistira))
const enInvitados = computed(() => items.value.filter((c) => c.invitado_id))
const totalPersonas = computed(() =>
  asisten.value.reduce((s, c) => s + (c.num_personas || 0), 0)
)

const filtrados = computed(() => {
  if (filtro.value === 'si') return asisten.value
  if (filtro.value === 'no') return noAsisten.value
  if (filtro.value === 'pasados') return enInvitados.value
  return items.value
})

const ladoTexto = (l: string | null) =>
  l === 'novio' ? 'Ángel' : l === 'novia' ? 'Goretti' : l === 'ambos' ? 'Ambos' : ''

function exportarExcel() {
  const head = ['Nombre', 'Asiste', 'Personas', 'Teléfono', 'Lado', 'Restricción', 'Mensaje', 'Fecha']
  const filas = filtrados.value.map((c) => [
    c.nombre,
    c.asistira ? 'Sí' : 'No',
    c.asistira ? c.num_personas || 1 : 0,
    c.telefono || '',
    ladoTexto(c.lado),
    c.restriccion_alimentaria || '',
    c.mensaje || '',
    fecha(c.created_at),
  ])
  const csv = [head, ...filas]
    .map((fila) => fila.map((cel) => `"${String(cel).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  // BOM (﻿) para que Excel respete los acentos
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `confirmaciones-${filtro.value}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function cargar() {
  cargando.value = true
  const { data } = await supabase
    .from('confirmaciones')
    .select('*')
    .order('created_at', { ascending: false })
  items.value = (data as Confirmacion[]) ?? []
  cargando.value = false
}

async function eliminar(c: Confirmacion) {
  if (!confirm(`¿Eliminar la confirmación de "${c.nombre}"?`)) return
  await supabase.from('confirmaciones').delete().eq('id', c.id)
  await cargar()
}

// Crea un invitado a partir de la confirmación y la marca como procesada
async function pasarAInvitados(c: Confirmacion) {
  pasandoId.value = c.id

  // 1. Crear el invitado (genera su token/QR automáticamente)
  const { data: nuevo, error } = await supabase
    .from('invitados')
    .insert([
      {
        nombre: c.nombre,
        num_pases: c.num_personas || 1,
        lado: c.lado,
      },
    ])
    .select()
    .single()

  if (error || !nuevo) {
    pasandoId.value = null
    alert('No se pudo crear el invitado. Inténtalo de nuevo.')
    return
  }

  // 2. Vincular la confirmación al invitado (queda marcada como procesada)
  await supabase
    .from('confirmaciones')
    .update({ invitado_id: nuevo.id })
    .eq('id', c.id)

  pasandoId.value = null
  await cargar()
}

// Pasa de golpe TODOS los que asisten y aún no están en invitados
async function pasarTodos() {
  const pendientes = porPasar.value
  if (!pendientes.length) return
  if (!confirm(`¿Pasar ${pendientes.length} confirmación(es) a tu lista de invitados?`)) return

  pasandoTodos.value = true
  for (const c of pendientes) {
    const { data: nuevo, error } = await supabase
      .from('invitados')
      .insert([{ nombre: c.nombre, num_pases: c.num_personas || 1, lado: c.lado }])
      .select()
      .single()
    if (!error && nuevo) {
      await supabase.from('confirmaciones').update({ invitado_id: nuevo.id }).eq('id', c.id)
    }
  }
  pasandoTodos.value = false
  await cargar()
}

// --- Edición de una confirmación ---
function abrirEdicion(c: Confirmacion) {
  editando.value = { ...c }
}
function cerrarEdicion() {
  editando.value = null
}
async function guardarEdicion() {
  if (!editando.value) return
  const e = editando.value
  await supabase
    .from('confirmaciones')
    .update({
      nombre: e.nombre,
      asistira: e.asistira,
      num_personas: e.num_personas,
      telefono: e.telefono,
      lado: e.lado,
      restriccion_alimentaria: e.restriccion_alimentaria,
      mensaje: e.mensaje,
    })
    .eq('id', e.id)
  editando.value = null
  await cargar()
}

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(cargar)
</script>

<template>
  <div>
    <div class="stats">
      <div class="stat"><b>{{ asisten.length }}</b><span>Confirmados</span></div>
      <div class="stat"><b>{{ totalPersonas }}</b><span>Personas en total</span></div>
      <div class="stat"><b>{{ noAsisten.length }}</b><span>No asisten</span></div>
    </div>

    <!-- Filtros + exportar -->
    <div v-if="items.length" class="toolbar">
      <div class="filtros">
        <button class="fbtn" :class="{ 'fbtn--on': filtro === 'todos' }" @click="filtro = 'todos'">
          Todos ({{ items.length }})
        </button>
        <button class="fbtn" :class="{ 'fbtn--on': filtro === 'si' }" @click="filtro = 'si'">
          Asisten ({{ asisten.length }})
        </button>
        <button class="fbtn" :class="{ 'fbtn--on': filtro === 'no' }" @click="filtro = 'no'">
          No asisten ({{ noAsisten.length }})
        </button>
        <button class="fbtn" :class="{ 'fbtn--on': filtro === 'pasados' }" @click="filtro = 'pasados'">
          En invitados ({{ enInvitados.length }})
        </button>
      </div>
      <div class="toolbar__btns">
        <button
          v-if="porPasar.length"
          class="pasar-todos"
          :disabled="pasandoTodos"
          @click="pasarTodos"
        >
          {{ pasandoTodos ? 'Pasando…' : `→ Pasar todos los que asisten (${porPasar.length})` }}
        </button>
        <button class="excel" @click="exportarExcel">⤓ Exportar a Excel</button>
      </div>
    </div>

    <p v-if="cargando" class="muted">Cargando…</p>
    <p v-else-if="!items.length" class="muted">
      Aún no hay confirmaciones. Aparecerán aquí cuando tus invitados llenen el RSVP.
    </p>
    <p v-else-if="!filtrados.length" class="muted">No hay confirmaciones en este filtro.</p>

    <ul v-else class="lista">
      <li v-for="c in filtrados" :key="c.id" class="row">
        <div class="row__main">
          <p class="row__name">
            {{ c.nombre }}
            <span class="badge" :class="c.asistira ? 'badge--si' : 'badge--no'">
              {{ c.asistira ? 'Asiste' : 'No asiste' }}
            </span>
          </p>
          <p class="row__meta">
            <template v-if="c.asistira">{{ c.num_personas || 1 }} persona(s) · </template>
            <template v-if="c.telefono">{{ c.telefono }} · </template>
            <template v-if="c.lado">{{ ladoTexto(c.lado) }} · </template>
            {{ fecha(c.created_at) }}
          </p>
          <p v-if="c.restriccion_alimentaria" class="row__extra">
            🍽 {{ c.restriccion_alimentaria }}
          </p>
          <p v-if="c.mensaje" class="row__msg">"{{ c.mensaje }}"</p>
        </div>
        <div class="row__actions">
          <span v-if="c.invitado_id" class="ok-badge">✓ En invitados</span>
          <button
            v-else-if="c.asistira"
            class="mini mini--pass"
            :disabled="pasandoId === c.id"
            @click="pasarAInvitados(c)"
          >
            {{ pasandoId === c.id ? 'Pasando…' : '→ Pasar a invitados' }}
          </button>
          <button class="mini" @click="abrirEdicion(c)">Editar</button>
          <button class="mini mini--danger" @click="eliminar(c)">Eliminar</button>
        </div>
      </li>
    </ul>

    <!-- Modal de edición -->
    <div v-if="editando" class="modal" @click.self="cerrarEdicion">
      <div class="modal__card">
        <h3 class="modal__title">Editar confirmación</h3>

        <label class="ef">
          <span>Nombre</span>
          <input v-model="editando.nombre" class="einp" />
        </label>

        <label class="ef">
          <span>¿Asiste?</span>
          <div class="etoggle">
            <button
              type="button"
              class="echoice"
              :class="{ 'echoice--on': editando.asistira }"
              @click="editando.asistira = true"
            >
              Sí asiste
            </button>
            <button
              type="button"
              class="echoice"
              :class="{ 'echoice--on': !editando.asistira }"
              @click="editando.asistira = false"
            >
              No asiste
            </button>
          </div>
        </label>

        <label v-if="editando.asistira" class="ef">
          <span>Número de personas</span>
          <input v-model.number="editando.num_personas" type="number" min="1" class="einp einp--sm" />
        </label>

        <label class="ef">
          <span>Teléfono</span>
          <input v-model="editando.telefono" class="einp" />
        </label>

        <label class="ef">
          <span>Lado</span>
          <select v-model="editando.lado" class="einp einp--sm">
            <option :value="null">—</option>
            <option value="novio">Ángel</option>
            <option value="novia">Goretti</option>
            <option value="ambos">Ambos</option>
          </select>
        </label>

        <label v-if="editando.asistira" class="ef">
          <span>Restricción alimentaria</span>
          <input v-model="editando.restriccion_alimentaria" class="einp" />
        </label>

        <label class="ef">
          <span>Mensaje</span>
          <textarea v-model="editando.mensaje" class="einp eta"></textarea>
        </label>

        <div class="modal__btns">
          <button class="mini" @click="cerrarEdicion">Cancelar</button>
          <button class="btn-save" @click="guardarEdicion">Guardar cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  gap: 1px;
  background: var(--color-hairline);
  border: 1px solid var(--color-hairline);
  margin-bottom: 2rem;
}
.stat { flex: 1; background: var(--color-bone); padding: 1.1rem; text-align: center; }
.stat b { font-family: var(--font-display); font-size: 1.8rem; display: block; }
.stat span {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-ink-soft);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
}
.filtros { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.fbtn {
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  font-size: 0.78rem;
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s, background-color 0.3s;
}
.fbtn--on {
  background: var(--color-sage);
  border-color: var(--color-sage);
  color: #fff;
}
.toolbar__btns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.excel {
  background: transparent;
  border: 1px solid var(--color-ink);
  border-radius: 999px;
  padding: 0.5rem 1.1rem;
  font-size: 0.78rem;
  color: var(--color-ink);
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, transform 0.4s var(--ease-spring);
}
.excel:hover {
  background: var(--color-ink);
  color: var(--color-bone);
  transform: scale(1.03);
}
.pasar-todos {
  background: var(--color-sage);
  border: 1px solid var(--color-sage);
  border-radius: 999px;
  padding: 0.5rem 1.1rem;
  font-size: 0.78rem;
  color: #fff;
  cursor: pointer;
  transition: transform 0.4s var(--ease-spring), opacity 0.3s;
}
.pasar-todos:hover:not(:disabled) { transform: scale(1.03); }
.pasar-todos:disabled { opacity: 0.6; cursor: not-allowed; }

/* Modal de edición */
.modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: color-mix(in srgb, var(--color-ink) 45%, transparent);
  backdrop-filter: blur(3px);
  display: grid;
  place-items: center;
  padding: 1rem;
}
.modal__card {
  background: var(--color-bone);
  width: 100%;
  max-width: 26rem;
  max-height: 88vh;
  overflow-y: auto;
  padding: 1.6rem;
  border-radius: 4px;
}
.modal__title { font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 1.2rem; }
.ef { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.9rem; }
.ef > span {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.62rem;
  color: var(--color-ink-soft);
}
.einp {
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  padding: 0.55rem 0.65rem;
  font-family: var(--font-body);
  font-size: 0.92rem;
  color: var(--color-ink);
  outline: none;
}
.einp:focus { border-color: var(--color-sage); }
.einp--sm { max-width: 8rem; }
.eta { min-height: 3.5rem; resize: vertical; }
.etoggle { display: flex; gap: 0.5rem; }
.echoice {
  flex: 1;
  padding: 0.55rem;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  background: transparent;
  color: var(--color-ink-soft);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}
.echoice--on {
  background: var(--color-sage);
  border-color: var(--color-sage);
  color: #fff;
}
.modal__btns {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.2rem;
}
.btn-save {
  background: var(--color-ink);
  color: var(--color-bone);
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.3rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: transform 0.4s var(--ease-spring);
}
.btn-save:hover { transform: scale(1.03); }

.lista { list-style: none; margin: 0; padding: 0; border: 1px solid var(--color-hairline); }
.row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid var(--color-hairline);
}
.row:last-child { border-bottom: none; }
.row__name { font-weight: 500; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.row__meta { font-size: 0.8rem; color: var(--color-ink-soft); margin-top: 0.25rem; }
.row__extra { font-size: 0.8rem; color: var(--color-ink-soft); margin-top: 0.3rem; }
.row__msg {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-ink);
  margin-top: 0.4rem;
  font-size: 0.95rem;
}
.badge {
  font-size: 0.64rem;
  color: #fff;
  padding: 0.12rem 0.55rem;
  border-radius: 999px;
}
.badge--si { background: var(--color-sage); }
.badge--no { background: #b08968; }

.row__actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
}
.mini {
  flex-shrink: 0;
  white-space: nowrap;
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.74rem;
  color: var(--color-ink);
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s, background-color 0.3s;
}
.mini--pass:hover { border-color: var(--color-sage); color: #fff; background: var(--color-sage); }
.mini:disabled { opacity: 0.6; cursor: not-allowed; }
.mini--danger:hover { border-color: #b3261e; color: #b3261e; }
.ok-badge {
  font-size: 0.7rem;
  color: var(--color-sage);
  white-space: nowrap;
}

.muted { color: var(--color-ink-soft); padding: 1rem 0; }
</style>
