import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container page-msg">
      <h1>Страница не найдена</h1>
      <p>Возможно, тур снят с продажи или ссылка устарела.</p>
      <Link to="/" className="btn btn-dark">На главную</Link>
    </div>
  )
}
