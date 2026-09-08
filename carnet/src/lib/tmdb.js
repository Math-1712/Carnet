// Acces a l'API TMDb (themoviedb.org).
// La cle vit dans le fichier .env a la racine : VITE_TMDB_KEY=xxxxx

const KEY = import.meta.env.VITE_TMDB_KEY
const BASE = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p'

export const hasKey = Boolean(KEY)

/** Construit l'URL d'une affiche. size : w185 | w342 | w500 | original */
export function posterUrl(path, size = 'w342') {
  return path ? `${IMG}/${size}${path}` : null
}

async function get(path, params = {}) {
  if (!KEY) throw new Error('Cle TMDb manquante. Ajoutez VITE_TMDB_KEY dans .env')
  const url = new URL(BASE + path)
  url.searchParams.set('api_key', KEY)
  url.searchParams.set('language', 'fr-FR')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 401) throw new Error('Cle TMDb refusee. Verifiez sa valeur dans .env')
    throw new Error(`TMDb a repondu ${res.status}`)
  }
  return res.json()
}

/** Met un resultat brut TMDb au format utilise dans toute l'appli. */
function normalize(raw) {
  const type = raw.media_type ?? (raw.title ? 'movie' : 'tv')
  const date = raw.release_date || raw.first_air_date || ''
  return {
    key: `${type}:${raw.id}`,
    tmdbId: raw.id,
    type,
    title: raw.title || raw.name || 'Sans titre',
    year: date ? date.slice(0, 4) : null,
    poster: raw.poster_path ?? null,
    overview: raw.overview || '',
    voteAverage: raw.vote_average ?? null,
  }
}

/** Recherche films + series en une requete. */
export async function search(query, { signal } = {}) {
  if (!query.trim()) return []
  const data = await get('/search/multi', { query, include_adult: 'false' })
  return data.results
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map(normalize)
}

/** Fiche detaillee d'un film ou d'une serie. */
export async function details(type, id) {
  const raw = await get(`/${type}/${id}`)
  const base = normalize({ ...raw, media_type: type })

  if (type === 'movie') {
    return { ...base, runtime: raw.runtime ?? null, genres: raw.genres?.map((g) => g.name) ?? [] }
  }

  return {
    ...base,
    genres: raw.genres?.map((g) => g.name) ?? [],
    episodeCount: raw.number_of_episodes ?? null,
    seasons: (raw.seasons ?? [])
      .filter((s) => s.season_number > 0 && s.episode_count > 0)
      .map((s) => ({
        number: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
      })),
  }
}

/** Liste des episodes d'une saison. */
export async function season(tvId, seasonNumber) {
  const raw = await get(`/tv/${tvId}/season/${seasonNumber}`)
  return (raw.episodes ?? []).map((e) => ({
    number: e.episode_number,
    name: e.name,
    airDate: e.air_date || null,
  }))
}
