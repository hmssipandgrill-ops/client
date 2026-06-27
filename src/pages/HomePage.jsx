import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ArrowRight, Star, MapPin, Clock, Zap, Utensils, Wine, Music, Shield } from 'lucide-react'
import { menuService } from '../services/menuService'
import { formatNaira } from '../utils/currency'
import { getItemPrice } from '../utils/helpers'

function FeaturedCard({ item, idx }) {
  return (
    <Link to={`/menu/${item._id}`} className="menu-card animate-fade-up" style={{ animationDelay: idx * 0.1 + 's' }}>
      <div className="menu-card__image">
        {item.image
          ? <img src={item.image} alt={item.name} loading="lazy"/>
          : <div className="menu-card__placeholder" style={{ background:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Utensils size={36} style={{ color:'var(--border)' }}/>
            </div>
        }
        <div className="img-overlay"/>
        <div className="menu-card__badges">
          <span className="badge" style={{ background:'rgba(10,10,10,0.8)', color:'var(--gold)', border:'1px solid rgba(201,168,76,0.3)' }}>{item.category}</span>
          {item.isPopular && <span className="badge" style={{ background:'var(--crimson)', color:'white', display:'flex', alignItems:'center', gap:'3px' }}><Star size={9}/> Popular</span>}
        </div>
      </div>
      <div className="menu-card__body">
        <div className="menu-card__name">{item.name}</div>
        <div className="menu-card__desc">{item.description}</div>
        <div className="menu-card__footer">
          <span className="menu-card__price">{formatNaira(getItemPrice(item))}</span>
          <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>View</span>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    menuService.getAll({ featured: true, limit: 6 }).then(d => setFeatured(d.items || [])).catch(() => {})
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const marqueeItems = [
    { icon: Utensils, text: 'Fine Dining' },
    { icon: Wine,     text: 'Craft Cocktails' },
    { icon: Music,    text: 'Live Entertainment' },
    { icon: Shield,   text: 'Private Events' },
    { icon: Zap,      text: 'VIP Service' },
    { icon: Star,     text: 'Rooftop Vibes' },
  ]

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="hero__bg" style={{ transform:`translateY(${scrollY * 0.28}px)` }}/>
        <div className="hero__overlay"/>
        <div className="hero__orb-1"/>
        <div className="hero__orb-2"/>

        <div className="hero__content">
          <div className="hero__opening-badge">
            <Zap size={10}/> Grand Opening – June 28, 2026
          </div>
          <h1>
            <span className="hero__title-main">HMS</span>
            <span className="hero__title-sub shimmer-text">Lounge & Bar</span>
          </h1>
          <p className="hero__tagline">A New Era. A New Experience.</p>
          <div className="hero__cta">
            <Link to="/menu" className="btn-crimson" style={{ padding:'1rem 2rem', borderRadius:'999px', fontSize:'0.875rem', letterSpacing:'0.05em', gap:'0.5rem' }}>
              Explore Menu <ArrowRight size={16}/>
            </Link>
            <Link to="/contact" className="btn-outline" style={{ padding:'1rem 2rem', borderRadius:'999px', fontSize:'0.875rem' }}>
              Reserve Table
            </Link>
          </div>
        </div>

        <div className="hero__scroll">
          <span>Scroll</span>
          <ChevronDown size={16} className="animate-bounce"/>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          {Array(4).fill(marqueeItems).flat().map((item, i) => (
            <span key={i} className="marquee-item" style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <item.icon size={12}/> {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="section particles-bg">
        <div className="container">
          <div className="stats-strip">
            {[
              { num:'50+',    label:'Signature Dishes' },
              { num:'100+',   label:'Cocktail Varieties' },
              { num:'200',    label:'Seating Capacity' },
              { num:'5/5',    label:'Guest Experience' },
            ].map((s, i) => (
              <div key={i} className="stat-card animate-fade-up" style={{ animationDelay: i * 0.1 + 's' }}>
                <div className="stat-card__num shimmer-text">{s.num}</div>
                <div className="stat-card__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED MENU */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
            <span className="section-label">From Our Kitchen</span>
            <h2 className="section-title">Featured Selection</h2>
            <div className="divider" style={{ width:'5rem', margin:'1rem auto 0' }}/>
          </div>

          {featured.length > 0 ? (
            <div className="menu-grid">
              {featured.map((item, i) => <FeaturedCard key={item._id} item={item} idx={i}/>)}
            </div>
          ) : (
            <div className="menu-grid">
              {Array(6).fill(null).map((_, i) => <div key={i} className="skeleton" style={{ height:'18rem' }}/>)}
            </div>
          )}

          <div style={{ textAlign:'center', marginTop:'3rem' }}>
            <Link to="/menu" className="btn-crimson" style={{ padding:'1rem 2.5rem', borderRadius:'999px', fontSize:'0.875rem', gap:'0.5rem' }}>
              View Full Menu <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT STRIP */}
      <section className="section particles-bg">
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'3rem', alignItems:'center' }}>
            <div>
              <span className="section-label" style={{ color:'var(--gold)' }}>Our Story</span>
              <h2 className="section-title">Where Every Night Becomes a Memory</h2>
              <p style={{ marginTop:'1.25rem', lineHeight:1.8, color:'var(--text-secondary)', fontSize:'0.95rem' }}>
                HMS Lounge & Bar was born from a vision of creating Lagos's most sophisticated nightlife destination.
                From our signature cocktails crafted with premium spirits to our extraordinary cuisine,
                every detail is designed to elevate your experience beyond the ordinary.
              </p>
              <div style={{ display:'flex', gap:'1.5rem', marginTop:'1.5rem', flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem', color:'var(--text-muted)' }}>
                  <Clock size={14} style={{ color:'var(--crimson)' }}/> 12PM – Dawn
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem', color:'var(--text-muted)' }}>
                  <MapPin size={14} style={{ color:'var(--crimson)' }}/> Mile 12, Ketu
                </div>
              </div>
              <Link to="/about" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', marginTop:'1.75rem', fontSize:'0.875rem', fontWeight:600, color:'var(--crimson)' }}>
                Learn More <ArrowRight size={14}/>
              </Link>
            </div>
            <div style={{ position:'relative' }}>
              <div className="border-animate" style={{ borderRadius:'1.25rem', overflow:'hidden', border:'2px solid var(--crimson)' }}>
                <img src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80" alt="HMS Ambiance"
                  style={{ width:'100%', height:'20rem', objectFit:'cover', display:'block' }}/>
              </div>
              <div className="glass" style={{ position:'absolute', bottom:'-1rem', left:'-1rem', padding:'1rem 1.25rem', borderRadius:'0.75rem' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.25rem', fontWeight:700, color:'var(--crimson)' }}>Since</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.75rem', fontWeight:700, color:'white' }}>2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background:'var(--charcoal)', textAlign:'center' }}>
        <div className="container" style={{ maxWidth:'42rem' }}>
          <h2 className="section-title">Ready for an Unforgettable Evening?</h2>
          <p style={{ marginTop:'1rem', color:'var(--text-secondary)' }}>Reserve your table or order from our menu tonight.</p>
          <div style={{ display:'flex', gap:'1rem', marginTop:'2rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/menu" className="btn-crimson" style={{ padding:'1rem 2rem', borderRadius:'999px', fontSize:'0.875rem' }}>Order Now</Link>
            <Link to="/contact" className="btn-outline" style={{ padding:'1rem 2rem', borderRadius:'999px', fontSize:'0.875rem' }}>Make Reservation</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
