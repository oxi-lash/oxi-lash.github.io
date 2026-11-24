import { useEffect, useState } from 'react'
import { listServices, saveService, humanError } from '../../lib/api'
import { rub, duration } from '../../lib/format'
import { Btn, Card, Field, Empty, Spinner, Err } from '../../components/ui'

const blank = { id: null, title: '', price_rub: '', duration_min: 120, is_active: true }

function Editor({ draft, onDone }) {
  const [s, setS] = useState(draft)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }))

  const save = async () => {
    if (!s.title.trim()) return setErr('Введите название.')
    if (!(Number(s.price_rub) >= 0) || !(Number(s.duration_min) > 0)) return setErr('Цена и длительность должны быть числами.')
    setBusy(true); setErr('')
    try { await saveService(s); onDone(true) }
    catch (e) { setErr(humanError(e)) }
    finally { setBusy(false) }
  }

  return (
    <Card className="space-y-3 border-rose-300">
      <Field label="Название" value={s.title} onChange={(e) => set('title', e.target.value)} placeholder="Объём 2D" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Цена, ₽" inputMode="numeric" value={s.price_rub}
          onChange={(e) => set('price_rub', e.target.value.replace(/\D/g, ''))} />
        <Field label="Длительность, мин" inputMode="numeric" value={s.duration_min}
          onChange={(e) => set('duration_min', e.target.value.replace(/\D/g, ''))} />
      </div>
      <label className="flex items-center gap-3 text-sm font-semibold text-stone-600">
        <input type="checkbox" checked={s.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-5 w-5 accent-rose-400" />
        Показывать клиентам
      </label>
      <Err>{err}</Err>
      <div className="flex gap-2">
        <Btn className="flex-1" disabled={busy} onClick={save}>{busy ? 'Сохраняю…' : 'Сохранить'}</Btn>
        <Btn variant="ghost" onClick={() => onDone(false)}>Отмена</Btn>
      </div>
    </Card>
  )
}

export default function ServicesTab() {
  const [items, setItems] = useState(null)
  const [editingId, setEditingId] = useState(null) // id услуги | 'new' | null
  const [err, setErr] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    listServices().then(setItems).catch((e) => { setErr(humanError(e)); setItems([]) })
  }, [reload])

  const done = (saved) => { setEditingId(null); if (saved) setReload((k) => k + 1) }

  if (items === null) return <div className="flex justify-center py-10 text-rose-300"><Spinner /></div>
  return (
    <div className="space-y-3">
      <Err>{err}</Err>
      {editingId !== 'new' && <Btn variant="soft" className="w-full" onClick={() => setEditingId('new')}>＋ Добавить услугу</Btn>}
      {editingId === 'new' && <Editor draft={blank} onDone={done} />}
      {!items.length && editingId !== 'new' && <Empty>Добавьте первую услугу 💅</Empty>}
      {items.map((s) => editingId === s.id
        ? <Editor key={s.id} draft={s} onDone={done} />
        : (
          <Card key={s.id} className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-stone-800">
                {s.title}
                {!s.is_active && <span className="ml-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-400">скрыта</span>}
              </div>
              <div className="mt-0.5 text-sm text-stone-500">{rub(s.price_rub)} · {duration(s.duration_min)}</div>
            </div>
            <Btn variant="ghost" className="shrink-0 px-4 py-2 text-sm" onClick={() => setEditingId(s.id)}>Изменить</Btn>
          </Card>
        ))}
      <p className="pt-2 text-xs leading-relaxed text-stone-300">
        Удаление не предусмотрено: скрывайте услугу галочкой — история записей останется целой.
      </p>
    </div>
  )
}
