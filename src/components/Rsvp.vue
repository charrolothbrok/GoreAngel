<script setup lang="ts">
import { reactive, ref } from 'vue'
import { supabase } from '../lib/supabase'

const props = withDefaults(
  defineProps<{ t?: Record<string, string> }>(),
  { t: () => ({}) }
)
const tr = (k: string, fb: string) => props.t[k] || fb

const form = reactive({
  nombre: '',
  lado: '' as '' | 'novio' | 'novia',
  telefono: '',
  asistira: true,
  num_personas: 1,
  restriccion_alimentaria: '',
  mensaje: '',
})

const loading = ref(false)
const done = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!form.nombre.trim()) {
    error.value = tr('rsvp_err_nombre', 'Por favor escribe tu nombre o el de tu familia.')
    return
  }
  loading.value = true
  const { error: err } = await supabase.from('confirmaciones').insert([{ ...form }])
  loading.value = false
  if (err) {
    error.value = tr('rsvp_err_envio', 'Ocurrió un error al enviar. Inténtalo de nuevo.')
    return
  }
  done.value = true
}
</script>

<template>
  <!-- Confirmación enviada -->
  <transition name="fade" mode="out-in">
    <div v-if="done" key="done" class="rsvp__done">
      <p class="rsvp__done-mark">✦</p>
      <h3 class="rsvp__done-title">{{ tr('rsvp_gracias', '¡Gracias') }}, {{ form.nombre }}!</h3>
      <p class="rsvp__done-text">
        {{
          form.asistira
            ? tr('rsvp_ok_si', 'Hemos recibido tu confirmación. ¡No podemos esperar a celebrar contigo!')
            : tr('rsvp_ok_no', 'Lamentamos que no puedas acompañarnos. Gracias por avisarnos con cariño.')
        }}
      </p>
    </div>

    <form v-else key="form" class="rsvp" @submit.prevent="submit">
      <div class="field">
        <label class="field__label">{{ tr('rsvp_nombre', 'Nombre o familia *') }}</label>
        <input v-model="form.nombre" class="field__input" :placeholder="tr('rsvp_nombre_ph', 'Ej. Familia Torres')" />
      </div>

      <div class="field">
        <label class="field__label">{{ tr('rsvp_lado', '¿Invitado de…?') }}</label>
        <div class="choices">
          <button
            v-for="opt in [
              { v: 'novio', t: 'Ángel' },
              { v: 'novia', t: 'Goretti' },
            ]"
            :key="opt.v"
            type="button"
            class="choice"
            :class="{ 'choice--on': form.lado === opt.v }"
            @click="form.lado = opt.v as 'novio' | 'novia'"
          >
            {{ opt.t }}
          </button>
        </div>
      </div>

      <div class="field">
        <label class="field__label">{{ tr('rsvp_tel', 'WhatsApp / Teléfono') }}</label>
        <input v-model="form.telefono" class="field__input" placeholder="+52 449 000 0000" />
      </div>

      <div class="field">
        <label class="field__label">{{ tr('rsvp_asistir', '¿Asistirás?') }}</label>
        <div class="choices">
          <button
            type="button"
            class="choice"
            :class="{ 'choice--on': form.asistira }"
            @click="form.asistira = true"
          >
            {{ tr('rsvp_si', 'Sí, con gusto') }}
          </button>
          <button
            type="button"
            class="choice"
            :class="{ 'choice--on': !form.asistira }"
            @click="form.asistira = false"
          >
            {{ tr('rsvp_no', 'No podré') }}
          </button>
        </div>
      </div>

      <transition name="fade">
        <div v-if="form.asistira" class="field">
          <label class="field__label">{{ tr('rsvp_personas', 'Número de personas') }}</label>
          <input
            v-model.number="form.num_personas"
            type="number"
            min="1"
            max="20"
            class="field__input field__input--sm"
          />
        </div>
      </transition>

      <transition name="fade">
        <div v-if="form.asistira" class="field">
          <label class="field__label">{{ tr('rsvp_restriccion', 'Restricción alimentaria') }}</label>
          <input
            v-model="form.restriccion_alimentaria"
            class="field__input"
            :placeholder="tr('rsvp_restriccion_ph', 'Vegetariano, alergias, ninguna…')"
          />
        </div>
      </transition>

      <div class="field">
        <label class="field__label">{{ tr('rsvp_mensaje', 'Mensaje para los novios') }}</label>
        <textarea
          v-model="form.mensaje"
          class="field__input field__textarea"
          :placeholder="tr('rsvp_mensaje_ph', 'Un mensaje con cariño…')"
        ></textarea>
      </div>

      <p v-if="error" class="rsvp__error">{{ error }}</p>

      <button type="submit" class="rsvp__submit" :disabled="loading">
        {{ loading ? tr('rsvp_enviando', 'Enviando…') : tr('rsvp_btn', 'Confirmar asistencia') }}
      </button>
    </form>
  </transition>
</template>

<style scoped>
.rsvp {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  max-width: 32rem;
  margin-inline: auto;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field__label {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.7rem;
  color: var(--color-ink-soft);
}

.field__input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-hairline);
  padding: 0.7rem 0.1rem;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-ink);
  outline: none;
  transition: border-color 0.4s var(--ease-elegant);
}

.field__input::placeholder {
  color: color-mix(in srgb, var(--color-ink-soft) 55%, transparent);
}

.field__input:focus {
  border-bottom-color: var(--color-sage);
}

.field__input--sm {
  max-width: 7rem;
}

.field__textarea {
  resize: vertical;
  min-height: 5rem;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  padding: 0.8rem;
}

.field__textarea:focus {
  border-color: var(--color-sage);
}

.choices {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

/* Botón de selección con resorte físico (emilkowalski) */
.choice {
  flex: 1 1 8rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  background: transparent;
  color: var(--color-ink-soft);
  font-family: var(--font-body);
  font-size: 0.92rem;
  cursor: pointer;
  transition:
    transform 0.4s var(--ease-spring),
    border-color 0.3s var(--ease-elegant),
    color 0.3s var(--ease-elegant),
    background-color 0.3s var(--ease-elegant);
}

.choice:hover {
  transform: translateY(-1px);
  border-color: var(--color-sand);
}

.choice--on {
  background: var(--color-sage);
  border-color: var(--color-sage);
  color: #fff;
}

.choice:active {
  transform: scale(0.97);
}

.rsvp__submit {
  margin-top: 0.5rem;
  align-self: center;
  padding: 1rem 2.6rem;
  border: none;
  border-radius: 999px;
  background: var(--color-ink);
  color: var(--color-bone);
  font-family: var(--font-body);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.8rem;
  cursor: pointer;
  transition: transform 0.4s var(--ease-spring), opacity 0.3s;
}

.rsvp__submit:hover:not(:disabled) {
  transform: scale(1.03);
}

.rsvp__submit:active:not(:disabled) {
  transform: scale(0.97);
}

.rsvp__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp__error {
  color: #b3261e;
  font-size: 0.85rem;
  text-align: center;
}

.rsvp__done {
  text-align: center;
  max-width: 30rem;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-block: 2rem;
}

.rsvp__done-mark {
  color: var(--color-gold);
  font-size: 1.5rem;
  letter-spacing: 0.5em;
}

.rsvp__done-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 5vw, 2.6rem);
}

.rsvp__done-text {
  color: var(--color-ink-soft);
  line-height: 1.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s var(--ease-elegant);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
