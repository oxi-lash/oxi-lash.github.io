import { rub, duration } from '../lib/format'

export default function ServicePicker({ services, selectedId, onSelect }) {
  return (
    <div className="space-y-3">
      {services.map((s) => {
        const active = s.id === selectedId
        return (
          <button
            key={s.id} onClick={() => onSelect(s)}
            className={`w-full rounded-3xl border p-4 text-left transition active:scale-[.99] ${
              active ? 'border-rose-400 bg-rose-50 ring-4 ring-rose-100' : 'border-rose-100 bg-white hover:border-rose-200'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-stone-800">{s.title}</div>
                <div className="mt-0.5 text-sm text-stone-400">⏱ {duration(s.duration_min)}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg text-rose-500">{rub(s.price_rub)}</div>
                {active && <div className="text-xs font-bold text-rose-400">выбрано ✓</div>}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
