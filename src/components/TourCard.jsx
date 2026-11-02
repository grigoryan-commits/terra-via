import { Link } from 'react-router-dom'
import { img, money, date, FOOD, nightsWord } from '../api.js'
import Stars from './Stars.jsx'

export default function TourCard({ tour }) {
  return (
    <article className="tour-card">
      <Link to={'/tours/' + tour.id_tour} className="tour-card-img">
        <img src={img(tour.image)} alt={tour.title} loading="lazy" />
        <span className="tag">{tour.tour_type}</span>
      </Link>
      <div className="tour-card-body">
        <div className="tour-card-place">{tour.country}, {tour.city}</div>
        <h3><Link to={'/tours/' + tour.id_tour}>{tour.title}</Link></h3>
        <div className="tour-card-meta">
          <span>{tour.hotel} <Stars value={tour.stars} /></span>
          <span>{FOOD[tour.food_type]}</span>
          <span>Ближайший вылет: {date(tour.nearest_date)}</span>
        </div>
        <div className="tour-card-foot">
          <div>
            <small>от, за 1 туриста · {nightsWord(Number(tour.nights))}</small>
            <strong>{money(tour.min_price)}</strong>
          </div>
          <Link className="btn btn-accent btn-sm" to={'/tours/' + tour.id_tour}>Подробнее</Link>
        </div>
      </div>
    </article>
  )
}
