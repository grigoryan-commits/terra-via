import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import Logo from './Logo.jsx'
import '../styles/header.css'

export default function Header() {
  const { user, setModal } = useAuth()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" onClick={close} aria-label="На главную"><Logo /></Link>
        <nav className={'nav' + (open ? ' nav-open' : '')}>
          <NavLink to="/tours" onClick={close}>Туры</NavLink>
          <NavLink to="/about" onClick={close}>О компании</NavLink>
          <NavLink to="/contacts" onClick={close}>Контакты</NavLink>
          {user && ['admin', 'manager'].includes(user.role) && (
            <NavLink to="/admin" onClick={close}>Панель управления</NavLink>
          )}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href="tel:+74951204500">+7 (495) 120-45-00</a>
          {user ? (
            <Link to="/account" className="btn btn-outline btn-sm" onClick={close}>{user.first_name}</Link>
          ) : (
            <button className="btn btn-dark btn-sm" onClick={() => setModal('login')}>Войти</button>
          )}
          <button className="burger" aria-label="Меню" onClick={() => setOpen(!open)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
