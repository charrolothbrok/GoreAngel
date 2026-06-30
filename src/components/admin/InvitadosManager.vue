<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import QRCode from 'qrcode'
import { supabase } from '../../lib/supabase'

interface Invitado {
  id: string
  nombre: string
  familia: string | null
  num_pases: number | null
  lado: string | null
  token: string
  checked_in: boolean
}

const invitados = ref<Invitado[]>([])
const cargando = ref(true)
const guardando = ref(false)

const form = ref({ nombre: '', familia: '', num_pases: 1, lado: 'ambos' })

const qrInvitado = ref<Invitado | null>(null)
const qrDataUrl = ref('')

const totalPases = computed(() =>
  invitados.value.reduce((s, g) => s + (g.num_pases || 0), 0)
)
const totalCheck = computed(() => invitados.value.filter((g) => g.checked_in).length)

const ladoTexto = (l: string | null) =>
  l === 'novio' ? 'Ángel' : l === 'novia' ? 'Goretti' : l === 'ambos' ? 'Ambos' : ''

async function cargar() {
  cargando.value = true
  const { data } = await supabase
    .from('invitados')
    .select('*')
    .order('created_at', { ascending: false })
  invitados.value = (data as Invitado[]) ?? []
  cargando.value = false
}

async function agregar() {
  if (!form.value.nombre.trim()) return
  guardando.value = true
  await supabase.from('invitados').insert([
    {
      nombre: form.value.nombre.trim(),
      familia: form.value.familia.trim(),
      num_pases: Number(form.value.num_pases) || 1,
      lado: form.value.lado || 'ambos',
    },
  ])
  form.value = { nombre: '', familia: '', num_pases: 1, lado: 'ambos' }
  guardando.value = false
  await cargar()
}

async function eliminar(g: Invitado) {
  if (!confirm(`¿Eliminar a "${g.nombre}"?`)) return
  await supabase.from('invitados').delete().eq('id', g.id)
  await cargar()
}

async function verQR(g: Invitado) {
  qrInvitado.value = g
  const url = `${window.location.origin}/checkin/${g.token}`
  qrDataUrl.value = await QRCode.toDataURL(url, { width: 480, margin: 2 })
}

function descargarQR() {
  if (!qrDataUrl.value || !qrInvitado.value) return
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = `qr-${qrInvitado.value.nombre.replace(/\s+/g, '-')}.png`
  a.click()
}

onMounted(cargar)
</script>

<template>
  <div>
    <!-- Resumen -->
    <div class="stats">
      <div class="stat"><b>{{ invitados.length }}</b><span>Invitados</span></div>
      <div class="stat"><b>{{ totalPases }}</b><span>Pases totales</span></div>
      <div class="stat"><b>{{ totalCheck }}</b><span>Ya llegaron</span></div>
    </div>

    <!-- Alta -->
    <form class="alta" @submit.prevent="agregar">
      <input v-model="form.nombre" class="inp" placeholder="Nombre o familia *" />
      <input v-model="form.familia" class="inp" placeholder="Familia (opcional)" />
      <input v-model.number="form.num_pases" type="number" min="1" class="inp inp--sm" placeholder="Pases" />
      <select v-model="form.lado" class="inp inp--sm">
        <option value="novio">Ángel</option>
        <option value="novia">Goretti</option>
        <option value="ambos">Ambos</option>
      </select>
      <button type="submit" class="btn" :disabled="guardando">
        {{ guardando ? '…' : 'Agregar' }}
      </button>
    </form>

    <!-- Lista -->
    <p v-if="cargando" class="muted">Cargando…</p>
    <p v-else-if="!invitados.length" class="muted">Aún no hay invitados. Agrega el primero arriba.</p>

    <ul v-else class="lista">
      <li v-for="g in invitados" :key="g.id" class="row">
        <div class="row__info">
          <p class="row__name">
            {{ g.nombre }}
            <span v-if="g.checked_in" class="badge">✓ Llegó</span>
          </p>
          <p class="row__meta">
            {{ g.num_pases || 1 }} pase(s)
            <template v-if="g.lado"> · {{ ladoTexto(g.lado) }}</template>
          </p>
        </div>
        <div class="row__actions">
          <button class="mini" @click="verQR(g)">QR</button>
          <button class="mini mini--danger" @click="eliminar(g)">Eliminar</button>
        </div>
      </li>
    </ul>

    <!-- Modal QR -->
    <div v-if="qrInvitado" class="modal" @click.self="qrInvitado = null">
      <div class="modal__card">
        <p class="eyebrow">Código de entrada</p>
        <h3 class="modal__name">{{ qrInvitado.nombre }}</h3>
        <img :src="qrDataUrl" alt="Código QR" class="modal__qr" />
        <div class="modal__btns">
          <button class="btn" @click="descargarQR">Descargar</button>
          <button class="mini" @click="qrInvitado = null">Cerrar</button>
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
.stat {
  flex: 1;
  background: var(--color-bone);
  padding: 1.1rem;
  text-align: center;
}
.stat b {
  font-family: var(--font-display);
  font-size: 1.8rem;
  display: block;
}
.stat span {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-ink-soft);
}

.alta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 2rem;
}
.inp {
  flex: 1 1 10rem;
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  padding: 0.65rem 0.8rem;
  font-family: var(--font-body);
  font-size: 0.92rem;
  color: var(--color-ink);
  outline: none;
}
.inp:focus {
  border-color: var(--color-sage);
}
.inp--sm {
  flex: 0 0 6.5rem;
}

.btn {
  background: var(--color-ink);
  color: var(--color-bone);
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.4rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: transform 0.4s var(--ease-spring);
}
.btn:hover:not(:disabled) { transform: scale(1.03); }
.btn:disabled { opacity: 0.6; }

.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--color-hairline);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid var(--color-hairline);
}
.row:last-child { border-bottom: none; }
.row__name { font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
.row__meta { font-size: 0.8rem; color: var(--color-ink-soft); margin-top: 0.15rem; }
.badge {
  font-size: 0.66rem;
  background: var(--color-sage);
  color: #fff;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
}
.row__actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
.mini {
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

.muted { color: var(--color-ink-soft); padding: 1rem 0; }

.modal {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--color-ink) 45%, transparent);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 100;
}
.modal__card {
  background: var(--color-bone);
  padding: 2rem;
  max-width: 22rem;
  width: 100%;
  text-align: center;
  border-radius: 4px;
}
.modal__name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  margin: 0.3rem 0 1rem;
}
.modal__qr {
  width: 100%;
  max-width: 16rem;
  margin-inline: auto;
  border: 1px solid var(--color-hairline);
}
.modal__btns {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  margin-top: 1.2rem;
}
</style>
