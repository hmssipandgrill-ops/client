import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import Logo from '../ui/Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Logo size="md" />
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
              A new era. A new experience.<br />Be part of the beginning.
            </p>
            <div className="footer__social">
              {['IG','TW','FB'].map(s => <a key={s} href="#" className="footer__social-btn">{s}</a>)}
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>Quick Links</h4>
            {[['/', 'Home'], ['/menu', 'Menu'], ['/about', 'About'], ['/contact', 'Reservations']].map(([to, l]) => (
              <Link key={to} to={to} className="footer__link">{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <MapPin size={14} style={{ color: 'var(--crimson)', marginTop: '0.2rem', flexShrink: 0 }} />
                <span>82 Sunmola Street, Bako Weighbridge, Owode, Mile 12, Ketu, Lagos</span>
              </div>
              <a href="tel:+2349013320348" className="footer__link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                <Phone size={14} style={{ color: 'var(--crimson)' }} /> +234 901 332 0348
              </a>
              <a href="mailto:hello@hmssipandgrill.com" className="footer__link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                <Mail size={14} style={{ color: 'var(--crimson)' }} /> hello@hmssipandgrill.com
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>Hours</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Monday – Sunday</p>
            <p style={{ fontSize: '0.875rem', color: 'white', fontWeight: 500, marginTop: '0.25rem' }}>12:00 PM – Dawn</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--crimson)', marginTop: '1rem' }}>● Now Open</p>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} HMS Lounge & Bar. All rights reserved.</span>
          <span>Designed with passion for excellence</span>
        </div>
      </div>
    </footer>
  )
}
