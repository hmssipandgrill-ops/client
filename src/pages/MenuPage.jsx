import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, ShoppingBag, Utensils, Leaf } from 'lucide-react'
import { useMenu } from '../hooks/useMenu'
import { useDebounce } from '../hooks/useDebounce'
import { useCart } from '../context/CartContext'
import { categoryService } from '../services/categoryService'
import { formatNaira } from '../utils/currency'
import { getItemPrice } from '../utils/helpers'
import toast from 'react-hot-toast'

function MenuItem({ item }) {
  const { addItem } = useCart()
  const price   = getItemPrice(item)
  const hasSize = item.sizes?.length > 0

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (hasSize) return
    addItem(item)
    toast.success(`${item.name} added!`, {
      style: { background:'var(--charcoal)', color:'white', border:'1px solid var(--crimson)' }
    })
  }

  return (
    <Link to={`/menu/${item._id}`} className="menu-card">
      <div className="menu-card__image">
        {item.image
          ? <img src={item.image} alt={item.name} loading="lazy"/>
          : <div className="menu-card__placeholder" style={{ background:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Utensils size={32} style={{ color:'var(--border)' }}/>
            </div>
        }
        <div className="img-overlay"/>
        <div className="menu-card__badges">
          {item.isVegetarian && (
            <span className="badge" style={{ background:'rgba(34,197,94,0.2)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', gap:'3px' }}>
              <Leaf size={9}/> Veg
            </span>
          )}
          {item.isPopular && (
            <span className="badge" style={{ background:'var(--crimson)', color:'white', display:'flex', alignItems:'center', gap:'3px' }}>
              <Star size={9}/> Hot
            </span>
          )}
        </div>
      </div>
      <div className="menu-card__body">
        <div className="menu-card__name">{item.name}</div>
        <div className="menu-card__desc">{item.description}</div>
        <div className="menu-card__footer">
          <span className="menu-card__price">{formatNaira(price)}{hasSize ? '+' : ''}</span>
          <button className="menu-card__add" onClick={handleQuickAdd}
            style={{ background: hasSize ? 'var(--muted)' : 'var(--crimson)' }}>
            <ShoppingBag size={12}/>
          </button>
        </div>
      </div>
    </Link>
  )
}

export default function MenuPage() {
  const [categoryList, setCategoryList] = useState(['All'])
  const [category, setCategory]         = useState('All')
  const [searchInput, setSearchInput]   = useState('')
  const [page, setPage]                 = useState(1)
  const search = useDebounce(searchInput, 400)
  const { items, total, loading } = useMenu({ category, search, limit:12, page })

  useEffect(() => {
    categoryService.getAll().then(d => {
      const names = (d.categories || []).map(c => c.name)
      setCategoryList(['All', ...names])
    }).catch(() => {})
  }, [])

  return (
    <div className="page particles-bg">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:'3rem' }}>
          <span className="section-label">Our Selection</span>
          <h1 className="section-title">The Menu</h1>
          <div className="divider" style={{ width:'5rem', margin:'1rem auto 0' }}/>
        </div>

        <div className="search-wrap" style={{ marginBottom:'2rem' }}>
          <Search size={16}/>
          <input className="search-input input-dark" value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPage(1) }}
            placeholder="Search dishes, drinks…"/>
        </div>

        <div className="category-bar" style={{ marginBottom:'2rem' }}>
          {categoryList.map(c => (
            <button key={c} className={`category-btn${category === c ? ' active' : ''}`}
              onClick={() => { setCategory(c); setPage(1) }}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="menu-grid">
            {Array(8).fill(null).map((_, i) => <div key={i} className="skeleton" style={{ height:'16rem' }}/>)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'6rem 0' }}>
            <Utensils size={48} style={{ color:'var(--border)', margin:'0 auto 1rem', display:'block' }}/>
            <h2 className="section-title" style={{ fontSize:'1.5rem' }}>Nothing found</h2>
            <p style={{ color:'var(--text-muted)', marginTop:'0.5rem', fontSize:'0.875rem' }}>Try a different search or category</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'1rem' }}>{total} items found</p>
            <div className="menu-grid">
              {items.map(item => <MenuItem key={item._id} item={item}/>)}
            </div>
            {total > 12 && (
              <div style={{ display:'flex', justifyContent:'center', gap:'0.75rem', marginTop:'2.5rem' }}>
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  className="btn-outline" style={{ padding:'0.6rem 1.25rem', borderRadius:'10px', fontSize:'0.875rem', opacity: page===1 ? 0.4 : 1 }}>
                  Previous
                </button>
                <span style={{ padding:'0.6rem', color:'var(--text-muted)', fontSize:'0.875rem' }}>Page {page}</span>
                <button onClick={() => setPage(p => p+1)} disabled={page * 12 >= total}
                  className="btn-crimson" style={{ padding:'0.6rem 1.25rem', borderRadius:'10px', fontSize:'0.875rem', opacity: page*12>=total ? 0.4 : 1 }}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
