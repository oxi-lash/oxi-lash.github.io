-- ============================================================
-- Lash Booking: схема Supabase. Выполнить в SQL Editor целиком.
-- ============================================================

-- 1) Услуги
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 100),
  price_rub    integer not null check (price_rub >= 0),
  duration_min integer not null check (duration_min > 0),
  sort         integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 2) Окошки: строка = один час конкретного дня
create table if not exists public.slots (
  id         uuid primary key default gen_random_uuid(),
  day        date not null,
  hour       smallint not null check (hour between 0 and 23),
  status     text not null default 'free' check (status in ('free','booked')),
  created_at timestamptz not null default now(),
  unique (day, hour)
);
create index if not exists slots_day_idx on public.slots (day);

-- 3) Записи. Цена/название услуги «сфотографированы» в момент записи,
--    чтобы изменение прайса не ломало историю.
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  slot_id       uuid not null references public.slots (id),
  service_id    uuid references public.services (id),
  client_name   text not null,
  phone         text not null,
  vk_link       text not null default '',
  service_title text not null,
  price_rub     integer not null,
  duration_min  integer not null,
  status        text not null default 'active' check (status in ('active','cancelled')),
  created_at    timestamptz not null default now()
);
create unique index if not exists one_active_booking_per_slot
  on public.bookings (slot_id) where status = 'active';

-- 4) RLS — вся безопасность здесь (anon-ключ публичный!)
alter table public.services enable row level security;
alter table public.slots    enable row level security;
alter table public.bookings enable row level security;

create policy services_read_active on public.services
  for select to anon using (is_active);
create policy services_admin_all on public.services
  for all to authenticated using (true) with check (true);

create policy slots_read_all on public.slots
  for select to anon using (true);          -- в слотах нет персональных данных
create policy slots_admin_all on public.slots
  for all to authenticated using (true) with check (true);

-- bookings: у anon НЕТ политик => ни чтения, ни записи напрямую.
create policy bookings_admin_all on public.bookings
  for all to authenticated using (true) with check (true);

-- 4.5) Базовые гранты. RLS фильтрует строки, но сами права на таблицы
--      тоже нужны: без них PostgREST вернёт «permission denied for table …».
--      У anon — только чтение услуг и окошек, у authenticated — полный доступ.
grant usage on schema public to anon, authenticated;
grant select on public.services to anon;
grant select on public.slots    to anon;
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.slots    to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;

-- 5) Атомарная запись клиента (вызывается без логина)
create or replace function public.book_slot(
  p_slot_id uuid, p_service_id uuid,
  p_name text, p_phone text, p_vk text default ''
) returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_slot    public.slots%rowtype;
  v_service public.services%rowtype;
  v_booking public.bookings%rowtype;
begin
  if char_length(trim(coalesce(p_name,''))) < 2 then
    raise exception 'NAME_REQUIRED';
  end if;
  if char_length(regexp_replace(coalesce(p_phone,''), '\D', '', 'g')) < 10 then
    raise exception 'PHONE_REQUIRED';
  end if;

  -- UPDATE ... WHERE status='free' — атомарная защита от двойной брони
  update public.slots set status = 'booked'
   where id = p_slot_id and status = 'free'
  returning * into v_slot;
  if not found then
    raise exception 'SLOT_TAKEN';
  end if;

  select * into v_service from public.services
   where id = p_service_id and is_active;
  if not found then
    update public.slots set status = 'free' where id = p_slot_id;
    raise exception 'SERVICE_NOT_FOUND';
  end if;

  insert into public.bookings
    (slot_id, service_id, client_name, phone, vk_link,
     service_title, price_rub, duration_min)
  values
    (v_slot.id, v_service.id, left(trim(p_name),100), left(trim(p_phone),30),
     left(trim(coalesce(p_vk,'')),200),
     v_service.title, v_service.price_rub, v_service.duration_min)
  returning * into v_booking;

  return json_build_object(
    'booking_id', v_booking.id,
    'day', v_slot.day, 'hour', v_slot.hour,
    'service_title', v_service.title,
    'price_rub', v_service.price_rub,
    'duration_min', v_service.duration_min,
    'client_name', v_booking.client_name,
    'phone', v_booking.phone
  );
end;
$$;

revoke execute on function public.book_slot(uuid,uuid,text,text,text) from public;
grant  execute on function public.book_slot(uuid,uuid,text,text,text) to anon, authenticated;

-- 6) Отмена записи мастером: запись → cancelled, окошко → free
create or replace function public.admin_cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare v_slot_id uuid;
begin
  update public.bookings set status = 'cancelled'
   where id = p_booking_id and status = 'active'
  returning slot_id into v_slot_id;
  if not found then
    raise exception 'BOOKING_NOT_FOUND';
  end if;
  update public.slots set status = 'free' where id = v_slot_id;
end;
$$;

revoke execute on function public.admin_cancel_booking(uuid) from public, anon;
grant  execute on function public.admin_cancel_booking(uuid) to authenticated;

-- 7) Демо-данные (отредактируйте под себя)
insert into public.services (title, price_rub, duration_min, sort) values
  ('Классическое наращивание', 2500, 120, 1),
  ('Объём 2D',                 3000, 150, 2),
  ('Объём 3D',                 3500, 180, 3),
  ('Снятие ресниц',             500,  30, 4);

insert into public.slots (day, hour)
select current_date + 1, h from generate_series(10, 19) as h
on conflict (day, hour) do nothing;
