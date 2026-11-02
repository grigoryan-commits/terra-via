import CallForm from '../components/CallForm.jsx'
import '../styles/about.css'

export default function Contacts() {
  return (
    <>
      <div className="container contacts">
        <h1>Контакты</h1>
        <div className="contacts-grid">
          <div className="contacts-info">
            <div><span>Офис</span><strong>Москва, ул. Тверская, 18, офис 304</strong></div>
            <div><span>Телефон</span><a href="tel:+74951204500">+7 (495) 120-45-00</a></div>
            <div><span>E-mail</span><a
href="mailto:hello@terravia.ru">hello@terravia.ru</a></div>
            <div><span>Часы работы</span><strong>Пн-Пт 10:00-20:00, Сб 11:00-17:00</strong></div>
            <div><span>Мессенджеры</span><strong>Telegram @terravia_tours · WhatsApp +7 (999) 120-45-00</strong></div>
          </div>
          <iframe
            className="map"
            title="Офис Terra Via на карте"
            src="https://yandex.ru/map-widget/v1/?ll=37.604856%2C55.765095&z=16&pt=37.604856,55.765095,pm2rdm"
            loading="lazy"
          />
        </div>
      </div>
      <CallForm />
    </>
  )
}
