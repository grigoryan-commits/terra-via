import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-about">Туроператор полного цикла: собственные блоки мест на рейсах, проверенные отели и поддержка 24/7 во время поездки.</p>
        </div>
        <div>
          <h4>Разделы</h4>
          <Link to="/tours">Каталог туров</Link>
          <Link to="/about">О компании</Link>
          <Link to="/contacts">Контакты</Link>
        </div>
        <div>
          <h4>Контакты</h4>
          <a href="tel:+74951204500">+7 (495) 120-45-00</a>
          <a href="mailto:hello@terravia.ru">hello@terravia.ru</a>
          <span>Москва, ул. Тверская, 18</span>
        </div>
        <div>
          <h4>Документы</h4>
          <span>Реестровый номер РТО 024517</span>
          <span>ООО «Терра Виа», ИНН 7710123456</span>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 Terra Via. Учебный проект.</div>
    </footer>
  )
}
