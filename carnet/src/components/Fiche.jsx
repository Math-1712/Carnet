import { useEffect, useState } from 'react'
import { details, season as fetchSeason, posterUrl } from '../lib/tmdb'
import { STATUSES, seasonProgress } from '../lib/library'

export default function Fiche({ work, lib, onClose }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const entry = lib.items[work.key]

  useEffect(() => {
    let vivant = true
    details(work.type, work.tmdbId)
      .then((d) => vivant && setData(d))
      .catch((e) => vivant && setError(e.message))
    return () => {
      vivant = false
    }
  }, [work.type, work.tmdbId])

  const fiche = data ?? work

  return (
    <div className="contenu" style={{ padding: '4px 0 0' }}>
      <button className="retour" onClick={onClose}>
        ← Retour
      </button>

      <div className="fiche-haut">
        <div className="fiche-affiche">
          <div className="affiche">
            {fiche.poster ? (
              <img src={posterUrl(fiche.poster, 'w342')} alt="" />
            ) : (
              <div className="affiche-vide">{fiche.title}</div>
            )}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 className="fiche-titre">{fiche.title}</h2>
          <p className="fiche-meta">
            {fiche.type === 'tv' ? 'Serie' : 'Film'}
            {fiche.year ? ` · ${fiche.year}` : ''}
            {data?.genres?.length ? ` · ${data.genres.slice(0, 2).join(', ')}` : ''}
          </p>
        </div>
      </div>

      <div className="statuts">
        {Object.entries(STATUSES).map(([id, label]) => (
          <button
            key={id}
            className="statut"
            aria-pressed={entry?.status === id}
            onClick={() =>
              entry?.status === id ? lib.remove(work.key) : lib.setStatus(fiche, id)
            }
          >
            {label}
          </button>
        ))}
      </div>

      {entry && (
        <div className="note">
          <span className="note-label">Ma note</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`etoile${entry.rating >= n ? ' pleine' : ''}`}
              aria-label={`${n} sur 5`}
              onClick={() => lib.setRating(work.key, entry.rating === n ? null : n)}
            >
              ★
            </button>
          ))}
        </div>
      )}

      {error && <div className="alerte">{error}</div>}
      {fiche.overview && <p className="synopsis">{fiche.overview}</p>}

      {data?.type === 'tv' && data.seasons?.length > 0 && (
        <>
          <h3 className="section-titre">Episodes</h3>
          {data.seasons.map((s) => (
            <Saison
              key={s.number}
              tvId={data.tmdbId}
              saison={s}
              entry={entry}
              lib={lib}
              itemKey={work.key}
              work={fiche}
            />
          ))}
        </>
      )}
    </div>
  )
}

function Saison({ tvId, saison, entry, lib, itemKey, work }) {
  const [ouverte, setOuverte] = useState(false)
  const [episodes, setEpisodes] = useState(null)

  const vus = seasonProgress(entry, saison.number)

  useEffect(() => {
    if (!ouverte || episodes) return
    fetchSeason(tvId, saison.number).then(setEpisodes).catch(() => setEpisodes([]))
  }, [ouverte, episodes, tvId, saison.number])

  // Cocher un episode d'une serie absente du carnet l'y ajoute d'office
  function assurerPresence() {
    if (!entry) lib.setStatus(work, 'en_cours')
  }

  const toutVu = episodes && vus === episodes.length && episodes.length > 0

  return (
    <div className="saison">
      <button
        className="saison-entete"
        onClick={() => setOuverte(!ouverte)}
        aria-expanded={ouverte}
      >
        <span className="saison-nom">{saison.name}</span>
        <span className="saison-compte">
          {vus}/{saison.episodeCount}
        </span>
        <span style={{ color: 'var(--brume)' }}>{ouverte ? '▲' : '▼'}</span>
      </button>

      {ouverte && (
        <div className="saison-corps">
          {!episodes && <p className="chargement">Chargement…</p>}

          {episodes && episodes.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 8px 4px' }}>
                <button
                  className="tout-cocher"
                  onClick={() => {
                    assurerPresence()
                    lib.setSeasonWatched(
                      itemKey,
                      saison.number,
                      episodes.map((e) => e.number),
                      !toutVu
                    )
                  }}
                >
                  {toutVu ? 'Tout decocher' : 'Tout cocher'}
                </button>
              </div>

              {episodes.map((e) => {
                const coche = Boolean(entry?.episodes?.[`${saison.number}-${e.number}`])
                return (
                  <button
                    key={e.number}
                    className="episode"
                    onClick={() => {
                      assurerPresence()
                      lib.toggleEpisode(itemKey, saison.number, e.number)
                    }}
                  >
                    <span className={`case${coche ? ' cochee' : ''}`}>✓</span>
                    <span className="episode-num">
                      {saison.number}×{String(e.number).padStart(2, '0')}
                    </span>
                    <span className="episode-nom">{e.name}</span>
                  </button>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
