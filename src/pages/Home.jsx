import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { get, img, money, date } from '../api.js'
import TourCard from '../components/TourCard.jsx'
import CallForm from '../components/CallForm.jsx'
import Stars from '../components/Stars.jsx'
import '../styles/home.css'

const advantages = [
  ['18 лет', 'на рынке организованного туризма'],
  ['140 000+', 'туристов отдохнули с нами'],
  ['24/7', 'поддержка во время поездки'],
  ['0 ', 'комиссии при бронировании онлайн'],
]

const steps = [
  ['Выберите тур', 'Отфильтруйте каталог по стране, дате, бюджету и типу отдыха.'],
  ['Забронируйте онлайн', 'Укажите дату вылета и количество туристов - места сразу закрепляются за вами.'],
  ['Получите подтверждение', 'Менеджер проверит наличие в отеле и подтвердит заявку в течение часа.'],
  ['Оплатите и летите', 'Оплата картой или по СБП в личном кабинете, документы придут на почту.'],
]

export default function Home() {
  const navigate = useNavigate()
  const [countries, setCountries] = useState([])
  const [tours, setTours] = useState([])
  const [reviews, setReviews] = useState([])
  const [search, setSearch] = useState({ country: '', dateFrom: '', priceMax: '' })

  useEffect(() => {
    get('countries.php').then((d) => setCountries(d.countries)).catch(() => {})
    get('tours.php?sort=date').then((d) => setTours(d.tours.slice(0, 6))).catch(() => {})
    get('reviews.php').then((d) => setReviews(d.reviews)).catch(() => {})
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(Object.entries(search).filter(([, v]) => v))
    navigate('/tours?' + params.toString())
  }

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${img('hero.jpg')})` }}>
        <div className="hero-shade" />
        <div className="container hero-inner">
          <p className="eyebrow">Туроператор Terra Via</p>
          <h1>Путешествия, которые собраны за вас</h1>
          <p className="hero-sub">Перелёт, отель, трансфер и страховка в одном бронировании. 8 направлений и вылеты из трёх городов.</p>
          <form className="hero-search" onSubmit={submit}>
            <label>Куда
              <select value={search.country} onChange={(e) => setSearch({ ...search, country: e.target.value })}>
                <option value="">Все страны</option>
                {countries.map((c) => <option key={c.id_country}
value={c.id_country}>{c.name}</option>)}
              </select>
            </label>
            <label>Вылет не раньше
              <input type="date" value={search.dateFrom} onChange={(e) => setSearch({ ...search, dateFrom: e.target.value })} />
            </label>
            <label>Бюджет до,
              <input type="number" min="0" step="10000" placeholder="200 000" value={search.priceMax} onChange={(e) => setSearch({ ...search, priceMax: e.target.value })} />
            </label>
            <button className="btn btn-accent">Найти тур</button>
          </form>
        </div>
      </section>

      <section className="advantages">
        <div className="container adv-grid">
          {advantages.map(([n, t]) => (
            <div key={n} className="adv"><strong>{n}</strong><span>{t}</span></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Направления</h2>
            <Link to="/tours" className="link-arrow">Все туры →</Link>
          </div>
          <div className="countries-grid">
            {countries.map((c) => (
              <Link key={c.id_country} to={'/tours?country=' + c.id_country} className="country-tile" style={{ backgroundImage: `url(${img(c.image)})` }}>
                <div>
                  <h3>{c.name}</h3>
                  <span>{c.min_price ? 'от ' + money(c.min_price) : 'скоро в продаже'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-sand">
        <div className="container">
          <div className="section-head">
            <h2>Ближайшие вылеты</h2>
            <Link to="/tours?sort=date" className="link-arrow">Смотреть каталог →</Link>
          </div>
          <div className="tours-grid">
            {tours.map((t) => <TourCard key={t.id_tour} tour={t} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Как забронировать тур</h2>
          <ol className="steps">
            {steps.map(([h, p], i) => (
              <li key={h}><span>{String(i + 1).padStart(2,
'0')}</span><h3>{h}</h3><p>{p}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section section-dark">
          <div className="container">
            <h2>Отзывы туристов</h2>
            <div className="reviews-grid">
              {reviews.map((r, i) => (
                <blockquote key={i} className="review">
                  <Stars value={r.rating} />
                  <p>{r.content}</p>
                  <footer><strong>{r.first_name}
{r.last_name[0]}.</strong><span>{r.tour} · {date(r.created_at)}</span></footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <CallForm />
    </>
  )
}
