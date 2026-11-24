import { useEffect, useState } from 'react'
import { supabase, isConfigured } from '../../lib/supabase'
import { signOutAdmin } from '../../lib/api'
import { Spinner, Err } from '../../components/ui'
import Login from './Login'
import BookingsTab from './BookingsTab'
import SlotsTab from './SlotsTab'
import ServicesTab from './ServicesTab'

const TABS = [
  { id: 'bookings', icon: '📋', label: 'Записи' },
  { id: 'slots', icon: '🕐', label: 'Окошки' },
  { id: 'services', icon: '💅', label: 'Услуги' },
]

export default function AdminPage() {
  const [session, setSession] = useState(undefined) // undefined = проверяем
  const [tab, setTab] = useState('bookings')

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (!isConfigured) return <div className="mx-auto max-w-md p-6"><Err>Supabase не настроен: заполните ключи.</Err></div>
  if (session === undefined) return <div className="flex justify-center pt-24 text-rose-300"><Spinner /></div>
  if (!session) return <Login />

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl text-stone-800">Панель мастера</h1>
        <button onClick={signOutAdmin} className="rounded-xl px-3 py-2 text-sm font-bold text-stone-400">Выйти</button>
      </div>
      {tab === 'bookings' && <BookingsTab />}
      {tab === 'slots' && <SlotsTab />}
      {tab === 'services' && <ServicesTab />}

      <nav className="fixed inset-x-0 bottom-0 border-t border-rose-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 py-3 text-xs font-bold ${tab === t.id ? 'text-rose-500' : 'text-stone-400'}`}>
              <span className="text-2xl">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
