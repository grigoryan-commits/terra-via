import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { get } from '../api.js'
import TourCard from '../components/TourCard.jsx'
import '../styles/catalog.css'

const TYPES = ['Пляжный', 'Экскурсионный', 'Горнолыжный', 'Гастрономический', 'Активный']
const FIELDS = ['q', 'country', 'type', 'stars', 'dateFrom', 'priceMax', 'sort']

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [countries, setCountries] = useState([])
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filters = Object.fromEntries(FIELDS.map((f) => [f, params.get(f) || '']))

  useEffect(() => {
    get('countries.php').then((d) => setCountries(d.countries)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    get('tours.php?' + params.toString())
      .then((d) => setTours(d.tours))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [params])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <div className="container catalog">
      <h1>Каталог туров</h1>
      <div className="catalog-layout">
        <aside className="filters">
          <label>Поиск
            <input placeholder="Город, страна, название" defaultValue={filters.q} onKeyDown={(e) => e.key === 'Enter' && update('q', e.target.value.trim())} onBlur={(e) => update('q', e.target.value.trim())} />
          </label>
          <label>Страна
            <select value={filters.country} onChange={(e) => update('country', e.target.value)}>
              <option value="">Все</option>
              {countries.map((c) => <option key={c.id_country}
value={c.id_country}>{c.name}</option>)}
            </select>
          </label>
          <label>Тип отдыха
            <select value={filters.type} onChange={(e) => update('type', e.target.value)}>
              <option value="">Любой</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>Звёздность отеля
            <select value={filters.stars} onChange={(e) => update('stars', e.target.value)}>
              <option value="">Любая</option>
              <option value="3">3  и выше</option>
              <option value="4">4  и выше</option>
              <option value="5">5 </option>
            </select>
          </label>
          <label>Вылет не раньше
            <input type="date" value={filters.dateFrom} onChange={(e) => update('dateFrom', e.target.value)} />
          </label>
          <label>Цена до,
            <input type="number" min="0" step="10000" defaultValue={filters.priceMax} onBlur={(e) => update('priceMax', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && update('priceMax', e.target.value)} />
          </label>
          <button className="btn btn-outline btn-block" onClick={() => setParams({})}>Сбросить фильтры</button>
        </aside>
        <section>
          <div className="catalog-bar">
            <span>{loading ? 'Ищем туры…' : 'Найдено туров: ' + tours.length}</span>
            <select value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
              <option value="">Сначала дешёвые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="date">По дате вылета</option>
              <option value="stars">По звёздности</option>
            </select>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          {!loading && !error && tours.length === 0 && (
            <div className="empty">По выбранным параметрам туров нет. Попробуйте изменить даты или бюджет.</div>
          )}
          <div className="tours-grid tours-grid-2">
            {tours.map((t) => <TourCard key={t.id_tour} tour={t} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
