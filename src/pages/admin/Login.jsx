import { useState } from 'react'
import { ADMIN_EMAIL } from '../../config'
import { signInAdmin, humanError } from '../../lib/api'
import { Btn, Card, Field, Err, Spinner } from '../../components/ui'

export default function Login() {
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try { await signInAdmin(ADMIN_EMAIL, pin) }
    catch (e2) { setErr(humanError(e2)) }
    finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <div className="mb-6 text-center">
        <div className="text-5xl">🌷</div>
        <h1 className="mt-3 font-display text-3xl text-stone-800">Панель мастера</h1>
        <p className="mt-1 text-sm text-stone-400">Вход по пин-коду</p>
      </div>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Пин-код" type="password" inputMode="numeric" autoComplete="current-password"
            value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••••"
            className="text-center text-2xl tracking-[.5em]" />
          <Err>{err}</Err>
          <Btn type="submit" disabled={busy || pin.length < 4} className="w-full">
            {busy ? <span className="inline-flex items-center gap-2"><Spinner />Проверяю…</span> : 'Войти'}
          </Btn>
        </form>
      </Card>
    </div>
  )
}
