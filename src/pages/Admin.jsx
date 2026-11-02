import { useEffect, useState } from 'react'
import { get, post, money } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import '../styles/admin.css'

const LABELS = {
  id_user: 'ID', id_country: 'ID страны', id_hotel: 'ID отеля', id_tour: 'ID тура', id_departure: 'ID вылета',
  id_booking: 'ID брони', id_payment: 'ID оплаты', id_review: 'ID отзыва', id_request: 'ID заявки',
  last_name: 'Фамилия', first_name: 'Имя', email: 'E-mail', phone: 'Телефон', role: 'Роль', created_at: 'Создано',
  name: 'Название', region: 'Регион', visa_required: 'Виза', description: 'Описание', image: 'Изображение',
  city: 'Город', stars: 'Звёзды', food_type: 'Питание', title: 'Название', tour_type: 'Тип', is_active: 'Активен',
  departure_city: 'Город вылета', date_start: 'Дата вылета', nights: 'Ночей', price: 'Цена', seats_total: 'Мест всего',
  seats_left: 'Свободно', persons: 'Туристов', total_price: 'Сумма', status: 'Статус', comment: 'Комментарий',
  amount: 'Сумма', method: 'Способ', paid_at: 'Дата оплаты', rating: 'Оценка', content: 'Текст', is_published: 'Опубликован',
  topic: 'Тема', message: 'Сообщение', password: 'Пароль',
}
const label = (k) => LABELS[k] || k
const short = (v) => {
  const s = v === null || v === undefined ? '-' : String(v)
  return s.length > 60 ? s.slice(0, 57) + '…' : s
}

function Field({ col, value, onChange }) {
  if (col.options) {
    return (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">-</option>
        {col.options.map((o) => <option key={o}>{o}</option>)}
      </select>
    )
  }
  const type = col.type === 'date' ? 'date' : ['int', 'tinyint', 'smallint', 'decimal'].includes(col.type) ? 'number' : col.type === 'datetime' ? 'text' : 'text'
  if (col.type === 'text') return <textarea rows="2" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  return <input type={type} value={value ?? ''} onChange={(e) =>
onChange(e.target.value)} placeholder={col.type === 'datetime' ? 'ГГГГ-ММ-ДД ЧЧ:ММ:СС' : ''} />
}

export default function Admin() {
  const { user } = useAuth()
  const [meta, setMeta] = useState({ tables: [], views: [] })
  const [stats, setStats] = useState(null)
  const [mode, setMode] = useState({ kind: 'table', name: 'bookings' })
  const [data, setData] = useState(null)
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    get('admin/meta.php').then(setMeta).catch((e) => setMsg({ type: 'error', text: e.message }))
    get('admin/stats.php').then(setStats).catch(() => {})
  }, [])

  const load = () => {
    setData(null)
    const url = mode.kind === 'table' ? 'admin/getTable.php?table=' + mode.name : 'admin/getView.php?view=' + mode.name
    get(url).then(setData).catch((e) => setMsg({ type: 'error', text: e.message }))
  }

  useEffect(() => {
    if (mode.name) load()
    setForm({})
    setEditId(null)
  }, [mode])

  const isTable = Boolean(data && data.columns)
  const editable = isTable ? data.columns.filter((c) => c.name !== data.pk && !c.extra.includes('auto_increment')) : []

  const startEdit = (row) => {
    setEditId(row[data.pk])
    setForm(row)
    setMsg({ type: '', text: '' })
  }

  const cancelEdit = () => {
    setEditId(null)
    setForm({})
  }

  const save = async () => {
    try {
      const d = editId
        ? await post('admin/updateRow.php', { table: mode.name, id: editId, row: form })
        : await post('admin/insertRow.php', { table: mode.name, row: form })
      setMsg({ type: 'success', text: d.message })
      cancelEdit()
      load()
      get('admin/stats.php').then(setStats).catch(() => {})
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const remove = async (row) => {
    if (!window.confirm('Удалить запись с ID ' + row[data.pk] + '?')) return
    try {
      const d = await post('admin/deleteRow.php', { table: mode.name, id: row[data.pk] })
      setMsg({ type: 'success', text: d.message })
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const columns = data ? (isTable ? data.columns.map((c) => c.name) : Object.keys(data.rows[0] || {})) : []

  return (
    <div className="admin">
      <div className="container">
        <div className="admin-head">
          <div>
            <p className="eyebrow">{user.role === 'admin' ? 'Администратор' : 'Менеджер'}</p>
            <h1>Панель управления</h1>
          </div>
          {stats && (
            <div className="admin-stats">
              <div><strong>{stats.newBookings}</strong><span>новых броней</span></div>
              <div><strong>{stats.newRequests}</strong><span>новых заявок</span></div>
              <div><strong>{stats.pendingReviews}</strong><span>отзывов на модерации</span></div>
              <div><strong>{money(stats.revenue)}</strong><span>выручка</span></div>
            </div>
          )}
        </div>

        <div className="admin-pickers">
          <label>Таблица
            <select value={mode.kind === 'table' ? mode.name : ''} onChange={(e) => e.target.value && setMode({ kind: 'table', name: e.target.value })}>
              <option value="">- выберите -</option>
              {meta.tables.map((t) => <option key={t.name} value={t.name}>{t.title} ({t.name})</option>)}
            </select>
          </label>
          <label>Представление
            <select value={mode.kind === 'view' ? mode.name : ''} onChange={(e) => e.target.value && setMode({ kind: 'view', name: e.target.value })}>
              <option value="">- выберите -</option>
              {meta.views.map((v, i) => <option key={v.name} value={v.name}>№{i + 1}. {v.title}</option>)}
            </select>
          </label>
        </div>

        {msg.text && <div className={'alert alert-' + msg.type}>{msg.text}</div>}

        {data && (
          <>
            <h2>{data.title} <small>{data.table || data.view} · записей: {data.rows.length}</small></h2>
            <div className="table-wrap">
              <table className="table admin-table">
                <thead>
                  <tr>
                    {columns.map((c) => <th key={c}>{label(c)}</th>)}
                    {isTable && <th>Действия</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => (
                    <tr key={isTable ? r[data.pk] : i} className={isTable && editId === r[data.pk] ? 'editing' : ''}>
                      {columns.map((c) => <td key={c} title={r[c] ?? ''}>{short(r[c])}</td>)}
                      {isTable && (
                        <td className="actions">
                          <button className="btn-mini btn-edit" onClick={() => startEdit(r)}>Редактировать</button>
                          <button className="btn-mini btn-del" onClick={() => remove(r)}>Удалить</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isTable && (
              <div className="admin-form">
                <h3>{editId ? 'Редактирование записи ID ' + editId : 'Добавление записи'}</h3>
                <div className="admin-form-grid">
                  {editable.map((c) => (
                    <label key={c.name}>{label(c.name)}{c.nullable === 'NO' && c.def === null ? '*' : ''}
                      <Field col={c} value={form[c.name]} onChange={(v) => setForm({ ...form, [c.name]: v })} />
                    </label>
                  ))}
                  {data.needsPassword && (
                    <label>{editId ? 'Новый пароль (не обязательно)' : 'Пароль*'}
                      <input type="password" value={form.password ?? ''} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </label>
                  )}
                </div>
                <div className="admin-form-btns">
                  <button className={'btn btn-sm ' + (editId ? 'btn-warn' : 'btn-blue')} onClick={save}>{editId ? 'Сохранить' : 'Добавить'}</button>
                  {editId && <button className="btn btn-sm btn-outline" onClick={cancelEdit}>Отмена</button>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
