// Мелкие общие UI-компоненты. Без бизнес-логики.
export function Btn({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-rose-400 text-white shadow-lg shadow-rose-200 hover:bg-rose-500',
    soft: 'bg-rose-100 text-rose-600 hover:bg-rose-200',
    ghost: 'border border-stone-200 bg-white text-stone-600 hover:border-rose-300',
    danger: 'border border-red-200 bg-white text-red-500 hover:bg-red-50',
  }
  return (
    <button
      className={`rounded-2xl px-5 py-3.5 text-base font-bold transition active:scale-[.97] disabled:pointer-events-none disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export const Card = ({ className = '', ...props }) => (
  <div className={`rounded-3xl border border-rose-100 bg-white p-5 shadow-sm shadow-rose-100 ${className}`} {...props} />
)

export const Spinner = () => (
  <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

export const Field = ({ label, hint, className = '', ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-stone-600">
      {label}{hint && <span className="font-normal text-stone-400"> {hint}</span>}
    </span>
    <input
      className={`w-full rounded-2xl border border-rose-200 bg-white px-4 py-3.5 text-base text-stone-800 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${className}`}
      {...props}
    />
  </label>
)

export const SectionTitle = ({ step, children }) => (
  <h2 className="mb-3 flex items-center gap-2.5 font-display text-xl text-stone-800">
    {step && <span className="grid h-7 w-7 place-items-center rounded-full bg-rose-400 font-sans text-sm font-bold text-white">{step}</span>}
    {children}
  </h2>
)

export const Empty = ({ children }) => (
  <div className="py-10 text-center leading-relaxed text-stone-400">{children}</div>
)

export const Err = ({ children }) =>
  children ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{children}</div> : null
