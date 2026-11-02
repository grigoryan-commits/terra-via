import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import AuthModal from './components/AuthModal.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import TourDetail from './pages/TourDetail.jsx'
import About from './pages/About.jsx'
import Contacts from './pages/Contacts.jsx'
import Account from './pages/Account.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Protected({ roles, children }) {
  const { user, ready, setModal } = useAuth()
  useEffect(() => {
    if (ready && !user) setModal('login')
  }, [ready, user, setModal])
  if (!ready) return <div className="page-loader">Загрузка…</div>
  if (!user) return <Navigate to="/" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/account" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Catalog />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/account" element={<Protected><Account /></Protected>} />
          <Route path="/admin" element={<Protected roles={['admin', 'manager']}><Admin /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
    </AuthProvider>
  )
}
