import { useEffect, useMemo, useRef, useState } from 'react'
import { MASTER, BOOKING_DAYS_AHEAD } from '../config'
import { listServices, listSlotsRange, bookSlot, humanError } from '../lib/api'
import { todayStr, nowHour, shiftDay, parseDay, monthRange, fmtDay, hourLabel, rub } from '../lib/format'
import Header from '../components/Header'
import ServicePicker from '../components/ServicePicker'
import Calendar from '../components/Calendar'
import SlotPicker from '../components/SlotPicker'
import BookingForm from '../components/BookingForm'
import Success from '../components/Success'
import { SectionTitle, Spinner, Err } from '../components/ui'

export default function ClientPage() {
  const today = todayStr()
  const maxDay = shiftDay(today, BOOKING_DAYS_AHEAD)
  const [services, setServices] = useState(null)
  const [loadErr, setLoadErr] = useState('')
  const [month, setMonth] = useState(() => { const t = parseDay(today); return new Date(t.getFullYear(), t.getMonth(), 1) })
  const [slots, setSlots] = useState([])
  const [reload, setReload] = useState(0)
  const [service, setService] = useState(null)
  const [day, setDay] = useState(null)
  const [slot, setSlot] = useState(null)
  const [busy, setBusy] = useState(false)
  const [bookErr, setBookErr] = useState('')
  const [done, setDone] = useState(null)
  const calRef = useRef(null), formRef = useRef(null)

  useEffect(() => {
    listServices().then((s) => setServices(s.filter((x) => x.is_active))).catch((e) => setLoadErr(humanError(e)))
  }, [])

  useEffect(() => {
    const { from, to } = monthRange(month)
    listSlotsRange(from, to).then(setSlots).catch(() => setSlots([]))
  }, [month, reload])

  // Свободные слоты по дням; сегодняшние прошедшие часы скрываем
  const freeByDay = useMemo(() => {
    const map = new Map()
    for (const s of slots) {
      if (s.status !== 'free') continue
      if (s.day < today || (s.day === today && s.hour <= nowHour())) continue
      if (!map.has(s.day)) map.set(s.day, [])
      map.get(s.day).push(s)
    }
    return map
  }, [slots, today])

  const scrollTo = (ref) => setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  const pickService = (s) => { setService(s); scrollTo(calRef) }
  const pickDay = (ds) => { setDay(ds); setSlot(null) }
  const pickSlot = (s) => { setSlot(s); setBookErr(''); scrollTo(formRef) }

  const submit = async (values) => {
    setBusy(true); setBookErr('')
    try {
      const res = await bookSlot({ slotId: slot.id, serviceId: service.id, ...values })
      setDone(res); window.scrollTo(0, 0)
    } catch (e) {
      setBookErr(humanError(e))
      if ((e.message || '').includes('SLOT_TAKEN')) { setSlot(null); setReload((k) => k + 1) }
    } finally { setBusy(false) }
  }

  const reset = () => {
    setDone(null); setService(null); setDay(null); setSlot(null)
    setReload((k) => k + 1); window.scrollTo(0, 0)
  }

  if (done) return <div className="mx-auto max-w-md px-4 pb-16"><Success booking={done} onReset={reset} /></div>

  return (
    <div className="mx-auto max-w-md px-4 pb-16">
      <Header />
      <Err>{loadErr}</Err>
      <section className="mt-2">
        <SectionTitle step="1">Выберите услугу</SectionTitle>
        {services === null
          ? <div className="flex justify-center py-8 text-rose-300"><Spinner /></div>
          : <ServicePicker services={services} selectedId={service?.id} onSelect={pickService} />}
      </section>

      {service && (
        <section ref={calRef} className="mt-8 scroll-mt-4">
          <SectionTitle step="2">Дата и время</SectionTitle>
          <Calendar month={month} setMonth={setMonth} selected={day}
            marks={new Set(freeByDay.keys())} minDay={today} maxDay={maxDay} onPick={pickDay} />
          {day && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold capitalize text-stone-500">{fmtDay(day)}</p>
              <SlotPicker slots={freeByDay.get(day) || []} selectedId={slot?.id} onSelect={pickSlot} />
            </div>
          )}
        </section>
      )}

      {slot && service && (
        <section ref={formRef} className="mt-8 scroll-mt-4">
          <SectionTitle step="3">Ваши контакты</SectionTitle>
          <BookingForm
            summary={`${service.title} · ${fmtDay(day)}, ${hourLabel(slot.hour)} · ${rub(service.price_rub)}`}
            busy={busy} error={bookErr} onSubmit={submit}
          />
        </section>
      )}

      <footer className="mt-12 text-center text-xs text-stone-300">
        {MASTER.name} · запись открыта на {BOOKING_DAYS_AHEAD} дней вперёд
      </footer>
    </div>
  )
}
