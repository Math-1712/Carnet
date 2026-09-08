import { useState } from 'react'
import { useLibrary } from './lib/library'
import Recherche from './components/Recherche'
import Bibliotheque from './components/Bibliotheque'
import Fiche from './components/Fiche'

export default function App() {
  const lib = useLibrary()
  const [onglet, setOnglet] = useState('carnet') // carnet | recherche
  const [ouvert, setOuvert] = useState(null) // oeuvre affichee en fiche

  return (
    <div className="app">
      <header className="entete">
        <div className="entete-interne">
          <h1 className="marque">
            Carnet<span>.</span>
          </h1>
          {!ouvert && onglet === 'recherche' && (
            <Recherche items={lib.items} onOpen={setOuvert} />
          )}
        </div>
      </header>

      {ouvert ? (
        <Fiche work={ouvert} lib={lib} onClose={() => setOuvert(null)} />
      ) : (
        onglet === 'carnet' && <Bibliotheque items={lib.items} onOpen={setOuvert} />
      )}

      <nav className="onglets">
        <button
          className="onglet"
          aria-current={!ouvert && onglet === 'carnet' ? 'page' : undefined}
          onClick={() => {
            setOuvert(null)
            setOnglet('carnet')
          }}
        >
          <IconeCarnet />
          Mon carnet
        </button>
        <button
          className="onglet"
          aria-current={!ouvert && onglet === 'recherche' ? 'page' : undefined}
          onClick={() => {
            setOuvert(null)
            setOnglet('recherche')
          }}
        >
          <IconeLoupe />
          Rechercher
        </button>
      </nav>
    </div>
  )
}

function IconeCarnet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 3v18" />
    </svg>
  )
}

function IconeLoupe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  )
}
