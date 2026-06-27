import { useState, useEffect } from 'react'
import { ChefHat, AlertCircle, Volume2, VolumeX } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'
import { useNotificationSound } from '../hooks/useNotificationSound'
import { orderService } from '../services/orderService'
import { STATUS_CONFIG, getNextStatus, isActiveOrder, isOverdue } from '../utils/orderStatus'
import { minutesSince } from '../utils/date'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'

export default function KitchenPage() {
  const [filter, setFilter] = useState('active')
  const { user } = useAuth()
  const navigate = useNavigate()
  const socket = useSocket()
  const { soundEnabled, setSoundEnabled, playNewOrder } = useNotificationSound()
  const { orders, setOrders, refetch } = useOrders({ status: filter === 'active' ? 'pending,received,preparing,ready' : 'served,cancelled' })

  useEffect(() => {
    if (!user || !['kitchen','admin','staff'].includes(user.role)) navigate('/')
  }, [user])

  useEffect(() => {
    if (!socket) return
    socket.emit('join-room', user?.role)
    socket.on('new-order', (order) => {
      playNewOrder()
      setOrders(prev => [order, ...prev.filter(o => o._id !== order._id)])
      toast('New Order! Table ' + order.tableNumber, { duration: 8000, style: { background: 'var(--charcoal)', color: 'white', border: '2px solid var(--crimson)' } })
    })
    return () => socket.off('new-order')
  }, [socket, user, playNewOrder])

  const updateStatus = async (orderId, status) => {
    try {
      const updated = await orderService.updateStatus(orderId, status)
      setOrders(prev => prev.map(o => o._id === orderId ? updated.order : o))
      toast.success('Marked as ' + status, { style: { background: 'var(--charcoal)', color: 'white' } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const active = orders.filter(o => isActiveOrder(o.status))
  const done   = orders.filter(o => !isActiveOrder(o.status))
  const list   = filter === 'active' ? active : done

  return (
    <div style={{ minHeight: '100vh', background: 'var(--obsidian)', paddingTop: '5rem', paddingBottom: '4rem' }}>
      <div className="kitchen-header">
        <div className="kitchen-header__inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ChefHat size={22} style={{ color: 'var(--crimson)' }} />
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>Kitchen Display</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{active.length} active orders</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setSoundEnabled(!soundEnabled)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--charcoal)', color: soundEnabled ? 'var(--gold)' : 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} {soundEnabled ? 'Sound On' : 'Muted'}
            </button>
            <button onClick={refetch} className="btn-crimson" style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem' }}>Refresh</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '1.5rem' }}>
        <div className="tab-bar" style={{ marginBottom: '1.5rem' }}>
          {['active','history'].map(f => (
            <button key={f} className={`tab-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'active' ? `Active (${active.length})` : 'History'}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <ChefHat size={48} style={{ color: 'var(--crimson)', opacity: 0.2, margin: '0 auto 1rem' }} />
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', color: 'white' }}>
              {filter === 'active' ? 'All clear! No active orders.' : 'No history yet.'}
            </h2>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {list.map(order => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const next = getNextStatus(order.status)
              const overdue = isOverdue(order)
              const age = minutesSince(order.createdAt)
              return (
                <div key={order._id} className={`order-card${order.status === 'pending' ? ' order-new' : ''}`}
                  style={{ borderColor: overdue ? '#ef4444' : sc.border }}>
                  <div className="order-card__header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="order-card__id">#{order._id.slice(-6).toUpperCase()}</span>
                        {overdue && <AlertCircle size={14} style={{ color: '#ef4444' }} />}
                      </div>
                      <div className="order-card__meta">Table {order.tableNumber} · {age}m ago</div>
                    </div>
                    <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{sc.label}</span>
                  </div>
                  <div className="order-card__items">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-card__item">
                        <span className="order-card__item-name">{item.qty}× {item.name}</span>
                        {item.selectedSize && <span className="order-card__size-tag">{item.selectedSize.label}</span>}
                      </div>
                    ))}
                  </div>
                  {order.notes && <div className="order-card__note">{order.notes}</div>}
                  <div className="order-card__actions">
                    {next && <button className="order-card__btn-next" onClick={() => updateStatus(order._id, next)}>Mark as {next.charAt(0).toUpperCase() + next.slice(1)}</button>}
                    {order.status === 'pending' && <button className="order-card__btn-cancel" onClick={() => updateStatus(order._id, 'cancelled')}>Cancel</button>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
