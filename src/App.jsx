import { HeroCard } from './components/HeroCard'

export default function App() {
  return (
    <main className="page-shell">
      <section className="hero-layout">
        <HeroCard />
      </section>

      <footer className="site-footer reveal reveal-delay-3">
        <p>Gostinho Mineiro</p>
        <span>O catálogo antigo não recebe mais pedidos.</span>
      </footer>
    </main>
  )
}
