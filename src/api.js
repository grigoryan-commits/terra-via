const API = import.meta.env.BASE_URL + 'api/'

async function request(path, options = {}) {
  const res = await fetch(API + path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    data = { message: 'Сервер вернул некорректный ответ' }
  }
  if (!res.ok) {
    const error = new Error(data.message || 'Ошибка запроса')
    error.status = res.status
    throw error
  }
  return data
}

export const get = (path) => request(path)
export const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })

export const img = (file) => import.meta.env.BASE_URL + 'img/' + (file || 'placeholder.jpg')

export const money = (v) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(v || 0))

export const date = (v) =>
  v ? new Date(v.replace(' ', 'T')).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'

export const FOOD = {
  RO: 'Без питания',
  BB: 'Завтраки',
  HB: 'Полупансион',
  FB: 'Полный пансион',
  AI: 'Всё включено',
  UAI: 'Ультра всё включено',
}

export const STATUS = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  paid: 'Оплачена',
  cancelled: 'Отменена',
}

export const nightsWord = (n) => {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return n + ' ночь'
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + ' ночи'
  return n + ' ночей'
}
