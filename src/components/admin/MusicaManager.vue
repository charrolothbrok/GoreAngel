<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getConfig, saveConfig, uploadImagen } from '../../lib/config'
import { supabase } from '../../lib/supabase'

const url = ref('')
const cargando = ref(true)
const guardando = ref(false)
const guardado = ref(false)
const subiendo = ref(false)
const error = ref('')

async function cargar() {
  const c = await getConfig('musica_url')
  url.value = c.url ?? ''
  cargando.value = false
}

async function subirAudio(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  subiendo.value = true
  const path = `musica/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
  const { error: err } = await supabase.storage
    .from('galeria')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (err) {
    error.value = `No se pudo subir: ${err.message}`
    subiendo.value = false
    input.value = ''
    return
  }

  url.value = supabase.storage.from('galeria').getPublicUrl(path).data.publicUrl
  // Guarda automáticamente para que no se olvide
  await saveConfig('musica_url', { url: url.value })
  subiendo.value = false
  guardado.value = true
  setTimeout(() => (guardado.value = false), 2500)
  input.value = ''
}

async function guardar() {
  error.value = ''
  if (!url.value.trim()) {
    error.value = 'Pega un enlace o sube un archivo de audio primero.'
    return
  }
  guardando.value = true
  guardado.value = false
  await saveConfig('musica_url', { url: url.value })
  guardando.value = false
  guardado.value = true
  setTimeout(() => (guardado.value = false), 2500)
}

onMounted(cargar)
</script>

<template>
  <div v-if="cargando" class="muted">Cargando…</div>
  <div v-else class="wrap">
    <p class="hint">
      Pega un enlace directo a un archivo de audio (.mp3) o sube uno. Sonará como
      música de fondo en la invitación (el invitado la activa con un botón).
    </p>

    <label class="f">
      <span>URL del audio</span>
      <input v-model="url" class="inp" placeholder="https://…/cancion.mp3" />
    </label>

    <label class="upload">
      <input type="file" accept="audio/*" hidden @change="subirAudio" :disabled="subiendo" />
      {{ subiendo ? 'Subiendo…' : 'O subir un archivo de audio' }}
    </label>

    <audio v-if="url" :src="url" controls class="preview"></audio>

    <p v-if="error" class="err">{{ error }}</p>

    <div class="acciones">
      <button class="btn" @click="guardar" :disabled="guardando">
        {{ guardando ? 'Guardando…' : 'Guardar música' }}
      </button>
      <span v-if="guardado" class="ok">✓ Guardado</span>
    </div>
  </div>
</template>

<style scoped>
.wrap { max-width: 34rem; }
.hint { color: var(--color-ink-soft); font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.4rem; }
.f { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
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

.upload {
  display: inline-block;
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  padding: 0.55rem 1.2rem;
  font-size: 0.8rem;
  cursor: pointer;
  margin-bottom: 1.4rem;
  transition: border-color 0.3s, color 0.3s;
}
.upload:hover { border-color: var(--color-sage); color: var(--color-sage); }

.preview { display: block; width: 100%; margin-bottom: 1.4rem; }

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
.err { color: #b3261e; font-size: 0.85rem; margin-bottom: 1rem; }
.muted { color: var(--color-ink-soft); }
</style>
