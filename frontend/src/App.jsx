import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import { useHealth } from './hooks/useHealth'

export default function App() {
  const health = useHealth()
  return (
    <div className="min-h-screen">
      <Header health={health} />
      <Dashboard />
    </div>
  )
}