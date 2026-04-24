import { useState } from 'react'
import logoGostinhoMineiro from '../assets/logo-gostinho-mineiro.png'

const NEW_CATALOG_URL = 'https://varejo.gostinhomineiro.com'

export function HeroCard() {
  const [pointerStyle, setPointerStyle] = useState({
    '--pointer-x': '50%',
    '--pointer-y': '50%',
    '--rotate-x': '0deg',
    '--rotate-y': '0deg',
  })

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100
    const rotateY = ((x - 50) / 50) * 6
    const rotateX = ((50 - y) / 50) * 6

    setPointerStyle({
      '--pointer-x': `${x}%`,
      '--pointer-y': `${y}%`,
      '--rotate-x': `${rotateX.toFixed(2)}deg`,
      '--rotate-y': `${rotateY.toFixed(2)}deg`,
    })
  }

  const resetPointer = () => {
    setPointerStyle({
      '--pointer-x': '50%',
      '--pointer-y': '50%',
      '--rotate-x': '0deg',
      '--rotate-y': '0deg',
    })
  }

  return (
    <article
      className="hero-card reveal reveal-delay-1"
      style={pointerStyle}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
    >
      <img
        className="brand-logo"
        src={logoGostinhoMineiro}
        alt="Gostinho Mineiro"
      />

      <div className="hero-copy">
        <p className="eyebrow">Novo catálogo oficial</p>
        <h1>Estamos de cara nova!</h1>
      </div>

      <a
        className="link-highlight"
        href={NEW_CATALOG_URL}
        onClick={() => {
          window.location.href = NEW_CATALOG_URL
        }}
      >
        <span className="link-label">Acesse agora</span>
        <strong>varejo.gostinhomineiro.com</strong>
        <span className="link-pulse" aria-hidden="true" />
      </a>

      <a
        className="primary-button"
        href={NEW_CATALOG_URL}
        onClick={() => {
          window.location.href = NEW_CATALOG_URL
        }}
      >
        <span>Acessar novo catálogo</span>
      </a>

      <div className="status-card">
        <span className="status-dot" />
        <p>O novo site é oficial da Gostinho Mineiro</p>
      </div>
    </article>
  )
}
