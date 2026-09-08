import { useEffect, useState } from 'react'
import { search, hasKey } from '../lib/tmdb'
import Vignette from './Vignette'

export default function Recherche({ items, onOpen }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [error, setError] = useState('')

  // Attend 350 ms apres la derniere frappe avant d'appeler TMDb
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setState('idle')
      return
    }
    setState('loading')
    const timer = setTimeout(async () => {
      try {
        setResults(await search(query))
        setState('done')
      } catch (e) {
        setError(e.message)
        setState('error')
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <>
      <div className="champ">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Un film, une serie…"
          autoComplete="off"
          autoCorrect="off"
          enterKeyHint="search"
        />
        {query && (
          <button className="effacer" onClick={() => setQuery('')} aria-label="Effacer">
            ✕
          </button>
        )}
      </div>

      <div className="contenu" style={{ padding: '18px 0 0' }}>
        {!hasKey && (
          <div className="alerte">
            Aucune cle TMDb trouvee. Creez un fichier <code>.env</code> a la racine du projet
            avec <code>VITE_TMDB_KEY=votre_cle</code>, puis relancez <code>npm run dev</code>.
          </div>
        )}

        {state === 'error' && <div className="alerte">{error}</div>}
        {state === 'loading' && <p className="chargement">Recherche…</p>}

        {state === 'idle' && hasKey && (
          <div className="vide">
            <strong>Que venez-vous de regarder ?</strong>
            Cherchez un titre pour l'ajouter a votre carnet.
          </div>
        )}

        {state === 'done' && results.length === 0 && (
          <div className="vide">
            <strong>Rien trouve</strong>
            Essayez le titre original, souvent en anglais.
          </div>
        )}

        {results.length > 0 && (
          <div className="grille">
            {results.map((w) => (
              <Vignette key={w.key} work={w} entry={items[w.key]} onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
