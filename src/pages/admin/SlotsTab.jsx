import { useEffect, useState } from 'react'
import { WORK_HOURS } from '../../config'
import { listSlotsRange, addSlot, removeSlot, humanError } from '../../lib/api'
import { todayStr, hourLabel } from '../../lib/format'
import { Spinner, Err } from '../../components/ui'

export default function SlotsTab() {
  const [day, setDay] = useState(todayStr())
  const [slots, setSlots] = useState(null)
  const [busyHour, setBusyHour] = useState(null)
  const [err, setErr] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    setSlots(null)
    listSlotsRange(day, day).then(setSlots).catch((e) => { setErr(humanError(e)); setSlots([]) })
  }, [day, reload])

  const byHour = new Map((slots || []).map((s) => [s.hour, s]))
  const tap = async (hour) => {
    const s = byHour.get(hour)
    if (s?.status === 'booked') return
    setBusyHour(hour); setErr('')
    try {
      if (s) await removeSlot(s.id)
      else await addSlot(day, hour)
      setReload((k) => k + 1)
    } catch (e) { setErr(humanError(e)) }
    finally { setBusyHour(null) }
  }

  const free = (slots || []).filter((s) => s.status === 'free').length
  const booked = (slots || []).filter((s) => s.status === 'booked').length

  return (
    <div>
      <input type="date" value={day} min={todayStr()}
        onChange={(e) => e.target.value && setDay(e.target.value)}
        className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3.5 text-lg font-bold text-stone-800 outline-none focus:border-rose-400" />
      {slots === null ? <div className="flex justify-center py-10 text-rose-300"><Spinner /></div> : (
        <>
          <p className="mt-3 text-sm font-bold text-stone-400">Свободно: {free} · Занято: {booked}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {WORK_HOURS.map((h) => {
              const s = byHour.get(h)
              const isBooked = s?.status === 'booked'
              const isFree = Boolean(s) && !isBooked
              return (
                <button key={h} disabled={isBooked || busyHour === h} onClick={() => tap(h)}
                  className={`rounded-2xl py-4 text-lg font-bold transition active:scale-95 disabled:active:scale-100 ${
                    isBooked ? 'bg-stone-100 text-stone-400'
                    : isFree ? 'bg-rose-400 text-white shadow-md shadow-rose-200'
                    : 'border-2 border-dashed border-rose-200 bg-white text-stone-400'}`}>
                  {isBooked ? '🔒 ' : isFree ? '✓ ' : '+ '}{hourLabel(h)}
                </button>
              )
            })}
          </div>
          <div className="mt-3"><Err>{err}</Err></div>
          <p className="mt-4 text-sm leading-relaxed text-stone-400">
            Тап по «+» — открыть окошко. Тап по розовому — закрыть его.
            🔒 — час занят записью; он освободится после отмены во вкладке «Записи».
          </p>
        </>
      )}
    </div>
  )
}
