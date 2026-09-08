import { useState } from 'react'
import Vignette from './Vignette'

const FILTRES = [
  { id: 'tout', label: 'Tout' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'a_voir', label: 'A voir' },
  { id: 'vu', label: 'Vu' },
]

export default function Bibliotheque({ items, onOpen }) {
  const [filtre, setFiltre] = useState('tout')

  const liste = Object.values(items)
    .filter((e) => filtre === 'tout' || e.status === filtre)
    .sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="contenu" style={{ padding: '4px 0 0' }}>
      <div className="filtres">
        {FILTRES.map((f) => (
          <button
            key={f.id}
            className="pastille"
            aria-pressed={filtre === f.id}
            onClick={() => setFiltre(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {liste.length === 0 ? (
        <div className="vide">
          <strong>{filtre === 'tout' ? 'Carnet vierge' : 'Rien dans cette pile'}</strong>
          {filtre === 'tout'
            ? 'Ajoutez un premier titre depuis la recherche.'
            : 'Changez de filtre ou ajoutez un titre.'}
        </div>
      ) : (
        <div className="grille">
          {liste.map((e) => (
            <Vignette key={e.key} work={e} entry={e} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}
