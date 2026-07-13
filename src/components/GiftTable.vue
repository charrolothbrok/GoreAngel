<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'

interface Link {
  label?: string
  url?: string
  iconUrl?: string
}
interface Tarjeta {
  banco?: string
  titular?: string
  cuenta?: string
  clabe?: string
  concepto?: string
  iconUrl?: string
}
interface MesaConfig {
  mensaje_intro?: string
  links?: Link[]
  tarjetas?: Tarjeta[]
}

const props = withDefaults(
  defineProps<{ config?: MesaConfig; t?: Record<string, string> }>(),
  { config: () => ({}), t: () => ({}) }
)
const tr = (k: string, fb: string) => props.t[k] || fb

const links = computed(() => props.config?.links ?? [])
const tarjetas = computed(() => props.config?.tarjetas ?? [])

// --- Modal ---
const abierto = ref(false)
const vista = ref<'listas' | 'deposito'>('listas')

function abrir(v: 'listas' | 'deposito') {
  vista.value = v
  abierto.value = true
}
function cerrar() {
  abierto.value = false
}

// Bloquea el scroll del fondo cuando el modal está abierto
watch(abierto, (v) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = v ? 'hidden' : ''
  }
})

// --- Copiar al portapapeles ---
const copied = ref('')
async function copy(value: string, key: string) {
  try {
    await navigator.clipboard.writeText(value)
    copied.value = key
    setTimeout(() => (copied.value = ''), 1600)
  } catch {
    /* sin permiso de portapapeles */
  }
}

function campos(card: Tarjeta) {
  return [
    { label: tr('gift_banco', 'Banco'), value: card.banco },
    { label: tr('gift_titular', 'Titular'), value: card.titular },
    { label: tr('gift_cuenta', 'Cuenta'), value: card.cuenta },
    { label: tr('gift_clabe', 'CLABE'), value: card.clabe },
    { label: tr('gift_concepto', 'Concepto'), value: card.concepto },
  ].filter((f) => f.value)
}

// --- Avísanos de tu regalo (escribe en mensajes_regalo) ---
const aviso = reactive({ nombre: '', metodo: '', monto: '', mensaje: '' })
const enviando = ref(false)
const avisoListo = ref(false)
const avisoError = ref('')

async function enviarAviso() {
  avisoError.value = ''
  if (!aviso.nombre.trim()) {
    avisoError.value = tr('gifts_aviso_err_nombre', 'Por favor escribe tu nombre.')
    return
  }
  enviando.value = true
  const { error } = await supabase.from('mensajes_regalo').insert([{ ...aviso }])
  enviando.value = false
  if (error) {
    avisoError.value = tr('gifts_aviso_err_envio', 'No se pudo enviar. Inténtalo de nuevo.')
    return
  }
  avisoListo.value = true
}
</script>

<template>
  <div class="mesa">
    <p v-if="config?.mensaje_intro" class="mesa__intro" data-reveal>
      {{ config.mensaje_intro }}
    </p>
    <p v-else class="mesa__intro" data-reveal>
      {{ tr('gifts_intro_default', 'Tu presencia es nuestro mejor regalo. Pero si deseas tener un detalle con nosotros, aquí te dejamos algunas opciones con todo el cariño.') }}
    </p>

    <!-- Botones compactos -->
    <div class="mesa__cta" data-reveal>
      <button v-if="links.length" class="cta" @click="abrir('listas')">
        <span class="cta__title">{{ tr('gifts_listas_title', 'Listas de regalo') }}</span>
        <span class="cta__sub">{{ tr('gifts_listas_sub', 'Ver tiendas') }}</span>
      </button>
      <button v-if="tarjetas.length" class="cta" @click="abrir('deposito')">
        <span class="cta__title">{{ tr('gifts_enviar_title', 'Enviar un regalo') }}</span>
        <span class="cta__sub">{{ tr('gifts_enviar_sub', 'Datos para depósito') }}</span>
      </button>
    </div>

    <p v-if="!links.length && !tarjetas.length" class="mesa__empty" data-reveal>
      {{ tr('gifts_empty', 'Pronto compartiremos aquí los detalles.') }}
    </p>
  </div>

  <!-- MODAL -->
  <Transition name="modal">
      <div v-if="abierto" class="overlay" @click.self="cerrar">
        <div class="sheet" role="dialog" aria-modal="true">
          <header class="sheet__head">
            <div class="sheet__tabs">
              <button
                v-if="links.length"
                class="stab"
                :class="{ 'stab--on': vista === 'listas' }"
                @click="vista = 'listas'"
              >
                {{ tr('gifts_tab_listas', 'Listas') }}
              </button>
              <button
                v-if="tarjetas.length"
                class="stab"
                :class="{ 'stab--on': vista === 'deposito' }"
                @click="vista = 'deposito'"
              >
                {{ tr('gifts_tab_deposito', 'Depósito') }}
              </button>
            </div>
            <button class="sheet__close" aria-label="Cerrar" @click="cerrar">✕</button>
          </header>

          <div class="sheet__body">
            <!-- LISTAS -->
            <div v-if="vista === 'listas'" class="pane">
              <a
                v-for="(link, i) in links"
                :key="i"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="store"
              >
                <img v-if="link.iconUrl" :src="link.iconUrl" alt="" class="store__icon" />
                <span class="store__name">{{ link.label || tr('gifts_ver_lista', 'Ver lista') }}</span>
                <span class="store__arrow">→</span>
              </a>
            </div>

            <!-- DEPÓSITO -->
            <div v-else class="pane">
              <article v-for="(t, i) in tarjetas" :key="i" class="cuenta">
                <header class="cuenta__head">
                  <img v-if="t.iconUrl" :src="t.iconUrl" alt="" class="cuenta__icon" />
                  <span class="cuenta__banco">{{ t.banco || `Cuenta ${i + 1}` }}</span>
                </header>
                <ul class="cuenta__campos">
                  <li v-for="f in campos(t)" :key="f.label" class="campo">
                    <div>
                      <span class="campo__k">{{ f.label }}</span>
                      <span class="campo__v">{{ f.value }}</span>
                    </div>
                    <button
                      type="button"
                      class="campo__copy"
                      @click="copy(f.value as string, `${i}-${f.label}`)"
                    >
                      {{ copied === `${i}-${f.label}` ? tr('gifts_copiado', '✓ Copiado') : tr('gifts_copiar', 'Copiar') }}
                    </button>
                  </li>
                </ul>
              </article>

              <!-- Avísanos de tu regalo -->
              <div class="aviso-wrap">
                <Transition name="fade" mode="out-in">
                  <p v-if="avisoListo" key="ok" class="aviso-ok">
                    {{ tr('gifts_aviso_ok', '¡Gracias por avisarnos! Lo recibimos con mucho cariño. 💚') }}
                  </p>
                  <form v-else key="form" class="aviso" @submit.prevent="enviarAviso">
                    <p class="aviso__label">{{ tr('gifts_aviso_label', '¿Nos avisas de tu regalo? (opcional)') }}</p>
                    <input v-model="aviso.nombre" class="aviso__input" :placeholder="tr('gifts_aviso_nombre', 'Tu nombre *')" />
                    <div class="aviso__row">
                      <input v-model="aviso.metodo" class="aviso__input" :placeholder="tr('gifts_aviso_metodo', 'Método')" />
                      <input v-model="aviso.monto" class="aviso__input" :placeholder="tr('gifts_aviso_monto', 'Monto (opcional)')" />
                    </div>
                    <textarea
                      v-model="aviso.mensaje"
                      class="aviso__input aviso__ta"
                      :placeholder="tr('gifts_aviso_msg', 'Un mensaje para los novios…')"
                    ></textarea>
                    <p v-if="avisoError" class="aviso__error">{{ avisoError }}</p>
                    <button type="submit" class="aviso__btn" :disabled="enviando">
                      {{ enviando ? tr('gifts_aviso_enviando', 'Enviando…') : tr('gifts_aviso_btn', 'Avisar de mi regalo') }}
                    </button>
                  </form>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
</template>

<style scoped>
.mesa {
  max-width: 40rem;
  margin-inline: auto;
  text-align: center;
}

.mesa__intro {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  color: var(--color-ink-soft);
  line-height: 1.6;
  margin-bottom: clamp(2rem, 5vw, 3rem);
}

.mesa__cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Botón-tarjeta sobrio (sin sombras de IA) */
.cta {
  flex: 1 1 14rem;
  max-width: 18rem;
  background: transparent;
  border: 1px solid var(--color-hairline);
  padding: 1.4rem 1.6rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  text-align: left;
  transition:
    transform 0.4s var(--ease-spring),
    border-color 0.3s var(--ease-elegant),
    background-color 0.3s var(--ease-elegant);
}
.cta:hover {
  transform: translateY(-2px);
  border-color: var(--color-sage);
  background: color-mix(in srgb, var(--color-sand) 14%, transparent);
}
.cta__title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-ink);
}
.cta__sub {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.66rem;
  color: var(--color-ink-soft);
}

.mesa__empty {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--color-ink-soft);
}

/* ---------- Modal ---------- */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: color-mix(in srgb, var(--color-ink) 45%, transparent);
  backdrop-filter: blur(3px);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.sheet {
  background: var(--color-bone);
  width: 100%;
  max-width: 34rem;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
}

.sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem 0.8rem 1.2rem;
  border-bottom: 1px solid var(--color-hairline);
}

.sheet__tabs { display: flex; gap: 0.4rem; }
.stab {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.5rem 0.6rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: color 0.3s, border-color 0.3s;
}
.stab--on {
  color: var(--color-ink);
  border-bottom-color: var(--color-sage);
}

.sheet__close {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--color-hairline);
  background: transparent;
  color: var(--color-ink);
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s;
}
.sheet__close:hover { border-color: var(--color-sage); color: var(--color-sage); }

.sheet__body {
  overflow-y: auto;
  padding: 1.2rem;
}

.pane { display: flex; flex-direction: column; gap: 1rem; }

/* Tiendas */
.store {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-hairline);
  text-decoration: none;
  color: var(--color-ink);
  transition: background-color 0.3s var(--ease-elegant);
}
.store:hover { background: color-mix(in srgb, var(--color-sand) 22%, transparent); }
.store__icon { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; }
.store__name { flex: 1; font-weight: 500; }
.store__arrow { color: var(--color-sage); transition: transform 0.4s var(--ease-spring); }
.store:hover .store__arrow { transform: translateX(4px); }

/* Cuentas */
.cuenta { border: 1px solid var(--color-hairline); }
.cuenta__head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--color-hairline);
}
.cuenta__icon { width: 26px; height: 26px; object-fit: contain; }
.cuenta__banco { font-family: var(--font-display); font-size: 1.15rem; }
.cuenta__campos { list-style: none; margin: 0; padding: 0; }
.campo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--color-hairline);
}
.campo:last-child { border-bottom: none; }
.campo__k {
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.6rem;
  color: var(--color-ink-soft);
}
.campo__v { font-variant-numeric: tabular-nums; font-size: 0.95rem; }
.campo__copy {
  flex-shrink: 0;
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 0.7rem;
  color: var(--color-ink);
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s, transform 0.4s var(--ease-spring);
}
.campo__copy:hover {
  border-color: var(--color-sage);
  color: var(--color-sage);
  transform: scale(1.04);
}

/* Aviso */
.aviso-wrap {
  border-top: 1px solid var(--color-hairline);
  padding-top: 1.2rem;
  margin-top: 0.4rem;
}
.aviso { display: flex; flex-direction: column; gap: 0.7rem; }
.aviso__label {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.66rem;
  color: var(--color-sage);
}
.aviso__row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.aviso__input {
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  padding: 0.6rem 0.7rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-ink);
  outline: none;
}
.aviso__input:focus { border-color: var(--color-sage); }
.aviso__ta { min-height: 4rem; resize: vertical; }
.aviso__btn {
  align-self: center;
  margin-top: 0.3rem;
  padding: 0.7rem 1.6rem;
  border: 1px solid var(--color-ink);
  border-radius: 999px;
  background: transparent;
  color: var(--color-ink);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
  cursor: pointer;
  transition: transform 0.4s var(--ease-spring), background-color 0.3s, color 0.3s;
}
.aviso__btn:hover:not(:disabled) {
  background: var(--color-ink);
  color: var(--color-bone);
  transform: scale(1.03);
}
.aviso__btn:disabled { opacity: 0.6; cursor: not-allowed; }
.aviso__error { color: #b3261e; font-size: 0.8rem; }
.aviso-ok {
  text-align: center;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--color-sage);
  padding: 1rem 0;
}

/* Transiciones */
.modal-enter-active,
.modal-leave-active { transition: opacity 0.35s var(--ease-elegant); }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-active .sheet,
.modal-leave-active .sheet { transition: transform 0.4s var(--ease-spring); }
.modal-enter-from .sheet,
.modal-leave-to .sheet { transform: translateY(16px) scale(0.98); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.4s var(--ease-elegant); }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .aviso__row { grid-template-columns: 1fr; }
}
</style>
