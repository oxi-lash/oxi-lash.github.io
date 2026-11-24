// Все обращения к Supabase — только здесь.
import { supabase } from './supabase'

const db = () => {
  if (!supabase) throw new Error('Supabase не настроен: заполните ключи (.env / секреты GitHub)')
  return supabase
}
const unwrap = ({ data, error }) => { if (error) throw error; return data }

// ---------- клиент ----------
export const listServices = async () =>
  unwrap(await db().from('services').select('*').order('sort').order('created_at'))

export const listSlotsRange = async (from, to) =>
  unwrap(await db().from('slots').select('id,day,hour,status')
    .gte('day', from).lte('day', to).order('day').order('hour'))

export const bookSlot = async ({ slotId, serviceId, name, phone, vk }) =>
  unwrap(await db().rpc('book_slot', {
    p_slot_id: slotId, p_service_id: serviceId,
    p_name: name, p_phone: phone, p_vk: vk || '',
  }))

// ---------- админ ----------
export const signInAdmin = async (email, pin) =>
  unwrap(await db().auth.signInWithPassword({ email, password: pin }))
export const signOutAdmin = async () => { await db().auth.signOut() }

export const listBookings = async () =>
  unwrap(await db().from('bookings').select('*, slots(day,hour)')
    .eq('status', 'active').order('created_at', { ascending: false }))

export const cancelBooking = async (id) =>
  unwrap(await db().rpc('admin_cancel_booking', { p_booking_id: id }))

export const addSlot = async (day, hour) => {
  const { error } = await db().from('slots').insert({ day, hour })
  if (error && error.code !== '23505') throw error // 23505 = уже существует, не страшно
}
export const removeSlot = async (id) =>
  unwrap(await db().from('slots').delete().eq('id', id).eq('status', 'free'))

export const saveService = async (s) => {
  const row = {
    title: s.title.trim(),
    price_rub: Number(s.price_rub),
    duration_min: Number(s.duration_min),
    is_active: Boolean(s.is_active),
    sort: Number(s.sort || 0),
  }
  if (s.id) row.id = s.id
  return unwrap(await db().from('services').upsert(row).select().single())
}

// ---------- человеческие ошибки ----------
export const humanError = (e) => {
  const m = e?.message || String(e)
  if (m.includes('SLOT_TAKEN')) return 'Это окошко только что заняли 😔 Выберите другое время.'
  if (m.includes('NAME_REQUIRED')) return 'Укажите имя.'
  if (m.includes('PHONE_REQUIRED')) return 'Проверьте номер телефона.'
  if (m.includes('SERVICE_NOT_FOUND')) return 'Услуга недоступна, обновите страницу.'
  if (m.includes('Invalid login')) return 'Неверный пин-код.'
  if (m.includes('Failed to fetch')) return 'Нет связи с сервером. Проверьте интернет.'
  return 'Что-то пошло не так. Попробуйте ещё раз.'
}
