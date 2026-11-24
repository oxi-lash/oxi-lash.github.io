import { MASTER } from '../config'
import { fmtDay, hourLabel, rub, duration } from '../lib/format'
import { Btn, Card } from './ui'

const Row = ({ k, v }) => (
  <div className="flex justify-between gap-4 border-b border-rose-50 py-2 last:border-0">
    <span className="text-sm text-stone-400">{k}</span>
    <span className="text-right font-semibold text-stone-700">{v}</span>
  </div>
)

export default function Success({ booking: b, onReset }) {
  const msg = `Здравствуйте! Я записалась 💖\n\nУслуга: ${b.service_title}\nДата: ${fmtDay(b.day)}\nВремя: ${hourLabel(b.hour)}\nДлительность: ${duration(b.duration_min)}\nСтоимость: ${rub(b.price_rub)}\nИмя: ${b.client_name}\nТелефон: ${b.phone}`
  // Копируем текст в буфер и сразу открываем диалог ВК (vk.me не умеет предзаполнять текст)
  const copy = () => { try { navigator.clipboard?.writeText(msg) } catch { /* не страшно */ } }

  return (
    <div className="pt-10 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-rose-100 text-4xl">💌</div>
      <h1 className="mt-4 font-display text-3xl text-stone-800">Вы записаны!</h1>
      <p className="mt-2 text-sm text-stone-500">Мастер увидит запись и подтвердит её в личных сообщениях.</p>
      <Card className="mt-6 text-left">
        <Row k="Услуга" v={b.service_title} />
        <Row k="Дата" v={fmtDay(b.day)} />
        <Row k="Время" v={hourLabel(b.hour)} />
        <Row k="Длительность" v={duration(b.duration_min)} />
        <Row k="Стоимость" v={rub(b.price_rub)} />
        <Row k="Имя" v={b.client_name} />
        <Row k="Телефон" v={b.phone} />
      </Card>
      <a
        href={MASTER.vkWrite} target="_blank" rel="noreferrer" onClick={copy}
        className="mt-5 block w-full rounded-2xl bg-[#0077FF] px-5 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition active:scale-[.97]"
      >
        💬 Отправить детали мастеру в ВК
      </a>
      <p className="mt-2 text-xs text-stone-400">Текст записи скопируется — просто вставьте его в чат.</p>
      <Btn variant="soft" onClick={onReset} className="mt-6 w-full">Записаться ещё</Btn>
    </div>
  )
}
