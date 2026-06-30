import { supabase } from './supabase'

/** Lee una clave de configuración y la devuelve como objeto. */
export async function getConfig<T = Record<string, any>>(clave: string): Promise<T> {
  const { data } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', clave)
    .single()
  if (!data?.valor) return {} as T
  try {
    return JSON.parse(data.valor) as T
  } catch {
    return {} as T
  }
}

/** Guarda (upsert) una clave de configuración como JSON. */
export async function saveConfig(clave: string, valor: unknown) {
  return supabase
    .from('configuracion')
    .upsert({ clave, valor: JSON.stringify(valor) }, { onConflict: 'clave' })
}

/** Sube una imagen al bucket galeria bajo un prefijo y devuelve su URL pública. */
export async function uploadImagen(file: File, prefijo: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${prefijo}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('galeria')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  return supabase.storage.from('galeria').getPublicUrl(path).data.publicUrl
}
