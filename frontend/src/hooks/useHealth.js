import { useEffect, useState } from 'react'
import { health } from '../services/api'

export function useHealth() {
  const [state, setState] = useState('checking')

  useEffect(() => {
    let cancelled = false
    async function ping() {
      try {
        await health()
        if (!cancelled) setState('online')
      } catch {
        if (!cancelled) setState('offline')
      }
    }
    ping()
    const id = setInterval(ping, 15000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return state
}