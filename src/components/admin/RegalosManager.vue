<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getConfig, saveConfig, uploadImagen } from '../../lib/config'

interface Link { label: string; url: string; iconUrl: string }
interface Tarjeta {
  banco: string
  titular: string
  cuenta: string
  clabe: string
  concepto: string
  iconUrl: string
}

const mensajeIntro = ref('')
const links = ref<Link[]>([])
const tarjetas = ref<Tarjeta[]>([])
const cargando = ref(true)
const guardando = ref(false)
const guardado = ref(false)

async function cargar() {
  const c = await getConfig('mesa_regalos')
  mensajeIntro.value = c.mensaje_intro ?? ''
  links.value = c.links ?? []
  tarjetas.value = c.tarjetas ?? []
  cargando.value = false
}

function addLink() {
  links.value.push({ label: '', url: '', iconUrl: '' })
}
function addTarjeta() {
  tarjetas.value.push({
    banco: '',
    titular: '',
    cuenta: '',
    clabe: '',
    concepto: 'Regalo boda Ángel & Goretti',
    iconUrl: '',
  })
}

async function subirIcono(e: Event, target: Link | Tarjeta) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  target.iconUrl = await uploadImagen(file, 'iconos')
  input.value = ''
}

async function guardar() {
  guardando.value = true
  guardado.value = false
  await saveConfig('mesa_regalos', {
    mostrar_mesa: true,
    mensaje_intro: mensajeIntro.value,
    links: links.value,
    tarjetas: tarjetas.value,
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
    <label class="f">
      <span>Mensaje de introducción</span>
      <textarea v-model="mensajeIntro" class="inp ta" placeholder="Un texto cálido sobre los regalos…" />
    </label>

    <!-- Links a tiendas -->
    <section class="grupo">
      <div class="grupo__head">
        <h3>Listas / tiendas</h3>
        <button class="mini" @click="addLink">+ Agregar</button>
      </div>
      <p v-if="!links.length" class="muted">Sin listas todavía.</p>
      <div v-for="(l, i) in links" :key="i" class="item">
        <label class="icono">
          <img v-if="l.iconUrl" :src="l.iconUrl" alt="" />
          <span v-else>logo</span>
          <input type="file" accept="image/*" hidden @change="(e) => subirIcono(e, l)" />
        </label>
        <div class="item__campos">
          <input v-model="l.label" class="inp" placeholder="Nombre (ej. Liverpool)" />
          <input v-model="l.url" class="inp" placeholder="https://…" />
        </div>
        <button class="mini mini--danger" @click="links.splice(i, 1)">✕</button>
      </div>
    </section>

    <!-- Tarjetas / cuentas -->
    <section class="grupo">
      <div class="grupo__head">
        <h3>Cuentas para transferencia</h3>
        <button class="mini" @click="addTarjeta">+ Agregar</button>
      </div>
      <p v-if="!tarjetas.length" class="muted">Sin cuentas todavía.</p>
      <div v-for="(t, i) in tarjetas" :key="i" class="tarjeta">
        <div class="tarjeta__top">
          <label class="icono">
            <img v-if="t.iconUrl" :src="t.iconUrl" alt="" />
            <span v-else>logo</span>
            <input type="file" accept="image/*" hidden @change="(e) => subirIcono(e, t)" />
          </label>
          <button class="mini mini--danger" @click="tarjetas.splice(i, 1)">Eliminar</button>
        </div>
        <div class="tarjeta__campos">
          <input v-model="t.banco" class="inp" placeholder="Banco" />
          <input v-model="t.titular" class="inp" placeholder="Titular" />
          <input v-model="t.cuenta" class="inp" placeholder="No. de cuenta" />
          <input v-model="t.clabe" class="inp" placeholder="CLABE" />
          <input v-model="t.concepto" class="inp wide" placeholder="Concepto" />
        </div>
      </div>
    </section>

    <div class="acciones">
      <button class="btn" @click="guardar" :disabled="guardando">
        {{ guardando ? 'Guardando…' : 'Guardar mesa de regalos' }}
      </button>
      <span v-if="guardado" class="ok">✓ Guardado</span>
    </div>
  </div>
</template>

<style scoped>
.f { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.8rem; }
.f > span {
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
  width: 100%;
}
.inp:focus { border-color: var(--color-sage); }
.ta { min-height: 4rem; resize: vertical; }

.grupo { margin-bottom: 2rem; }
.grupo__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}
.grupo__head h3 { font-family: var(--font-display); font-size: 1.25rem; }

.item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.7rem;
}
.item__campos { flex: 1; display: grid; gap: 0.5rem; }

.tarjeta {
  border: 1px solid var(--color-hairline);
  padding: 1rem;
  margin-bottom: 0.9rem;
}
.tarjeta__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}
.tarjeta__campos { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.tarjeta__campos .wide { grid-column: 1 / -1; }

.icono {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border: 1px solid var(--color-hairline);
  display: grid;
  place-items: center;
  cursor: pointer;
  overflow: hidden;
  font-size: 0.6rem;
  color: var(--color-ink-soft);
}
.icono img { width: 100%; height: 100%; object-fit: contain; }

.mini {
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.74rem;
  color: var(--color-ink);
  cursor: pointer;
}
.mini:hover { border-color: var(--color-sage); color: var(--color-sage); }
.mini--danger:hover { border-color: #b3261e; color: #b3261e; }

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
  .tarjeta__campos { grid-template-columns: 1fr; }
}
</style>
