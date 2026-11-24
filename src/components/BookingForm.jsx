import { useState } from 'react'
import { fmtPhoneInput, phoneDigits } from '../lib/format'
import { Btn, Field, Err, Spinner } from './ui'

export default function BookingForm({ summary, busy, error, onSubmit }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [vk, setVk] = useState('')
  const [localErr, setLocalErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (name.trim().length < 2) return setLocalErr('Напишите, как вас зовут 🙂')
    if (phoneDigits(phone).length !== 11) return setLocalErr('Введите номер телефона полностью.')
    setLocalErr('')
    onSubmit({ name: name.trim(), phone, vk: vk.trim() })
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-rose-100 bg-white p-5 shadow-sm shadow-rose-100">
      <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{summary}</div>
      <Field label="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} placeholder="Анна" autoComplete="name" />
      <Field label="Телефон" type="tel" inputMode="tel" value={phone}
        onChange={(e) => setPhone(fmtPhoneInput(e.target.value))} placeholder="+7 (900) 123-45-67" autoComplete="tel" />
      <Field label="Ссылка на ВК" hint="— необязательно" value={vk}
        onChange={(e) => setVk(e.target.value)} placeholder="vk.com/anna" inputMode="url" />
      <Err>{localErr || error}</Err>
      <Btn type="submit" disabled={busy} className="w-full">
        {busy ? <span className="inline-flex items-center gap-2"><Spinner />Записываю…</span> : 'Записаться 💖'}
      </Btn>
      <p className="text-center text-[11px] leading-snug text-stone-300">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных для оформления записи.
      </p>
    </form>
  )
}
