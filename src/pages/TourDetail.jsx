import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { get, post, img, money, date, FOOD, nightsWord } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import Stars from '../components/Stars.jsx'
import CallForm from '../components/CallForm.jsx'
import '../styles/tour.css'

export default function TourDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, setModal } = useAuth()
  const [tour, setTour] = useState(null)
  const [error, setError] = useState('')
  const [depId, setDepId] = useState('')
  const [persons, setPersons] = useState(2)
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)

  const load = () =>
    get('tour.php?id=' + id)
      .then((d) => {
        setTour(d.tour)
        const first = d.tour.departures.find((x) => x.seats_left > 0)
        setDepId(first ? String(first.id_departure) : '')
      })
      .catch((e) => setError(e.message))

  useEffect(() => {
    load()
  }, [id])

  if (error) return <div className="container page-msg"><h1>{error}</h1><Link to="/tours" className="btn btn-dark">В каталог</Link></div>
  if (!tour) return <div className="page-loader">Загрузка…</div>

  const dep = tour.departures.find((d) => String(d.id_departure) === depId)
  const total = dep ? dep.price * persons : 0
  const rating = tour.reviews.length ? tour.reviews.reduce((s, r) => s + Number(r.rating), 0) / tour.reviews.length : 0

  const book = async (e) => {
    e.preventDefault()
    if (!user) return setModal('login')
    if (!dep) return setMsg({ type: 'error', text: 'Выберите дату вылета' })
    if (persons < 1 || persons > 10) return setMsg({ type: 'error', text: 'Количество туристов - от 1 до 10' })
    if (persons > dep.seats_left) return setMsg({ type: 'error', text: 'Недостаточно свободных мест. Осталось: ' + dep.seats_left })
    setBusy(true)
    try {
      const d = await post('book.php', { departureId: dep.id_departure, persons, comment })
      setMsg({ type: 'success', text: d.message })
      await load()
      setTimeout(() => navigate('/account'), 1500)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section className="tour-hero" style={{ backgroundImage:
`url(${img(tour.image)})` }}>
        <div className="hero-shade" />
        <div className="container tour-hero-inner">
          <Link to="/tours" className="back">← Все туры</Link>
          <span className="tag">{tour.tour_type}</span>
          <h1>{tour.title}</h1>
          <p>{tour.country}, {tour.city} · {tour.hotel} <Stars value={tour.stars} /></p>
        </div>
      </section>

      <div className="container tour-layout">
        <div className="tour-info">
          <h2>О туре</h2>
          <p>{tour.description}</p>
          <dl className="facts">
            <div><dt>Отель</dt><dd>{tour.hotel}, {tour.stars} </dd></div>
            <div><dt>Питание</dt><dd>{FOOD[tour.food_type]}</dd></div>
            <div><dt>Виза</dt><dd>{Number(tour.visa_required) ? 'Нужна, оформляем мы' : 'Не нужна'}</dd></div>
            <div><dt>Рейтинг</dt><dd>{rating ? rating.toFixed(1) + ' из 5' : 'Пока нет оценок'}</dd></div>
          </dl>
          <h3>Об отеле</h3>
          <p>{tour.hotel_description}</p>

          <h2>Даты вылетов</h2>
          <table className="table">
            <thead><tr><th>Дата</th><th>Город вылета</th><th>Длительность</th><th>Цена за 1 туриста</th><th>Мест</th></tr></thead>
            <tbody>
              {tour.departures.map((d) => (
                <tr key={d.id_departure} className={String(d.id_departure) === depId ? 'active' : ''} onClick={() => d.seats_left > 0 && setDepId(String(d.id_departure))}>
                  <td>{date(d.date_start)}</td>
                  <td>{d.departure_city}</td>
                  <td>{nightsWord(Number(d.nights))}</td>
                  <td>{money(d.price)}</td>
                  <td>{d.seats_left > 0 ? d.seats_left : 'нет мест'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Отзывы</h2>
          {tour.reviews.length === 0 && <p className="muted">Отзывов пока нет.</p>}
          {tour.reviews.map((r, i) => (
            <div key={i} className="review-line">
              <Stars value={r.rating} /> <strong>{r.first_name}</strong> <span className="muted">{date(r.created_at)}</span>
              <p>{r.content}</p>
            </div>
          ))}
        </div>

        <aside className="booking-box">
          <h3>Бронирование</h3>
          <form onSubmit={book} noValidate>
            <label>Дата вылета
              <select value={depId} onChange={(e) => setDepId(e.target.value)}>
                {tour.departures.filter((d) => d.seats_left > 0).map((d) => (
                  <option key={d.id_departure}
value={d.id_departure}>{date(d.date_start)} · {nightsWord(Number(d.nights))} · {d.departure_city}</option>
                ))}
              </select>
            </label>
            <label>Туристов
              <input type="number" min="1" max="10" value={persons} onChange={(e) => setPersons(Number(e.target.value))} />
            </label>
            <label>Пожелания
              <textarea rows="2" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Например: номер с видом на море" />
            </label>
            <div className="booking-total"><span>Итого</span><strong>{money(total)}</strong></div>
            {msg.text && <div className={'alert alert-' + msg.type}>{msg.text}</div>}
            <button className="btn btn-accent btn-block" disabled={busy || !dep}>{user ? 'Забронировать' : 'Войти и забронировать'}</button>
            <a className="btn btn-outline btn-block" href="tel:+74951204500">Позвонить менеджеру</a>
          </form>
        </aside>
      </div>

      <CallForm title="Остались вопросы по туру?" subtitle={'Менеджер расскажет об отеле, перелёте и документах для поездки «' + tour.title + '».'} />
    </>
  )
}
