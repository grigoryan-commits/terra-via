import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { post } from '../api.js'
import '../styles/auth.css'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function AuthModal() {
  const { modal, setModal, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ lastName: '', firstName: '', email: '', phone: '', password: '', password2: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setMsg({ type: '', text: '' })
  }, [modal])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setModal(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setModal])

  if (!modal) return null
  const isLogin = modal === 'login'
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const validate = () => {
    if (isLogin) {
      if (!form.email || !form.password) return 'Заполните все поля'
      if (!emailRe.test(form.email)) return 'Некорректный e-mail'
      return ''
    }
    if (!form.lastName || !form.firstName || !form.email || !form.phone || !form.password) return 'Заполните все поля'
    if (!/^[А-ЯЁа-яёA-Za-z\- ]{2,60}$/.test(form.lastName + form.firstName)) return 'Имя и фамилия могут содержать только буквы и дефис'
    if (!emailRe.test(form.email)) return 'Некорректный e-mail'
    if (!/^\+?[0-9\s\-()]{10,20}$/.test(form.phone)) return 'Некорректный номер телефона'
    if (form.password.length < 8 || !/\d/.test(form.password) || !/[A-Za-zА-Яа-я]/.test(form.password)) return 'Пароль должен быть не короче 8 символов и содержать буквы и цифры'
    if (form.password !== form.password2) return 'Пароли не совпадают'
    return ''
  }

  const submit = async (e) => {
    e.preventDefault()
    const error = validate()
    if (error) return setMsg({ type: 'error', text: error })
    setBusy(true)
    try {
      if (isLogin) {
        const u = await login(form.email, form.password)
        setModal(null)
        navigate(['admin', 'manager'].includes(u.role) ? '/admin' : '/account')
      } else {
        const d = await post('register.php', form)
        setModal('login')
        setTimeout(() => setMsg({ type: 'success', text: d.message }), 0)
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={() => setModal(null)} aria-label="Закрыть">×</button>
        <h2>{isLogin ? 'Вход в личный кабинет' : 'Регистрация'}</h2>
        <form onSubmit={submit} noValidate>
          {!isLogin && (
            <div className="row2">
              <label>Фамилия<input value={form.lastName} onChange={set('lastName')} /></label>
              <label>Имя<input value={form.firstName} onChange={set('firstName')} /></label>
            </div>
          )}
          <label>E-mail<input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
          {!isLogin && <label>Телефон<input value={form.phone} onChange={set('phone')} placeholder="+7 (900) 000-00-00" /></label>}
          <label>Пароль<input type="password" value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} /></label>
          {!isLogin && <label>Повторите пароль<input type="password" value={form.password2} onChange={set('password2')} /></label>}
          {msg.text && <div className={'alert alert-' + msg.type}>{msg.text}</div>}
          <button className="btn btn-dark btn-block" disabled={busy}>{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
        </form>
        <p className="modal-switch">
          {isLogin ? 'Ещё нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button onClick={() => setModal(isLogin ? 'register' : 'login')}>{isLogin ? 'Регистрация' : 'Войти'}</button>
        </p>
      </div>
    </div>
  )
}
