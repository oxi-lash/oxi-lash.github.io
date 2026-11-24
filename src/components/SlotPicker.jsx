import { hourLabel } from '../lib/format'
import { Empty } from './ui'

export default function SlotPicker({ slots, selectedId, onSelect }) {
  if (!slots.length) {
    return <Empty>На этот день свободных окошек нет 🌷<br />Попробуйте другую дату.</Empty>
  }
  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((s) => (
        <button
          key={s.id} onClick={() => onSelect(s)}
          className={`rounded-2xl py-3.5 text-base font-bold transition active:scale-95 ${
            s.id === selectedId
              ? 'bg-rose-400 text-white shadow-md shadow-rose-200'
              : 'border border-rose-200 bg-white text-stone-700'}`}
        >
          {hourLabel(s.hour)}
        </button>
      ))}
    </div>
  )
}
