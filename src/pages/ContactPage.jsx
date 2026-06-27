import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { contactService } from '../services/contactService'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', date:'', guests:'', message:'' })
  const [sending, setSending] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await contactService.submit(form)
      toast.success("Reservation request sent! We'll contact you shortly.", { duration: 5000, style: { background: 'var(--charcoal)', color: 'white', border: '1px solid var(--crimson)' } })
      setForm({ name:'', email:'', phone:'', date:'', guests:'', message:'' })
    } catch { toast.error('Failed to send. Please call us directly.') }
    finally { setSending(false) }
  }

  return (
    <div className="page particles-bg">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-label">Get In Touch</span>
          <h1 className="section-title">Contact & Reservations</h1>
          <div className="divider" style={{ width: '6rem', margin: '1rem auto 0' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.75rem', color: 'white', marginBottom: '1.5rem' }}>Visit Us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              {[
                { icon: <MapPin size={14} style={{ color: 'var(--crimson)' }} />, label: 'Address', text: '82 Sunmola Street, Bako Weighbridge, Owode, Mile 12, Ketu, Lagos', href: null },
                { icon: <Phone size={14} style={{ color: 'var(--crimson)' }} />, label: 'Phone', text: '+234 901 332 0348', href: 'tel:+2349013320348' },
                { icon: <Mail size={14} style={{ color: 'var(--crimson)' }} />, label: 'Email', text: 'hello@hmssipandgrill.com', href: 'mailto:hello@hmssipandgrill.com' },
                { icon: <Clock size={14} style={{ color: 'var(--crimson)' }} />, label: 'Hours', text: 'Monday – Sunday: 12:00 PM – Dawn', href: null },
              ].map(({ icon, label, text, href }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: 'rgba(196,30,58,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</p>
                    {href ? <a href={href} style={{ fontSize: '0.9rem', color: 'white' }}>{text}</a> : <p style={{ fontSize: '0.9rem', color: 'white' }}>{text}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--charcoal)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.35rem' }}>Grand Opening</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Join us on June 28, 2026 for a night you'll never forget. 12PM till dawn.</p>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: 'var(--crimson)', marginTop: '0.75rem' }}>28.06.2026</div>
            </div>
          </div>

          <div className="auth-card">
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>Make a Reservation</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div><label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Full Name *</label><input value={form.name} onChange={set('name')} required className="input-dark" placeholder="John Doe" /></div>
                <div><label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Phone *</label><input value={form.phone} onChange={set('phone')} required className="input-dark" placeholder="+234..." /></div>
              </div>
              <div><label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email *</label><input type="email" value={form.email} onChange={set('email')} required className="input-dark" placeholder="you@email.com" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div><label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Date</label><input type="date" value={form.date} onChange={set('date')} className="input-dark" /></div>
                <div><label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Guests</label><input type="number" min="1" value={form.guests} onChange={set('guests')} className="input-dark" placeholder="2" /></div>
              </div>
              <div><label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Special Requests</label><textarea value={form.message} onChange={set('message')} rows={3} className="input-dark" style={{ resize: 'none' }} placeholder="Dietary requirements, special occasions..." /></div>
              <button type="submit" disabled={sending} className="btn-crimson" style={{ padding: '0.9rem', borderRadius: '12px', fontSize: '0.9rem', width: '100%', gap: '0.5rem', marginTop: '0.5rem', opacity: sending ? 0.6 : 1 }}>
                {sending ? <span className="spinner" style={{ width: '1.1rem', height: '1.1rem', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <><Send size={15} /> Send Request</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
