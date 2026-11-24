import { useEffect, useState } from 'react'
import { listBookings, cancelBooking, humanError } from '../../lib/api'
import { fmtDay, hourLabel, rub, duration, todayStr, vkHref } from '../../lib/format'
import { Btn, Card, Empty, Spinner, Err } from '../../components/ui'

export default function BookingsTab() {
  const [items, setItems] = useState(null)
  const [err, setErr] = useState('')
  const [reload, setReload] = useState(0)
  const today = todayStr()

  useEffect(() => {
    listBookings()
      .then((rows) => {
        const flat = rows.map((b) => ({ ...b, day: b.slots.day, hour: b.slots.hour }))
        flat.sort((a, b) =>
          (a.day + String(a.hour).padStart(2, '0')).localeCompare(b.day + String(b.hour).padStart(2, '0')))
        setItems(flat)
      })
      .catch((e) => { setErr(humanError(e)); setItems([]) })
  }, [reload])

  const cancel = async (b) => {
    if (!window.confirm(`Отменить запись «${b.client_name}»? Окошко снова станет свободным.`)) return
    try { await cancelBooking(b.id); setReload((k) => k + 1) }
    catch (e) { alert(humanError(e)) }
  }

  if (items === null) return <div className="flex justify-center py-10 text-rose-300"><Spinner /></div>
  const days = [...new Set(items.map((b) => b.day))]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-stone-400">Активных: {items.length}</p>
        <Btn variant="ghost" className="px-4 py-2 text-sm" onClick={() => setReload((k) => k + 1)}>↻ Обновить</Btn>
      </div>
      <Err>{err}</Err>
      {!items.length && <Empty>Записей пока нет 🌷<br />Откройте окошки во вкладке «Окошки».</Empty>}
      {days.map((day) => (
        <div key={day}>
          <h3 className="mb-2 mt-5 font-display text-lg capitalize text-stone-700">
            {fmtDay(day)} {day < today && <span className="font-sans text-xs font-normal text-stone-300">· прошла</span>}
          </h3>
          <div className="space-y-3">
            {items.filter((b) => b.day === day).map((b) => (
              <Card key={b.id} className={day < today ? 'opacity-60' : ''}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-extrabold text-stone-800">{hourLabel(b.hour)} · {b.client_name}</div>
                    <div className="mt-0.5 text-sm text-stone-500">{b.service_title} · {rub(b.price_rub)} · {duration(b.duration_min)}</div>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold">
                      <a href={`tel:${b.phone}`} className="text-rose-500">📞 {b.phone}</a>
                      {b.vk_link && <a href={vkHref(b.vk_link)} target="_blank" rel="noreferrer" className="text-[#0077FF]">💬 ВК</a>}
                    </div>
                  </div>
                  <Btn variant="danger" className="shrink-0 px-3 py-2 text-sm" onClick={() => cancel(b)}>Отменить</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
