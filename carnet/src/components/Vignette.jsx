import { posterUrl } from '../lib/tmdb'

const JETONS = { vu: '✓', a_voir: '+', en_cours: '▸' }

/**
 * Une affiche cliquable. `entry` est l'entree de bibliotheque si l'oeuvre y figure,
 * ce qui permet d'afficher le statut et la pellicule de progression.
 */
export default function Vignette({ work, entry, onOpen }) {
  const url = posterUrl(work.poster, 'w342')
  const statut = entry?.status

  return (
    <button className="vignette" onClick={() => onOpen(work)}>
      <div className="affiche">
        {url ? (
          <img src={url} alt="" loading="lazy" />
        ) : (
          <div className="affiche-vide">{work.title}</div>
        )}
        {statut && (
          <span
            className={`jeton${statut === 'en_cours' ? ' encours' : ''}`}
            aria-label={statut}
          >
            {JETONS[statut]}
          </span>
        )}
      </div>
      <p className="vignette-titre">{work.title}</p>
      <p className="vignette-annee">
        {work.type === 'tv' ? 'Serie' : 'Film'}
        {work.year ? ` · ${work.year}` : ''}
      </p>
      <Pellicule entry={entry} />
    </button>
  )
}

/** Progression d'une serie : un segment par episode, plafonne a 16. */
function Pellicule({ entry }) {
  if (entry?.type !== 'tv' || !entry.episodeCount) return null

  const vus = Object.keys(entry.episodes ?? {}).length
  if (vus === 0) return null

  const segments = Math.min(entry.episodeCount, 16)
  const remplis = Math.min(segments, Math.round((vus / entry.episodeCount) * segments) || 1)

  return (
    <div
      className="pellicule"
      role="img"
      aria-label={`${vus} episodes sur ${entry.episodeCount}`}
    >
      {Array.from({ length: segments }, (_, i) => (
        <i key={i} className={i < remplis ? 'vu' : undefined} />
      ))}
    </div>
  )
}
