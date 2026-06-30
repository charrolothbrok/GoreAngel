<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

interface Mensaje {
  id: string
  nombre: string
  metodo: string | null
  monto: string | null
  mensaje: string | null
  created_at: string
}

const items = ref<Mensaje[]>([])
const cargando = ref(true)

async function cargar() {
  cargando.value = true
  const { data } = await supabase
    .from('mensajes_regalo')
    .select('*')
    .order('created_at', { ascending: false })
  items.value = (data as Mensaje[]) ?? []
  cargando.value = false
}

async function eliminar(m: Mensaje) {
  if (!confirm(`¿Eliminar el aviso de "${m.nombre}"?`)) return
  await supabase.from('mensajes_regalo').delete().eq('id', m.id)
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
    <p v-if="cargando" class="muted">Cargando…</p>
    <p v-else-if="!items.length" class="muted">
      Aún no hay avisos de regalo. Aparecerán aquí cuando alguien te avise desde la mesa de regalos.
    </p>

    <ul v-else class="lista">
      <li v-for="m in items" :key="m.id" class="row">
        <div class="row__main">
          <p class="row__name">{{ m.nombre }}</p>
          <p class="row__meta">
            <template v-if="m.metodo">{{ m.metodo }}</template>
            <template v-if="m.monto"> · {{ m.monto }}</template>
            · {{ fecha(m.created_at) }}
          </p>
          <p v-if="m.mensaje" class="row__msg">"{{ m.mensaje }}"</p>
        </div>
        <button class="mini mini--danger" @click="eliminar(m)">Eliminar</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
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
.row__name { font-weight: 500; }
.row__meta { font-size: 0.8rem; color: var(--color-ink-soft); margin-top: 0.25rem; }
.row__msg {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-ink);
  margin-top: 0.4rem;
  font-size: 0.95rem;
}
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
.mini--danger:hover { border-color: #b3261e; color: #b3261e; }
.muted { color: var(--color-ink-soft); padding: 1rem 0; }
</style>
