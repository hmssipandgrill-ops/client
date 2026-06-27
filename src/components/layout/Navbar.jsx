import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, X, LogOut, ChefHat, LayoutDashboard, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import Logo from '../ui/Logo'

const NAV_LINKS = [
  { to: '/',       label: 'Home' },
  { to: '/menu',   label: 'Menu' },
  { to: '/about',  label: 'About' },
  { to: '/contact',label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { count } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setOpen(false), [location])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/"><Logo size="sm" /></Link>

        <div className="navbar__links">
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} className={`navbar__link${location.pathname === l.to ? ' active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="navbar__actions">
          {(!user || user?.role === 'customer') && (
            <Link to="/cart" className="navbar__cart">
              <ShoppingBag size={20} />
              {count > 0 && <span className="navbar__cart-badge notification-ping">{count}</span>}
            </Link>
          )}

          {user ? (
            <div className="navbar__links">
              {user.role === 'kitchen' && (
                <Link to="/kitchen" className="navbar__link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ChefHat size={14} /> Kitchen
                </Link>
              )}
              {['admin','staff'].includes(user.role) && (
                <Link to="/dashboard" className="navbar__link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="navbar__link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <LogOut size={14} /> Out
              </button>
              <div className="navbar__user-dot">{user.name[0].toUpperCase()}</div>
            </div>
          ) : (
            <Link to="/auth" className="btn-crimson" style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', fontSize: '0.8rem', gap: '0.35rem' }}>
              <User size={14} /> Sign In
            </Link>
          )}

          <button className="navbar__mobile-toggle" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`navbar__mobile-menu${open ? ' open' : ''}`}>
        {NAV_LINKS.map(l => (
          <Link key={l.to} to={l.to} className="navbar__mobile-link">{l.label}</Link>
        ))}
        {user ? (
          <>
            {user.role === 'kitchen' && <Link to="/kitchen" className="navbar__mobile-link">Kitchen Dashboard</Link>}
            {['admin','staff'].includes(user.role) && <Link to="/dashboard" className="navbar__mobile-link">Admin Dashboard</Link>}
            <button onClick={handleLogout} style={{ textAlign: 'left', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--crimson)', cursor: 'pointer', padding: '0.6rem 0' }}>
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn-crimson" style={{ padding: '0.75rem', borderRadius: '10px', justifyContent: 'center', marginTop: '0.5rem' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}
