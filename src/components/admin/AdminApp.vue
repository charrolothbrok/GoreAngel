<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { supabase } from '../../lib/supabase'
import PortadaManager from './PortadaManager.vue'
import InvitadosManager from './InvitadosManager.vue'
import ConfirmacionesManager from './ConfirmacionesManager.vue'
import MensajesManager from './MensajesManager.vue'
import FotosManager from './FotosManager.vue'
import LugaresManager from './LugaresManager.vue'
import ItinerarioManager from './ItinerarioManager.vue'
import VestimentaManager from './VestimentaManager.vue'
import RegalosManager from './RegalosManager.vue'
import MusicaManager from './MusicaManager.vue'

const session = ref<unknown>(null)
const cargando = ref(true)

// Login
const email = ref('')
const password = ref('')
const loginError = ref('')
const entrando = ref(false)

const tabs = [
  { id: 'portada', label: 'Portada', comp: PortadaManager },
  { id: 'invitados', label: 'Invitados', comp: InvitadosManager },
  { id: 'confirmaciones', label: 'Confirmaciones', comp: ConfirmacionesManager },
  { id: 'mensajes', label: 'Mensajes', comp: MensajesManager },
  { id: 'fotos', label: 'Fotos', comp: FotosManager },
  { id: 'lugares', label: 'Lugares', comp: LugaresManager },
  { id: 'itinerario', label: 'Itinerario', comp: ItinerarioManager },
  { id: 'vestimenta', label: 'Vestimenta', comp: VestimentaManager },
  { id: 'regalos', label: 'Regalos', comp: RegalosManager },
  { id: 'musica', label: 'Música', comp: MusicaManager },
] as const

const activeTab = ref<(typeof tabs)[number]['id']>('invitados')
const activeComp = shallowRef(InvitadosManager)

function selectTab(id: (typeof tabs)[number]['id']) {
  activeTab.value = id
  activeComp.value = tabs.find((t) => t.id === id)!.comp
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session
  cargando.value = false
  supabase.auth.onAuthStateChange((_event, s) => {
    session.value = s
  })
})

async function login() {
  loginError.value = ''
  entrando.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })
  entrando.value = false
  if (error) {
    loginError.value = 'Correo o contraseña incorrectos.'
  }
}

async function logout() {
  await supabase.auth.signOut()
}
</script>

<template>
  <div v-if="cargando" class="admin-loading">
    <span class="spinner" aria-hidden="true"></span>
  </div>

  <!-- LOGIN -->
  <div v-else-if="!session" class="login">
    <form class="login__card" @submit.prevent="login">
      <p class="eyebrow">Panel privado</p>
      <h1 class="login__title">Ángel &amp; Goretti</h1>
      <p class="login__sub">Acceso solo para los novios</p>

      <label class="field">
        <span class="field__label">Correo</span>
        <input v-model="email" type="email" class="field__input" autocomplete="email" />
      </label>

      <label class="field">
        <span class="field__label">Contraseña</span>
        <input
          v-model="password"
          type="password"
          class="field__input"
          autocomplete="current-password"
        />
      </label>

      <p v-if="loginError" class="login__error">{{ loginError }}</p>

      <button type="submit" class="login__btn" :disabled="entrando">
        {{ entrando ? 'Entrando…' : 'Ingresar' }}
      </button>
    </form>
  </div>

  <!-- PANEL -->
  <div v-else class="admin">
    <header class="admin__top">
      <div>
        <p class="eyebrow">Panel de administración</p>
        <h1 class="admin__title">Ángel &amp; Goretti · 22 Ago 2026</h1>
      </div>
      <button class="admin__logout" @click="logout">Salir</button>
    </header>

    <nav class="admin__tabs">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="tab"
        :class="{ 'tab--on': activeTab === t.id }"
        @click="selectTab(t.id)"
      >
        {{ t.label }}
      </button>
    </nav>

    <main class="admin__body">
      <component :is="activeComp" />
    </main>
  </div>
</template>

<style scoped>
.admin-loading,
.login {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.spinner {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 2px solid var(--color-hairline);
  border-top-color: var(--color-sage);
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Login */
.login__card {
  width: 100%;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  padding: clamp(2rem, 6vw, 3rem);
  border: 1px solid var(--color-hairline);
}

.login__title {
  font-family: var(--font-display);
  font-size: 2rem;
  margin-top: 0.3rem;
}

.login__sub {
  color: var(--color-ink-soft);
  font-size: 0.85rem;
  margin-bottom: 0.6rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
}

.field__label {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.66rem;
  color: var(--color-ink-soft);
}

.field__input {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-hairline);
  padding: 0.6rem 0.1rem;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-ink);
  outline: none;
  transition: border-color 0.3s var(--ease-elegant);
}
.field__input:focus {
  border-bottom-color: var(--color-sage);
}

.login__error {
  color: #b3261e;
  font-size: 0.82rem;
}

.login__btn {
  margin-top: 0.5rem;
  padding: 0.9rem;
  border: none;
  border-radius: 999px;
  background: var(--color-ink);
  color: var(--color-bone);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.78rem;
  cursor: pointer;
  transition: transform 0.4s var(--ease-spring), opacity 0.3s;
}
.login__btn:hover:not(:disabled) {
  transform: scale(1.02);
}
.login__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Panel */
.admin {
  min-height: 100svh;
}

.admin__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem clamp(1rem, 4vw, 2.5rem);
  border-bottom: 1px solid var(--color-hairline);
  flex-wrap: wrap;
}

.admin__title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  margin-top: 0.2rem;
}

.admin__logout {
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  padding: 0.5rem 1.2rem;
  font-size: 0.8rem;
  color: var(--color-ink);
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s;
}
.admin__logout:hover {
  border-color: var(--color-sage);
  color: var(--color-sage);
}

.admin__tabs {
  display: flex;
  gap: 0.3rem;
  padding: 0 clamp(1rem, 4vw, 2.5rem);
  border-bottom: 1px solid var(--color-hairline);
  overflow-x: auto;
}

.tab {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 1rem 1.1rem;
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: var(--color-ink-soft);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.3s, border-color 0.3s;
}
.tab--on {
  color: var(--color-ink);
  border-bottom-color: var(--color-sage);
}

.admin__body {
  padding: clamp(1.5rem, 4vw, 2.5rem);
  max-width: 60rem;
  margin-inline: auto;
}
</style>
