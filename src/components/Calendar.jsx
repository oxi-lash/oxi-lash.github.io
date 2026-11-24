import { MONTHS, WEEKDAYS, dayStr } from '../lib/format'

// month — Date на 1-е число; marks — Set дат 'YYYY-MM-DD' со свободными слотами.
export default function Calendar({ month, setMonth, selected, marks, minDay, maxDay, onPick }) {
  const y = month.getFullYear(), m = month.getMonth()
  const offset = (new Date(y, m, 1).getDay() + 6) % 7 // неделя с понедельника
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const prevLast = new Date(y, m, 0)
  const canPrev = dayStr(prevLast.getFullYear(), prevLast.getMonth(), prevLast.getDate()) >= minDay
  const canNext = dayStr(y, m + 1 > 11 ? 0 : m + 1, 1) <= maxDay && new Date(y, m + 1, 1) <= new Date(maxDay)
  const move = (n) => setMonth(new Date(y, m + n, 1))

  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => move(-1)} disabled={!canPrev} aria-label="Предыдущий месяц"
          className="h-10 w-10 rounded-xl text-2xl text-rose-400 disabled:text-stone-200">‹</button>
        <div className="font-display text-lg text-stone-800">{MONTHS[m]} {y}</div>
        <button onClick={() => move(1)} disabled={!canNext} aria-label="Следующий месяц"
          className="h-10 w-10 rounded-xl text-2xl text-rose-400 disabled:text-stone-200">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => <div key={w} className="py-1 text-xs font-bold text-stone-300">{w}</div>)}
        {Array.from({ length: offset }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1, ds = dayStr(y, m, d)
          const disabled = ds < minDay || ds > maxDay
          const has = marks.has(ds), sel = ds === selected
          return (
            <button
              key={ds} disabled={disabled} onClick={() => onPick(ds)}
              className={`relative h-11 rounded-xl text-sm font-semibold transition active:scale-95 ${
                sel ? 'bg-rose-400 text-white shadow-md shadow-rose-200'
                : disabled ? 'text-stone-200'
                : has ? 'border border-rose-200 bg-rose-50 text-stone-700'
                : 'text-stone-400'}`}
            >
              {d}
              {has && !sel && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rose-400" />}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-center text-xs text-stone-300">Дни с точкой — есть свободные окошки</p>
    </div>
  )
}
