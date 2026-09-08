// Bibliotheque personnelle, stockee sur l'appareil.
// Structure : { "movie:603": { key, tmdbId, type, title, year, poster,
//                              status, rating, episodes: { "1-4": true }, updatedAt } }

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'carnet.library.v1'

export const STATUSES = {
  a_voir: 'A voir',
  en_cours: 'En cours',
  vu: 'Vu',
}

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function write(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  // Previent les autres composants montes dans le meme onglet
  window.dispatchEvent(new Event('carnet:change'))
}

export function useLibrary() {
  const [items, setItems] = useState(read)

  useEffect(() => {
    const sync = () => setItems(read())
    window.addEventListener('carnet:change', sync)
    window.addEventListener('storage', sync) // autre onglet
    return () => {
      window.removeEventListener('carnet:change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setStatus = useCallback((work, status) => {
    const data = read()
    const existing = data[work.key]
    data[work.key] = {
      key: work.key,
      tmdbId: work.tmdbId,
      type: work.type,
      title: work.title,
      year: work.year ?? null,
      poster: work.poster ?? null,
      episodeCount: work.episodeCount ?? existing?.episodeCount ?? null,
      rating: existing?.rating ?? null,
      episodes: existing?.episodes ?? {},
      ...existing,
      status,
      updatedAt: Date.now(),
    }
    write(data)
  }, [])

  const setRating = useCallback((key, rating) => {
    const data = read()
    if (!data[key]) return
    data[key] = { ...data[key], rating, updatedAt: Date.now() }
    write(data)
  }, [])

  const toggleEpisode = useCallback((key, seasonNumber, episodeNumber) => {
    const data = read()
    const entry = data[key]
    if (!entry) return
    const id = `${seasonNumber}-${episodeNumber}`
    const episodes = { ...entry.episodes }
    if (episodes[id]) delete episodes[id]
    else episodes[id] = true
    data[key] = { ...entry, episodes, updatedAt: Date.now() }
    write(data)
  }, [])

  /** Coche ou decoche toute une saison d'un coup. */
  const setSeasonWatched = useCallback((key, seasonNumber, episodeNumbers, watched) => {
    const data = read()
    const entry = data[key]
    if (!entry) return
    const episodes = { ...entry.episodes }
    for (const n of episodeNumbers) {
      const id = `${seasonNumber}-${n}`
      if (watched) episodes[id] = true
      else delete episodes[id]
    }
    data[key] = { ...entry, episodes, updatedAt: Date.now() }
    write(data)
  }, [])

  const remove = useCallback((key) => {
    const data = read()
    delete data[key]
    write(data)
  }, [])

  return { items, setStatus, setRating, toggleEpisode, setSeasonWatched, remove }
}

/** Nombre d'episodes coches pour une saison donnee. */
export function seasonProgress(entry, seasonNumber) {
  if (!entry?.episodes) return 0
  const prefix = `${seasonNumber}-`
  return Object.keys(entry.episodes).filter((k) => k.startsWith(prefix)).length
}

export function totalWatched(entry) {
  return entry?.episodes ? Object.keys(entry.episodes).length : 0
}

/** Export / import : utile pour sauvegarder ou changer de telephone. */
export function exportJson() {
  return JSON.stringify(read(), null, 2)
}

export function importJson(text) {
  const incoming = JSON.parse(text)
  write({ ...read(), ...incoming })
}
