-- ============================================================================
--  ESQUEMA DE BASE DE DATOS — Invitación "Ángel & Goretti"
--  Pégalo completo en:  Supabase → SQL Editor → New query → Run
--  Es re-ejecutable (no rompe si lo corres dos veces).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLA: invitados  (lista de invitados + control de entrada por QR)
-- ----------------------------------------------------------------------------
create table if not exists public.invitados (
  id                    uuid primary key default gen_random_uuid(),
  nombre                text not null,
  familia               text default '',
  num_pases             integer default 1,
  lado                  text,                          -- 'novio' | 'novia' | null
  token                 text unique default replace(gen_random_uuid()::text, '-', ''),
  invitacion_enviada    boolean default false,
  invitacion_enviada_at timestamptz,
  checked_in            boolean default false,
  checked_in_at         timestamptz,
  hora_entrada          text,
  created_at            timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 2. TABLA: confirmaciones  (RSVP que llena el público en la invitación)
-- ----------------------------------------------------------------------------
create table if not exists public.confirmaciones (
  id                     uuid primary key default gen_random_uuid(),
  nombre                 text not null,
  telefono               text,
  num_personas           integer default 1,
  asistira               boolean default true,
  restriccion_alimentaria text,
  mensaje                text,
  lado                   text,
  invitado_id            uuid references public.invitados(id) on delete set null,
  created_at             timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 3. TABLA: configuracion  (ajustes clave-valor: mesa de regalos, lugares, música)
-- ----------------------------------------------------------------------------
create table if not exists public.configuracion (
  id         uuid primary key default gen_random_uuid(),
  clave      text unique not null,   -- 'mesa_regalos' | 'venues' | 'musica_url'
  valor      text,                   -- JSON guardado como texto
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 4. TABLA: mensajes_regalo  (mensajes/aportaciones desde la mesa de regalos)
-- ----------------------------------------------------------------------------
create table if not exists public.mensajes_regalo (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  metodo     text,
  monto      text,
  mensaje    text,
  created_at timestamptz default now()
);

-- ============================================================================
--  SEGURIDAD (Row Level Security)
--  Regla general:
--   · El PÚBLICO solo puede: leer configuración, mandar su RSVP y su mensaje,
--     y ver las fotos. No puede leer la lista de invitados ni los RSVP ajenos.
--   · El ADMIN (usuario autenticado vía Supabase Auth) puede todo.
-- ============================================================================

alter table public.invitados       enable row level security;
alter table public.confirmaciones  enable row level security;
alter table public.configuracion   enable row level security;
alter table public.mensajes_regalo enable row level security;

-- ---- invitados: SOLO admin autenticado (datos sensibles + tokens de QR) ----
drop policy if exists "invitados_admin_all" on public.invitados;
create policy "invitados_admin_all" on public.invitados
  for all to authenticated using (true) with check (true);

-- ---- confirmaciones: público INSERTA su RSVP; admin lee/edita/borra --------
drop policy if exists "confirmaciones_public_insert" on public.confirmaciones;
create policy "confirmaciones_public_insert" on public.confirmaciones
  for insert to anon, authenticated with check (true);

drop policy if exists "confirmaciones_admin_read" on public.confirmaciones;
create policy "confirmaciones_admin_read" on public.confirmaciones
  for select to authenticated using (true);

drop policy if exists "confirmaciones_admin_update" on public.confirmaciones;
create policy "confirmaciones_admin_update" on public.confirmaciones
  for update to authenticated using (true) with check (true);

drop policy if exists "confirmaciones_admin_delete" on public.confirmaciones;
create policy "confirmaciones_admin_delete" on public.confirmaciones
  for delete to authenticated using (true);

-- ---- mensajes_regalo: público INSERTA; admin lee/borra --------------------
drop policy if exists "mensajes_public_insert" on public.mensajes_regalo;
create policy "mensajes_public_insert" on public.mensajes_regalo
  for insert to anon, authenticated with check (true);

drop policy if exists "mensajes_admin_read" on public.mensajes_regalo;
create policy "mensajes_admin_read" on public.mensajes_regalo
  for select to authenticated using (true);

drop policy if exists "mensajes_admin_delete" on public.mensajes_regalo;
create policy "mensajes_admin_delete" on public.mensajes_regalo
  for delete to authenticated using (true);

-- ---- configuracion: público LEE; admin escribe ---------------------------
drop policy if exists "config_public_read" on public.configuracion;
create policy "config_public_read" on public.configuracion
  for select to anon, authenticated using (true);

drop policy if exists "config_admin_write" on public.configuracion;
create policy "config_admin_write" on public.configuracion
  for all to authenticated using (true) with check (true);

-- ============================================================================
--  STORAGE: bucket "galeria" (fotos de la pareja y de la galería)
--  Público puede VER; solo admin autenticado puede subir/borrar.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('galeria', 'galeria', true)
on conflict (id) do nothing;

drop policy if exists "galeria_public_read" on storage.objects;
create policy "galeria_public_read" on storage.objects
  for select using (bucket_id = 'galeria');

drop policy if exists "galeria_admin_insert" on storage.objects;
create policy "galeria_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'galeria');

drop policy if exists "galeria_admin_update" on storage.objects;
create policy "galeria_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'galeria');

drop policy if exists "galeria_admin_delete" on storage.objects;
create policy "galeria_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'galeria');

-- ============================================================================
--  SEMILLA opcional: filas de configuración vacías para que la app no truene
-- ============================================================================
insert into public.configuracion (clave, valor) values
  ('mesa_regalos', '{"links":[],"tarjetas":[]}'),
  ('venues', '{}'),
  ('musica_url', '{}')
on conflict (clave) do nothing;

-- ¡Listo! 4 tablas + 1 bucket + seguridad RLS configurada.
