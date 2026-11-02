import { useState } from 'react'
import { post } from '../api.js'
import '../styles/callform.css'

const empty = { name: '', phone: '', email: '', topic: 'Подбор тура', message: '', agree: false }

export default function CallForm({ title = 'Подберём тур за 15 минут', subtitle }) {
  const [form, setForm] = useState(empty)
  const [state, setState] = useState({ type: '', text: '' })
  const [sending, setSending] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setState({ type: 'error', text: 'Укажите имя и телефон' })
      return
    }
    setSending(true)
    try {
      const d = await post('sendRequest.php', form)
      setState({ type: 'success', text: d.message })
      setForm(empty)
    } catch (err) {
      setState({ type: 'error', text: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="callform" id="callform">
      <div className="container callform-inner">
        <div className="callform-text">
          <h2>{title}</h2>
          <p>{subtitle || 'Оставьте заявку - менеджер свяжется с вами, уточнит пожелания и пришлёт 3-5 подходящих вариантов.'}</p>
          <ul>
            <li>Без комиссии и скрытых доплат</li>
            <li>Рассрочка на 6 месяцев</li>
            <li>Фиксируем цену на 3 дня</li>
          </ul>
        </div>
        <form className="callform-form" onSubmit={submit} noValidate>
          <div className="row2">
            <label>Имя*<input value={form.name} onChange={set('name')} placeholder="Анна" /></label>
            <label>Телефон*<input value={form.phone} onChange={set('phone')} placeholder="+7 (900) 000-00-00" /></label>
          </div>
          <div className="row2">
            <label>E-mail<input value={form.email} onChange={set('email')} placeholder="mail@example.ru" /></label>
            <label>Тема
              <select value={form.topic} onChange={set('topic')}>
                <option>Подбор тура</option>
                <option>Бронирование</option>
                <option>Визы и документы</option>
                <option>Другое</option>
              </select>
            </label>
          </div>
          <label>Комментарий<textarea rows="3" value={form.message} onChange={set('message')} placeholder="Куда, когда, сколько человек, бюджет" /></label>
          <label className="check"><input type="checkbox" checked={form.agree} onChange={set('agree')} /> Согласен на обработку персональных данных</label>
          {state.text && <div className={'alert alert-' +
state.type}>{state.text}</div>}
          <button className="btn btn-accent" disabled={sending}>{sending ? 'Отправляем…' : 'Отправить заявку'}</button>
        </form>
      </div>
    </section>
  )
}
