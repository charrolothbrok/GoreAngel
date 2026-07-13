<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getConfig, saveConfig } from '../../lib/config'

const lugar = ref('')
const introTexto = ref('')
const introTextoEn = ref('')
const cargando = ref(true)
const guardando = ref(false)
const guardado = ref(false)

async function cargar() {
  const c = await getConfig('portada')
  lugar.value = c.lugar ?? 'Zacatecas, México'
  introTexto.value =
    c.intro_texto ??
    'Después de un camino juntos, hemos decidido unir nuestras vidas. Nos encantaría que seas parte de este día.'
  introTextoEn.value = c.intro_texto_en ?? ''
  cargando.value = false
}

async function guardar() {
  guardando.value = true
  guardado.value = false
  await saveConfig('portada', {
    lugar: lugar.value,
    intro_texto: introTexto.value,
    intro_texto_en: introTextoEn.value,
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
      <span>Lugar (aparece bajo los nombres)</span>
      <input v-model="lugar" class="inp" placeholder="Zacatecas, México" />
    </label>

    <label class="f">
      <span>Texto de bienvenida (español)</span>
      <textarea
        v-model="introTexto"
        class="inp ta"
        placeholder="Después de un camino juntos, hemos decidido unir nuestras vidas…"
      ></textarea>
    </label>

    <label class="f">
      <span>🇬🇧 Texto de bienvenida (inglés) — se muestra al cambiar a EN</span>
      <textarea
        v-model="introTextoEn"
        class="inp ta"
        placeholder="After a journey together, we have decided to unite our lives…"
      ></textarea>
    </label>

    <div class="acciones">
      <button class="btn" @click="guardar" :disabled="guardando">
        {{ guardando ? 'Guardando…' : 'Guardar portada' }}
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
.ta { min-height: 5rem; resize: vertical; }

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
