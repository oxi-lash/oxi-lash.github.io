// Мини-роутер на hash: '/' — клиенты, '#/admin' — мастер.
// Hash нужен, потому что GitHub Pages не поддерживает серверные роуты.
import { useEffect, useState } from 'react'
import ClientPage from './pages/ClientPage'
import AdminPage from './pages/admin/AdminPage'

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => { setHash(window.location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash.startsWith('#/admin') ? <AdminPage /> : <ClientPage />
}
