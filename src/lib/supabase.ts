import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.PUBLIC_SUPABASE_URL
const key = import.meta.env.PUBLIC_SUPABASE_KEY

if (!url || !key) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. Revisa tu archivo .env (PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_KEY).'
  )
}

export const supabase = createClient(url, key)
