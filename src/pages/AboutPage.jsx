import { MapPin, Phone, Mail, Clock, Star } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="page particles-bg">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="section-label">Our Story</span>
          <h1 className="section-title">About HMS Lounge & Bar</h1>
          <div className="divider" style={{ width: '6rem', margin: '1rem auto 0' }} />
        </div>

        <div style={{ borderRadius: '1.25rem', overflow: 'hidden', height: '18rem', marginBottom: '4rem', position: 'relative' }}>
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80" alt="HMS Interior" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div className="img-overlay" />
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem' }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>A New Era. A New Experience.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', marginBottom: '4rem' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Our Vision</h2>
            <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              HMS Lounge & Bar was founded with one singular vision: to create Lagos's most sophisticated and memorable nightlife experience. We believe that great food, exceptional drinks, and an extraordinary atmosphere are necessities of a life well-lived.
            </p>
            <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              From our meticulously crafted cocktail menu to our kitchen's masterful cuisine, every element at HMS has been designed to elevate your senses and create lasting memories.
            </p>
          </div>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>The Experience</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Handcrafted signature cocktails by expert mixologists','Fresh, locally-sourced ingredients in every dish','Live entertainment on weekends','Private dining and event spaces available','VIP table reservations for special occasions'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Star size={12} style={{ color: 'var(--gold)', fill: 'var(--gold)', marginTop: '0.25rem', flexShrink: 0 }} /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: <MapPin size={16} style={{ color: 'var(--crimson)' }} />, label: 'Find Us', value: '82 Sunmola Street, Bako Weighbridge, Owode, Mile 12, Ketu, Lagos' },
            { icon: <Phone size={16} style={{ color: 'var(--crimson)' }} />, label: 'Call Us', value: '+234 901 332 0348' },
            { icon: <Clock size={16} style={{ color: 'var(--crimson)' }} />, label: 'Hours', value: 'Monday – Sunday\n12:00 PM – Dawn' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="info-card">
              <div className="info-card__icon">{icon}</div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
              <p style={{ fontSize: '0.9rem', color: 'white', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
