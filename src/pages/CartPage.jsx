import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ChevronRight, Utensils, Info } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import { formatNaira } from '../utils/currency'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart, tableNumber, setTableNumber } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [tableInput, setTableInput] = useState(tableNumber || '')
  const [note, setNote] = useState('')

  const placeOrder = async () => {
    if (!tableInput.trim()) { toast.error('Enter your table number'); return }
    if (items.length === 0)  { toast.error('Your cart is empty'); return }
    setPlacing(true)
    try {
      const orderItems = items.map(i => ({
        menuItem: i._id, name: i.name,
        selectedSize: i.selectedSize || null,
        qty: i.qty, price: i.price,
      }))
      await orderService.place({ items: orderItems, tableNumber: tableInput, notes: note, total })
      clearCart()
      toast.success('Order placed! Kitchen is on it.', {
        duration: 5000,
        style: { background:'var(--charcoal)', color:'white', border:'1px solid var(--crimson)' },
      })
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed, please try again')
    } finally { setPlacing(false) }
  }

  if (items.length === 0) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 1rem', paddingTop:'5rem', background:'var(--obsidian)' }}>
      <ShoppingBag size={64} style={{ color:'var(--crimson)', opacity:0.2, marginBottom:'1.5rem' }}/>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:'white', marginBottom:'0.75rem' }}>Your cart is empty</h2>
      <p style={{ fontSize:'0.875rem', color:'var(--text-muted)', marginBottom:'2rem' }}>Add some dishes to get started</p>
      <Link to="/menu" className="btn-crimson" style={{ padding:'0.85rem 2rem', borderRadius:'999px', fontSize:'0.875rem' }}>Browse Menu</Link>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', paddingTop:'6rem', paddingBottom:'5rem', paddingLeft:'1rem', paddingRight:'1rem', background:'var(--obsidian)' }}>
      <div style={{ maxWidth:'42rem', margin:'0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.875rem', color:'var(--text-muted)', marginBottom:'1.5rem', cursor:'pointer', background:'none', border:'none' }}
          onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
          <ArrowLeft size={16}/> Continue Shopping
        </button>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:'white', marginBottom:'2rem' }}>Your Order</h1>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem' }}>
          {items.map(item => (
            <div key={item.key} className="cart-item">
              <div className="cart-item__image">
                {item.image
                  ? <img src={item.image} alt={item.name}/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--muted)' }}>
                      <Utensils size={20} style={{ color:'var(--border)' }}/>
                    </div>
                }
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:500, color:'white', fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                {item.selectedSize && <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.15rem' }}>{item.selectedSize.label}</p>}
                <p style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--crimson)', marginTop:'0.25rem' }}>{formatNaira(item.price)}</p>
              </div>
              <div className="cart-item__controls">
                <button className="qty-btn" onClick={() => updateQty(item.key, item.qty-1)}><Minus size={12}/></button>
                <span style={{ fontWeight:700, fontSize:'0.9rem', color:'white', width:'1.5rem', textAlign:'center' }}>{item.qty}</span>
                <button className="qty-btn" onClick={() => updateQty(item.key, item.qty+1)}><Plus size={12}/></button>
                <button className="qty-btn qty-btn--delete" onClick={() => removeItem(item.key)} style={{ marginLeft:'0.25rem' }}><Trash2 size={12}/></button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.7rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.4rem' }}>Table Number *</label>
          <input value={tableInput} onChange={e => { setTableInput(e.target.value); setTableNumber(e.target.value) }}
            placeholder="e.g. Table 5" className="input-dark" style={{ background:'var(--charcoal)', border:'1px solid var(--border)' }}/>
        </div>

        <div style={{ marginBottom:'1.5rem' }}>
          <label style={{ display:'block', fontSize:'0.7rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.4rem' }}>Special Instructions (Optional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="Allergies, preferences, no onions…" className="input-dark"
            style={{ background:'var(--charcoal)', border:'1px solid var(--border)', resize:'none' }}/>
        </div>

        <div style={{ padding:'1.25rem', borderRadius:'1rem', marginBottom:'1.5rem', background:'var(--charcoal)', border:'1px solid var(--border)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem', marginBottom:'0.5rem', color:'var(--text-muted)' }}>
            <span>{items.reduce((s,i) => s+i.qty, 0)} items</span>
            <span>{formatNaira(total)}</span>
          </div>
          <div className="divider" style={{ margin:'0.75rem 0' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700 }}>
            <span style={{ color:'white' }}>Total</span>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'var(--crimson)' }}>{formatNaira(total)}</span>
          </div>
        </div>

        {!user && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', padding:'0.85rem 1rem', borderRadius:'10px', marginBottom:'1rem', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.25)', color:'var(--gold)', fontSize:'0.85rem' }}>
            <Info size={14} style={{ marginTop:'0.15rem', flexShrink:0 }}/>
            <span><Link to="/auth" style={{ color:'var(--gold)', fontWeight:600, textDecoration:'underline' }}>Sign in</Link> to track your order history. You can still order as a guest.</span>
          </div>
        )}

        <button onClick={placeOrder} disabled={placing} className="btn-crimson"
          style={{ width:'100%', padding:'1rem', borderRadius:'14px', fontSize:'1rem', gap:'0.5rem', opacity:placing?0.6:1 }}>
          {placing
            ? <div className="spinner" style={{ width:'1.2rem', height:'1.2rem', borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }}/>
            : <><ShoppingBag size={18}/> Place Order <ChevronRight size={16}/></>
          }
        </button>
      </div>
    </div>
  )
}
