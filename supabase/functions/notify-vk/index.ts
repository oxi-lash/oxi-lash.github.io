// Supabase Edge Function (Deno). Вызывается Database Webhook'ом
// при INSERT в public.bookings и шлёт мастеру сообщение от имени сообщества.
// Secrets: VK_TOKEN, VK_DOMAIN (или VK_PEER_ID), WEBHOOK_SECRET, ADMIN_URL (опц.)
import { createClient } from 'npm:@supabase/supabase-js@2'

const MONTHS = ['января','февраля','марта','апреля','мая','июня',
                'июля','августа','сентября','октября','ноября','декабря']

Deno.serve(async (req) => {
  // Простая защита: вебхук обязан прислать заголовок x-webhook-secret
  const secret = Deno.env.get('WEBHOOK_SECRET')
  if (secret && req.headers.get('x-webhook-secret') !== secret) {
    return new Response('forbidden', { status: 401 })
  }

  let payload: { type?: string; table?: string; record?: Record<string, unknown> }
  try { payload = await req.json() } catch { return new Response('bad json', { status: 400 }) }
  if (payload.type !== 'INSERT' || payload.table !== 'bookings' || !payload.record) {
    return Response.json({ skipped: true })
  }
  const b = payload.record as Record<string, string>

  // Дату/время слота достаём service-ключом (он живёт только здесь, не в браузере)
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: slot } = await db.from('slots').select('day,hour').eq('id', b.slot_id).single()

  let when = 'дата уточняется'
  if (slot) {
    const [y, m, d] = String(slot.day).split('-').map(Number)
    when = `${d} ${MONTHS[m - 1]} ${y}, ${String(slot.hour).padStart(2, '0')}:00`
  }

  const message = [
    '💖 Новая запись!', '',
    `👤 ${b.client_name}`,
    `📞 ${b.phone}`,
    b.vk_link ? `🔗 ${b.vk_link}` : null,
    `💅 ${b.service_title} — ${b.price_rub} ₽ (${b.duration_min} мин)`,
    `📅 ${when}`,
    Deno.env.get('ADMIN_URL') ? `\nПанель: ${Deno.env.get('ADMIN_URL')}` : null,
  ].filter(Boolean).join('\n')

  // random_id обязан помещаться в int32 (требование VK API)
  const params = new URLSearchParams({
    access_token: Deno.env.get('VK_TOKEN')!,
    v: '5.199',
    random_id: String(Date.now() % 2147483647),
    message,
  })
  const peerId = Deno.env.get('VK_PEER_ID')
  if (peerId) params.set('peer_id', peerId)
  else params.set('domain', Deno.env.get('VK_DOMAIN') ?? '')

  const res = await fetch('https://api.vk.com/method/messages.send', { method: 'POST', body: params })
  const json = await res.json()
  if (json.error) {
    console.error('VK error:', json.error) // 901 = мастер не разрешил сообщения сообществу
    return Response.json({ ok: false, vk_error: json.error })
  }
  return Response.json({ ok: true, message_id: json.response })
})
