import { img } from '../api.js'
import '../styles/about.css'

const history = [
  ['2008', 'Открыли первый офис на Тверской и отправили 600 туристов в Турцию и Египет.'],
  ['2013', 'Получили статус туроператора и начали работать с собственными блоками мест на рейсах.'],
  ['2017', 'Добавили экскурсионные и горнолыжные программы по России.'],
  ['2021', 'Запустили онлайн-бронирование: сегодня через сайт оформляется 70% заказов.'],
  ['2026', 'Работаем с 8 странами и отправляем туристов из Москвы, Петербурга и Казани.'],
]

const team = [
  ['Мария Орлова', 'Руководитель отдела продаж'],
  ['Артём Белов', 'Эксперт по Азии'],
  ['Дина Сафина', 'Визовый отдел'],
  ['Глеб Ковалёв', 'Поддержка 24/7'],
]

export default function About() {
  return (
    <>
      <section className="about-hero" style={{ backgroundImage:
`url(${img('about.jpg')})` }}>
        <div className="hero-shade" />
        <div className="container"><h1>О компании</h1><p>Мы собираем путешествия так, как собирали бы для себя: проверяем отели лично и отвечаем за каждый этап поездки.</p></div>
      </section>
      <section className="section">
        <div className="container about-mission">
          <h2>Миссия</h2>
          <p>Сделать организованный отдых прозрачным: честная цена без скрытых доплат, понятные условия и человек, который на связи в любое время суток.</p>
        </div>
      </section>
      <section className="section section-sand">
        <div className="container">
          <h2>История</h2>
          <ol className="timeline">
            {history.map(([y, t]) => <li key={y}><strong>{y}</strong><p>{t}</p></li>)}
          </ol>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Команда</h2>
          <div className="team">
            {team.map(([n, r]) => (
              <div key={n} className="member">
                <div className="avatar">{n.split(' ').map((p) => p[0]).join('')}</div>
                <strong>{n}</strong><span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
