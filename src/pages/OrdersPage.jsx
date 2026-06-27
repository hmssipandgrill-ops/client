import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ChefHat, XCircle, RefreshCw, Clock, Utensils } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { orderService } from '../services/orderService'
import { formatNaira } from '../utils/currency'
import { formatDateTime } from '../utils/date'
import { STATUS_CONFIG } from '../utils/orderStatus'

export default function OrdersPage() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const { user }  = useAuth()
  const socket    = useSocket()
  const navigate  = useNavigate()

  const fetchOrders = () => {
    orderService.getMyOrders()
      .then(d => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    fetchOrders()
  }, [user])

  useEffect(() => {
    if (!socket) return
    socket.emit('join-user', user?._id)
    socket.on('my-order-updated', order => setOrders(prev => prev.map(o => o._id === order._id ? order : o)))
    socket.on('order-ready', fetchOrders)
    return () => { socket.off('my-order-updated'); socket.off('order-ready') }
  }, [socket, user])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'5rem', background:'var(--obsidian)' }}>
      <div className="spinner"/>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', paddingTop:'6rem', paddingBottom:'4rem', paddingLeft:'1rem', paddingRight:'1rem', background:'var(--obsidian)' }}>
      <div style={{ maxWidth:'48rem', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:'white' }}>My Orders</h1>
          <button onClick={fetchOrders} style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.875rem', color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'6rem 0' }}>
            <ChefHat size={48} style={{ color:'var(--crimson)', opacity:0.2, margin:'0 auto 1rem', display:'block' }}/>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', color:'white' }}>No orders yet</h2>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {orders.map(order => {
              const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              return (
                <div key={order._id} className="my-order-card" style={{ border:`1px solid ${s.border}` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1rem' }}>
                    <div>
                      <p style={{ fontWeight:600, color:'white' }}>Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.2rem' }}>
                        {formatDateTime(order.createdAt)} · Table: {order.tableNumber}
                      </p>
                    </div>
                    <span className="badge" style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                      {s.label}
                    </span>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginBottom:'1rem' }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem' }}>
                        <span style={{ color:'var(--text-secondary)' }}>
                          {item.qty}x {item.name}{item.selectedSize ? ` (${item.selectedSize.label})` : ''}
                        </span>
                        <span style={{ color:'var(--text-muted)' }}>{formatNaira(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="divider"/>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.75rem', fontWeight:700 }}>
                    <span style={{ color:'white' }}>Total</span>
                    <span style={{ color:'var(--crimson)' }}>{formatNaira(order.total)}</span>
                  </div>

                  {order.status === 'preparing' && (
                    <p style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginTop:'0.75rem', fontSize:'0.8rem', color:'var(--crimson)' }}>
                      <ChefHat size={13}/> Chef is preparing your order…
                    </p>
                  )}
                  {order.status === 'ready' && (
                    <p style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginTop:'0.75rem', fontSize:'0.8rem', fontWeight:600, color:'#22c55e' }}>
                      <CheckCircle size={13}/> Your order is ready — please collect!
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
