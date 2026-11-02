import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { get, post, img, money, date, STATUS, nightsWord } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import '../styles/account.css'

function ReviewForm({ booking, onDone }) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState({ type: '', text: '' })

  const submit = async (e) => {
    e.preventDefault()
    if (content.trim().length < 10) return setMsg({ type: 'error', text: 'Напишите отзыв не короче 10 символов' })
    try {
      const d = await post('addReview.php', { tourId: booking.id_tour, rating, content })
      setMsg({ type: 'success', text: d.message })
      setTimeout(onDone, 1500)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  return (
    <form className="review-form" onSubmit={submit} noValidate>
      <div className="rating-pick">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)} aria-label={'Оценка ' + n}> </button>
        ))}
      </div>
      <textarea rows="3" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Расскажите, как прошла поездка" />
      {msg.text && <div className={'alert alert-' + msg.type}>{msg.text}</div>}
      <button className="btn btn-dark btn-sm">Отправить отзыв</button>
    </form>
  )
}

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [reviewFor, setReviewFor] = useState(null)
  const [payFor, setPayFor] = useState(null)

  const load = () => get('myBookings.php').then((d) =>
setBookings(d.bookings)).catch((e) => setMsg({ type: 'error', text: e.message }))
  useEffect(() => {
    load()
  }, [])

  const cancel = async (b) => {
    if (!window.confirm('Отменить бронирование №' + b.id_booking + '?')) return
    try {
      const d = await post('cancelBooking.php', { id: b.id_booking })
      setMsg({ type: 'success', text: d.message })
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const pay = async (b, method) => {
    try {
      const d = await post('pay.php', { id: b.id_booking, method })
      setMsg({ type: 'success', text: d.message + '. Бронирование №' + b.id_booking })
      setPayFor(null)
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const exit = async () => {
    await logout()
    navigate('/')
  }

  const today = new Date().toISOString().slice(0, 10)
  const active = bookings.filter((b) => b.status !== 'cancelled' && b.date_start >= today)

  return (
    <div className="container account">
      <div className="account-head">
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h1>{user.first_name} {user.last_name}</h1>
          <p className="muted">{user.email} · {user.phone}</p>
        </div>
        <div className="account-actions">
          {['admin', 'manager'].includes(user.role) && <Link to="/admin" className="btn btn-dark btn-sm">Панель управления</Link>}
          <button className="btn btn-outline btn-sm" onClick={exit}>Выйти</button>
        </div>
      </div>

      <div className="account-stats">
        <div><strong>{bookings.length}</strong><span>всего бронирований</span></div>
        <div><strong>{active.length}</strong><span>предстоящих поездок</span></div>
        <div><strong>{money(bookings.filter((b) => b.status === 'paid').reduce((s, b) => s + Number(b.total_price), 0))}</strong><span>оплачено</span></div>
      </div>

      {msg.text && <div className={'alert alert-' + msg.type}>{msg.text}</div>}

      <h2>Мои бронирования</h2>
      {bookings.length === 0 && (
        <div className="empty">У вас пока нет бронирований. <Link to="/tours">Перейти в каталог</Link></div>
      )}
      <div className="bookings">
        {bookings.map((b) => {
          const past = b.date_start < today
          return (
            <article key={b.id_booking} className="booking">
              <img src={img(b.image)} alt="" />
              <div className="booking-body">
                <div className="booking-top">
                  <span className="muted">№ {b.id_booking} от
{date(b.created_at)}</span>
                  <span className={'status status-' +
b.status}>{STATUS[b.status]}</span>
                </div>
                <h3><Link to={'/tours/' + b.id_tour}>{b.title}</Link></h3>
                <p className="muted">{b.country} · вылет {date(b.date_start)} из г. {b.departure_city} · {nightsWord(Number(b.nights))} · туристов: {b.persons}</p>
                <div className="booking-foot">
                  <strong>{money(b.total_price)}</strong>
                  <div className="booking-btns">
                    {b.status === 'confirmed' && !past && <button className="btn btn-accent btn-sm" onClick={() => setPayFor(payFor === b.id_booking ? null : b.id_booking)}>Оплатить</button>}
                    {['new', 'confirmed'].includes(b.status) && !past && <button className="btn btn-outline btn-sm" onClick={() => cancel(b)}>Отменить</button>}
                    {b.status === 'paid' && past && !Number(b.has_review) && <button className="btn btn-dark btn-sm" onClick={() => setReviewFor(reviewFor === b.id_booking ? null : b.id_booking)}>Оставить отзыв</button>}
                  </div>
                </div>
                {b.status === 'new' && <p className="hint">Заявка на проверке у менеджера. После подтверждения появится кнопка оплаты.</p>}
                {payFor === b.id_booking && (
                  <div className="pay-box">
                    <span>Способ оплаты:</span>
                    <button className="btn btn-dark btn-sm" onClick={() => pay(b, 'Карта')}>Банковская карта</button>
                    <button className="btn btn-dark btn-sm" onClick={() => pay(b, 'СБП')}>СБП</button>
                  </div>
                )}
                {reviewFor === b.id_booking && <ReviewForm booking={b} onDone={() => { setReviewFor(null); load() }} />}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
