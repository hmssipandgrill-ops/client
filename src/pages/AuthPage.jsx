import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = mode === 'login' ? await login(email, password) : await register(name, email, password)
      toast.success('Welcome to HMS!', { style: { background: 'var(--charcoal)', color: 'white' } })
      if (user.role === 'kitchen') navigate('/kitchen')
      else if (['admin','staff'].includes(user.role)) navigate('/dashboard')
      else navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed')
    } finally { setLoading(false) }
  }

  const field = (icon, type, value, onChange, placeholder, extra) => (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>{icon}</span>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required
        className="input-dark" style={{ paddingLeft: '2.75rem', paddingRight: extra ? '2.75rem' : '1rem' }} />
      {extra}
    </div>
  )

  return (
    <div className="page particles-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '1rem' }}><Logo size="md" /></div>
          <h1 className="section-title" style={{ fontSize: '2rem' }}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {mode === 'login' ? 'Sign in to your HMS account' : 'Join the HMS experience'}
          </p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && field(<User size={15} />, 'text', name, e => setName(e.target.value), 'Full Name')}
            {field(<Mail size={15} />, 'email', email, e => setEmail(e.target.value), 'Email address')}
            {field(<Lock size={15} />, showPass ? 'text' : 'password', password, e => setPassword(e.target.value), 'Password', (
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            ))}
            <button type="submit" disabled={loading} className="btn-crimson" style={{ padding: '0.9rem', borderRadius: '12px', fontSize: '0.9rem', width: '100%', marginTop: '0.5rem', opacity: loading ? 0.6 : 1 }}>
              {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ color: 'var(--crimson)', fontWeight: 600, cursor: 'pointer' }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
