// Даты, рубли, телефон. Чистые функции, без React.
import { TIMEZONE } from '../config'

export const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
export const WEEKDAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

export const pad = (n) => String(n).padStart(2, '0')
export const dayStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}` // m: 0–11

const tzParts = () => {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (t) => Number(parts.find((p) => p.type === t).value)
  return { y: get('year'), m: get('month') - 1, d: get('day'), h: get('hour') }
}
export const todayStr = () => { const { y, m, d } = tzParts(); return dayStr(y, m, d) }
export const nowHour = () => tzParts().h

export const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const shiftDay = (s, n) => { const t = parseDay(s); t.setDate(t.getDate() + n); return dayStr(t.getFullYear(), t.getMonth(), t.getDate()) }
export const monthRange = (month) => {
  const y = month.getFullYear(), m = month.getMonth()
  return { from: dayStr(y, m, 1), to: dayStr(y, m, new Date(y, m + 1, 0).getDate()) }
}
export const fmtDay = (s) =>
  new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }).format(parseDay(s))
export const hourLabel = (h) => `${pad(h)}:00`
export const rub = (n) => `${new Intl.NumberFormat('ru-RU').format(n)} ₽`
export const duration = (min) =>
  min < 60 ? `${min} мин` : `${Math.floor(min / 60)} ч${min % 60 ? ` ${min % 60} мин` : ''}`

export const phoneDigits = (v) => v.replace(/\D/g, '')
export const fmtPhoneInput = (value) => {
  let d = phoneDigits(value)
  if (!d) return ''
  if (d[0] === '8') d = '7' + d.slice(1)
  if (d[0] !== '7') d = '7' + d
  d = d.slice(0, 11)
  let out = '+7'
  if (d.length > 1) out += ` (${d.slice(1, 4)}`
  if (d.length > 4) out += `) ${d.slice(4, 7)}`
  if (d.length > 7) out += `-${d.slice(7, 9)}`
  if (d.length > 9) out += `-${d.slice(9, 11)}`
  return out
}
export const vkHref = (link) => (/^https?:\/\//i.test(link) ? link : `https://${link}`)
