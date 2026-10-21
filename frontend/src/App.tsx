import { useEffect, useState } from 'react'

export default function App() {
  const [backend, setBackend] = useState('checking…')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((body) => setBackend(body.status))
      .catch(() => setBackend('unreachable'))
  }, [])

  return (
    <main>
      <h1>ORCHESTRA AI</h1>
      <p>Backend: {backend}</p>
    </main>
  )
}
