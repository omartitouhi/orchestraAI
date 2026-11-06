import { useEffect, useState } from 'react'

export default function App() {
  const [backend, setBackend] = useState('checking…')
  const [reply, setReply] = useState('')
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((body) => setBackend(body.status))
      .catch(() => setBackend('unreachable'))
  }, [])

  function sayHello() {
    setAsking(true)
    fetch('/api/hello', { method: 'POST' })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((body) => setReply(`${body.text} (${body.model})`))
      .catch(() => setReply('The model did not answer. Check LLM_MODEL and the API keys in .env.'))
      .finally(() => setAsking(false))
  }

  return (
    <main>
      <h1>ORCHESTRA AI</h1>
      <p>Backend: {backend}</p>
      <button type="button" onClick={sayHello} disabled={asking}>
        {asking ? 'Asking the model…' : 'Ask the model to say hello'}
      </button>
      <p aria-live="polite">{reply}</p>
    </main>
  )
}
