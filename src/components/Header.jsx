import { MASTER } from '../config'

export default function Header() {
  return (
    <header className="pb-6 pt-8 text-center">
      <div className="mx-auto mb-4 grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-rose-200 to-rose-300 shadow-lg shadow-rose-200 ring-4 ring-white">
        {MASTER.photoUrl
          ? <img src={MASTER.photoUrl} alt={MASTER.name} className="h-full w-full object-cover" />
          : <span className="text-4xl">🌸</span>}
      </div>
      <h1 className="font-display text-3xl text-stone-800">{MASTER.name}</h1>
      <p className="mt-1 text-sm text-stone-500">{MASTER.tagline}</p>
      <a
        href={MASTER.vkWrite} target="_blank" rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0077FF] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition active:scale-95"
      >
        💬 Написать во ВКонтакте
      </a>
      {MASTER.address && <p className="mt-3 text-xs text-stone-400">📍 {MASTER.address}</p>}
    </header>
  )
}
