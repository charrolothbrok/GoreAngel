<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getConfig, saveConfig, uploadImagen } from '../../lib/config'

const etiqueta = ref('')
const descripcion = ref('')
const nota = ref('')
const fotos = ref<string[]>([])
const cargando = ref(true)
const guardando = ref(false)
const guardado = ref(false)
const subiendo = ref(false)

async function cargar() {
  const c = await getConfig('vestimenta')
  etiqueta.value = c.etiqueta ?? ''
  descripcion.value = c.descripcion ?? ''
  nota.value = c.nota ?? ''
  fotos.value = c.fotos ?? []
  cargando.value = false
}

async function subirFotos(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return
  subiendo.value = true
  for (const file of files) {
    const url = await uploadImagen(file, 'vestimenta')
    fotos.value.push(url)
  }
  subiendo.value = false
  input.value = ''
  await guardar()
}

function quitarFoto(i: number) {
  fotos.value.splice(i, 1)
}

async function guardar() {
  guardando.value = true
  guardado.value = false
  await saveConfig('vestimenta', {
    etiqueta: etiqueta.value,
    descripcion: descripcion.value,
    nota: nota.value,
    fotos: fotos.value,
  })
  guardando.value = false
  guardado.value = true
  setTimeout(() => (guardado.value = false), 2500)
}

onMounted(cargar)
</script>

<template>
  <div v-if="cargando" class="muted">Cargando…</div>
  <div v-else class="wrap">
    <label class="f">
      <span>Etiqueta / tipo</span>
      <input v-model="etiqueta" class="inp" placeholder="Ej. Formal, Etiqueta rigurosa, Coctel…" />
    </label>

    <label class="f">
      <span>Descripción</span>
      <textarea
        v-model="descripcion"
        class="inp ta"
        placeholder="Ej. Te pedimos vestir formal para acompañarnos…"
      ></textarea>
    </label>

    <label class="f">
      <span>Nota especial (opcional)</span>
      <input
        v-model="nota"
        class="inp"
        placeholder="Ej. El color blanco está reservado para la novia"
      />
    </label>

    <!-- Fotos de ejemplo de vestimenta -->
    <div class="f">
      <span class="lbl">Fotos de ejemplo (opcional)</span>
      <div class="fotos">
        <figure v-for="(url, i) in fotos" :key="url" class="foto">
          <img :src="url" alt="" />
          <button class="foto__del" @click="quitarFoto(i)" aria-label="Quitar">✕</button>
        </figure>
        <label class="foto foto--add">
          <input type="file" accept="image/*" multiple hidden @change="subirFotos" :disabled="subiendo" />
          <span>{{ subiendo ? '…' : '+ Foto' }}</span>
        </label>
      </div>
    </div>

    <div class="acciones">
      <button class="btn" @click="guardar" :disabled="guardando">
        {{ guardando ? 'Guardando…' : 'Guardar vestimenta' }}
      </button>
      <span v-if="guardado" class="ok">✓ Guardado</span>
    </div>
  </div>
</template>

<style scoped>
.wrap { max-width: 34rem; }
.f { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
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
.ta { min-height: 4.5rem; resize: vertical; }
.lbl {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.64rem;
  color: var(--color-ink-soft);
}

.fotos { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.foto {
  position: relative;
  width: 90px;
  height: 110px;
  margin: 0;
  border: 1px solid var(--color-hairline);
  overflow: hidden;
}
.foto img { width: 100%; height: 100%; object-fit: cover; }
.foto__del {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: color-mix(in srgb, var(--color-ink) 70%, transparent);
  color: #fff;
  font-size: 0.7rem;
  cursor: pointer;
}
.foto--add {
  display: grid;
  place-items: center;
  cursor: pointer;
  border-style: dashed;
  font-size: 0.78rem;
  color: var(--color-ink-soft);
}
.foto--add:hover { border-color: var(--color-sage); color: var(--color-sage); }

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
