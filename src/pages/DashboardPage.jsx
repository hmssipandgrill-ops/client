import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Users, Tag,
  BarChart3, Plus, Edit3, Trash2, Star, Eye, EyeOff, Upload,
  X, ChevronLeft, ChevronRight, Menu, TrendingUp, CheckCircle,
  Clock, XCircle, Activity, Search,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { menuService }     from '../services/menuService'
import { orderService }    from '../services/orderService'
import { userService }     from '../services/userService'
import { analyticsService } from '../services/analyticsService'
import { categoryService } from '../services/categoryService'
import { formatNaira }     from '../utils/currency'
import { formatDateTime, timeAgo } from '../utils/date'
import { STATUS_CONFIG }   from '../utils/orderStatus'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="dash-stat" style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)' }}>{label}</span>
        <div className="dash-stat__icon" style={{ background:`${color}18` }}>
          <Icon size={15} style={{ color }}/>
        </div>
      </div>
      <div className="dash-stat__value">{value}</div>
      {sub && <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

// ─── IMAGE UPLOADER ──────────────────────────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const inputRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')

  const handleFile = async (file) => {
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)
    try {
      const result = await menuService.uploadImage(file)
      onChange(result.url)
      toast.success('Image uploaded!')
    } catch (e) {
      toast.error('Upload failed: ' + (e.response?.data?.message || e.message))
      setPreview(value || '')
    } finally { setUploading(false) }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFile(file)
  }

  return (
    <div>
      <label style={{ fontSize:'0.7rem', color:'var(--text-muted)', display:'block', marginBottom:'0.4rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>Image</label>
      <div className={`img-upload-box${preview ? ' has-image' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        style={{ position:'relative' }}>
        {preview
          ? <img src={preview} alt="preview"/>
          : <div style={{ padding:'1.5rem' }}>
              <Upload size={24} style={{ color:'var(--text-muted)', margin:'0 auto 0.5rem', display:'block' }}/>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Click or drag & drop to upload</p>
              <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'0.25rem' }}>JPG, PNG, WebP · max 8MB</p>
            </div>
        }
        {uploading && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div className="spinner"/>
          </div>
        )}
        {preview && !uploading && (
          <button onClick={e => { e.stopPropagation(); setPreview(''); onChange('') }}
            style={{ position:'absolute', top:'0.5rem', right:'0.5rem', background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'50%', width:'24px', height:'24px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={12}/>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])}/>
      {/* URL fallback */}
      <input value={!preview?.startsWith('blob:') ? (value || '') : ''} onChange={e => { onChange(e.target.value); setPreview(e.target.value) }}
        placeholder="…or paste an image URL"
        className="input-dark" style={{ marginTop:'0.5rem', fontSize:'0.8rem', padding:'0.5rem 0.75rem' }}/>
    </div>
  )
}

// ─── MENU EDIT MODAL ─────────────────────────────────────────────────────────
function MenuModal({ item, categories, onClose, onSaved }) {
  const isEdit = Boolean(item)
  const [form, setForm] = useState({
    name: item?.name || '', category: item?.category || categories[0]?.name || '',
    description: item?.description || '', basePrice: item?.basePrice || '',
    sizes: item?.sizes || [], image: item?.image || '',
    isPopular: item?.isPopular || false, isFeatured: item?.isFeatured || false,
    isVegetarian: item?.isVegetarian || false, isActive: item?.isActive ?? true,
    prepTime: item?.prepTime || 15, allergens: (item?.allergens || []).join(', '),
  })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target ? e.target.value : e }))
  const setCheck = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.checked }))

  const addSize = () => setForm(f => ({ ...f, sizes: [...f.sizes, { label:'', price:'' }] }))
  const updateSize = (i, field, val) => setForm(f => ({ ...f, sizes: f.sizes.map((s,j) => j===i ? {...s,[field]:val} : s) }))
  const removeSize = (i) => setForm(f => ({ ...f, sizes: f.sizes.filter((_,j) => j!==i) }))

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.category)     { toast.error('Category is required'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice) || 0,
        prepTime: Number(form.prepTime) || 15,
        allergens: form.allergens.split(',').map(s => s.trim()).filter(Boolean),
        sizes: form.sizes.map(s => ({ label: s.label, price: Number(s.price) || 0 })).filter(s => s.label),
      }
      const result = isEdit ? await menuService.update(item._id, payload) : await menuService.create(payload)
      toast.success(isEdit ? 'Item updated!' : 'Item created!', { style:{background:'var(--charcoal)',color:'white'} })
      onSaved(result.item)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const label = (text, required) => (
    <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:'0.35rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>
      {text}{required && ' *'}
    </label>
  )
  const inp = (k, type='text', placeholder='') => (
    <input type={type} value={form[k]} onChange={set(k)} placeholder={placeholder} className="input-dark"/>
  )

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:700, color:'white' }}>
            {isEdit ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:'0.25rem' }}><X size={20}/></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            <div>{label('Name', true)}{inp('name','text','e.g. Jollof Rice')}</div>
            <div>
              {label('Category', true)}
              <select value={form.category} onChange={set('category')}
                style={{ background:'var(--muted)', border:'1px solid var(--border)', color:'var(--text-primary)', borderRadius:'var(--radius)', padding:'0.75rem 1rem', width:'100%', fontSize:'0.875rem' }}>
                {categories.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>{label('Description')}<textarea value={form.description} onChange={set('description')} rows={3} className="input-dark" style={{ resize:'none' }} placeholder="Describe the dish…"/></div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            <div>{label('Base Price (₦)')}{inp('basePrice','number','0 if using sizes')}</div>
            <div>{label('Prep Time (mins)')}{inp('prepTime','number','15')}</div>
          </div>

          <ImageUploader value={form.image} onChange={url => setForm(f => ({...f, image: url}))}/>

          {/* Sizes */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              {label('Sizes / Portions')}
              <button onClick={addSize} style={{ fontSize:'0.75rem', color:'var(--crimson)', background:'none', border:'1px solid rgba(196,30,58,0.3)', padding:'0.25rem 0.75rem', borderRadius:'8px', cursor:'pointer' }}>
                + Add Size
              </button>
            </div>
            {form.sizes.map((s,i) => (
              <div key={i} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem' }}>
                <input value={s.label} onChange={e => updateSize(i,'label',e.target.value)} placeholder="e.g. Small / 330ml"
                  className="input-dark" style={{ flex:1 }}/>
                <input type="number" value={s.price} onChange={e => updateSize(i,'price',e.target.value)} placeholder="Price"
                  className="input-dark" style={{ width:'7rem' }}/>
                <button onClick={() => removeSize(i)} style={{ background:'var(--muted)', border:'none', borderRadius:'8px', padding:'0 0.6rem', color:'var(--text-muted)', cursor:'pointer' }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            ))}
          </div>

          <div>{label('Allergens (comma separated)')}<input value={form.allergens} onChange={set('allergens')} placeholder="nuts, dairy, gluten…" className="input-dark"/></div>

          {/* Toggles */}
          <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
            {[['isPopular','Popular'],['isFeatured','Featured on Home'],['isVegetarian','Vegetarian'],['isActive','Active']].map(([k,lbl]) => (
              <label key={k} style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.875rem', color:'var(--text-secondary)' }}>
                <input type="checkbox" checked={form[k]} onChange={setCheck(k)} style={{ accentColor:'var(--crimson)' }}/> {lbl}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'0.6rem 1.25rem', borderRadius:'10px', background:'var(--muted)', color:'var(--text-muted)', border:'1px solid var(--border)', cursor:'pointer', fontSize:'0.875rem' }}>Cancel</button>
          <button onClick={save} disabled={saving} className="btn-crimson" style={{ padding:'0.6rem 1.5rem', borderRadius:'10px', fontSize:'0.875rem', gap:'0.4rem', opacity:saving?0.6:1 }}>
            {saving ? <span className="spinner" style={{width:'1rem',height:'1rem',borderColor:'rgba(255,255,255,0.3)',borderTopColor:'white'}}/> : (isEdit ? 'Save Changes' : 'Create Item')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CATEGORIES PANEL ────────────────────────────────────────────────────────
function CategoriesPanel() {
  const [cats, setCats] = useState([])
  const [editing, setEditing] = useState(null)   // { _id?, name, description, icon, sortOrder }
  const [saving, setSaving]   = useState(false)
  const blankForm = { name:'', description:'', icon:'', sortOrder:0 }

  useEffect(() => {
    categoryService.getAll(true).then(d => setCats(d.categories || []))
  }, [])

  const save = async () => {
    if (!editing.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    try {
      if (editing._id) {
        const r = await categoryService.update(editing._id, editing)
        setCats(prev => prev.map(c => c._id === editing._id ? r.category : c))
      } else {
        const r = await categoryService.create(editing)
        setCats(prev => [...prev, r.category])
      }
      toast.success('Saved!', { style:{background:'var(--charcoal)',color:'white'} })
      setEditing(null)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const del = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return
    try {
      await categoryService.remove(cat._id)
      setCats(prev => prev.filter(c => c._id !== cat._id))
      toast.success('Deleted!', { style:{background:'var(--charcoal)',color:'white'} })
    } catch (e) { toast.error(e.response?.data?.message || 'Cannot delete') }
  }

  const toggle = async (cat) => {
    try {
      const r = await categoryService.update(cat._id, { isActive: !cat.isActive })
      setCats(prev => prev.map(c => c._id === cat._id ? r.category : c))
    } catch (e) { toast.error('Failed') }
  }

  return (
    <div>
      <div className="dash-main__header">
        <h2 className="dash-main__title">Categories</h2>
        <button onClick={() => setEditing({ ...blankForm })} className="btn-crimson" style={{ padding:'0.5rem 1rem', borderRadius:'10px', fontSize:'0.8rem', gap:'0.3rem' }}>
          <Plus size={14}/> Add Category
        </button>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal-box" style={{ maxWidth:'28rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3 style={{ color:'white', fontFamily:"'Playfair Display',serif", fontSize:'1.2rem' }}>{editing._id ? 'Edit' : 'New'} Category</h3>
              <button onClick={() => setEditing(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={18}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <div><label style={{ fontSize:'0.7rem', color:'var(--text-muted)', display:'block', marginBottom:'0.35rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>Name *</label>
                <input value={editing.name} onChange={e => setEditing(p => ({...p, name:e.target.value}))} className="input-dark" placeholder="e.g. Starters"/></div>
              <div><label style={{ fontSize:'0.7rem', color:'var(--text-muted)', display:'block', marginBottom:'0.35rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>Icon</label>
                <input value={editing.icon} onChange={e => setEditing(p => ({...p, icon:e.target.value}))} className="input-dark" placeholder="" style={{ width:'5rem' }}/></div>
              <div><label style={{ fontSize:'0.7rem', color:'var(--text-muted)', display:'block', marginBottom:'0.35rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>Description</label>
                <textarea value={editing.description} onChange={e => setEditing(p => ({...p, description:e.target.value}))} rows={2} className="input-dark" style={{ resize:'none' }}/></div>
              <div><label style={{ fontSize:'0.7rem', color:'var(--text-muted)', display:'block', marginBottom:'0.35rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>Sort Order</label>
                <input type="number" value={editing.sortOrder} onChange={e => setEditing(p => ({...p, sortOrder:Number(e.target.value)}))} className="input-dark" style={{ width:'7rem' }}/></div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'1.25rem' }}>
              <button onClick={() => setEditing(null)} style={{ padding:'0.55rem 1rem', borderRadius:'10px', background:'var(--muted)', color:'var(--text-muted)', border:'1px solid var(--border)', cursor:'pointer', fontSize:'0.85rem' }}>Cancel</button>
              <button onClick={save} disabled={saving} className="btn-crimson" style={{ padding:'0.55rem 1.25rem', borderRadius:'10px', fontSize:'0.85rem', opacity:saving?0.6:1 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead><tr><th>Category</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {cats.map(cat => (
              <tr key={cat._id}>
                <td><span style={{ fontSize:'1.2rem', marginRight:'0.4rem' }}>{cat.icon}</span><strong style={{ color:'white' }}>{cat.name}</strong></td>
                <td style={{ maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cat.description || '—'}</td>
                <td>
                  <span className="badge" style={{ background: cat.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: cat.isActive ? '#22c55e' : '#ef4444' }}>
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    <button onClick={() => toggle(cat)} title={cat.isActive ? 'Hide' : 'Show'} style={{ padding:'0.3rem 0.5rem', borderRadius:'7px', background:'var(--muted)', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                      {cat.isActive ? <EyeOff size={13}/> : <Eye size={13}/>}
                    </button>
                    <button onClick={() => setEditing({...cat})} style={{ padding:'0.3rem 0.5rem', borderRadius:'7px', background:'var(--muted)', border:'none', color:'var(--gold)', cursor:'pointer' }}>
                      <Edit3 size={13}/>
                    </button>
                    <button onClick={() => del(cat)} style={{ padding:'0.3rem 0.5rem', borderRadius:'7px', background:'var(--muted)', border:'none', color:'#ef4444', cursor:'pointer' }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── MENU PANEL ──────────────────────────────────────────────────────────────
function MenuPanel({ categories }) {
  const [items, setItems]   = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [cat, setCat]       = useState('All')
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(null)   // null | 'new' | item object

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await menuService.getAll({ category: cat, search, page, limit: PAGE_SIZE })
      setItems(d.items || [])
      setTotal(d.total || 0)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [cat, search, page])

  useEffect(() => { load() }, [load])

  const del = async (id) => {
    if (!window.confirm('Delete this item?')) return
    await menuService.remove(id)
    toast.success('Deleted', { style:{background:'var(--charcoal)',color:'white'} })
    load()
  }

  const toggleFeat = async (item) => {
    await menuService.toggleFeatured(item._id)
    load()
  }

  const onSaved = (savedItem) => {
    setModal(null)
    load()
  }

  const pages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="dash-main__header">
        <h2 className="dash-main__title">Menu Items <span style={{ fontSize:'0.85rem', color:'var(--text-muted)', fontFamily:'Inter,sans-serif', fontWeight:400 }}>({total})</span></h2>
        <button onClick={() => setModal('new')} className="btn-crimson" style={{ padding:'0.5rem 1rem', borderRadius:'10px', fontSize:'0.8rem', gap:'0.3rem' }}>
          <Plus size={14}/> Add Item
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1', minWidth:'160px' }}>
          <Search size={14} style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search items…" className="input-dark" style={{ paddingLeft:'2.25rem', fontSize:'0.85rem', padding:'0.6rem 0.75rem 0.6rem 2.25rem' }}/>
        </div>
        <select value={cat} onChange={e => { setCat(e.target.value); setPage(1) }}
          style={{ background:'var(--muted)', border:'1px solid var(--border)', color:'var(--text-primary)', borderRadius:'var(--radius)', padding:'0.6rem 0.75rem', fontSize:'0.85rem' }}>
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading
              ? Array(5).fill(null).map((_,i) => (
                  <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height:'2.5rem', borderRadius:'8px' }}/></td></tr>
                ))
              : items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ width:'2.75rem', height:'2.75rem', borderRadius:'8px', overflow:'hidden', background:'var(--muted)', flexShrink:0 }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}></div>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', flexWrap:'wrap' }}>
                        <span style={{ color:'white', fontWeight:500, fontSize:'0.85rem' }}>{item.name}</span>
                        {item.isFeatured && <span className="badge" style={{ background:'rgba(201,168,76,0.15)', color:'var(--gold)', fontSize:'0.6rem' }}>Featured</span>}
                        {item.isPopular && <span className="badge" style={{ background:'rgba(196,30,58,0.15)', color:'var(--crimson)', fontSize:'0.6rem' }}>Popular</span>}
                      </div>
                    </td>
                    <td style={{ fontSize:'0.8rem' }}>{item.category}</td>
                    <td style={{ fontWeight:600, color:'var(--crimson)', fontSize:'0.85rem' }}>
                      {item.sizes?.length ? item.sizes.map(s => formatNaira(s.price)).join(' / ') : formatNaira(item.basePrice)}
                    </td>
                    <td>
                      <span className="badge" style={{ background: item.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: item.isActive ? '#22c55e' : '#ef4444', fontSize:'0.7rem' }}>
                        {item.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.3rem' }}>
                        <button onClick={() => toggleFeat(item)} title={item.isFeatured ? 'Remove from featured' : 'Feature on homepage'}
                          style={{ padding:'0.3rem', borderRadius:'7px', background:'var(--muted)', border:'none', color: item.isFeatured ? 'var(--gold)' : 'var(--text-muted)', cursor:'pointer' }}>
                          <Star size={13} style={{ fill: item.isFeatured ? 'var(--gold)' : 'none' }}/>
                        </button>
                        <button onClick={() => setModal(item)} style={{ padding:'0.3rem', borderRadius:'7px', background:'var(--muted)', border:'none', color:'var(--gold)', cursor:'pointer' }}>
                          <Edit3 size={13}/>
                        </button>
                        <button onClick={() => del(item._id)} style={{ padding:'0.3rem', borderRadius:'7px', background:'var(--muted)', border:'none', color:'#ef4444', cursor:'pointer' }}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination__info">Showing {Math.min((page-1)*PAGE_SIZE+1, total)}–{Math.min(page*PAGE_SIZE, total)} of {total}</span>
          <div className="pagination__btns">
            <button className="pagination__btn" disabled={page===1} onClick={() => setPage(p => p-1)}><ChevronLeft size={14}/></button>
            {Array.from({length:Math.min(pages,7)},(_,i) => {
              const p = pages <= 7 ? i+1 : page <= 4 ? i+1 : page >= pages-3 ? pages-6+i : page-3+i
              return <button key={p} className={`pagination__btn${p===page?' active':''}`} onClick={() => setPage(p)}>{p}</button>
            })}
            <button className="pagination__btn" disabled={page===pages||pages===0} onClick={() => setPage(p => p+1)}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>

      {modal && (
        <MenuModal
          item={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}

// ─── ORDERS PANEL ────────────────────────────────────────────────────────────
function OrdersPanel({ isAdmin }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [page, setPage]     = useState(1)
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    orderService.getAll({ page, limit: PAGE_SIZE })
      .then(d => { setOrders(d.orders || []); setTotal(d.total || 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  const updateStatus = async (id, status) => {
    await orderService.updateStatus(id, status)
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o))
    toast.success('Updated!', { style:{background:'var(--charcoal)',color:'white'} })
  }

  const pages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="dash-main__header">
        <h2 className="dash-main__title">Orders</h2>
        <Link to="/kitchen" style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1rem', borderRadius:'10px', background:'var(--muted)', border:'1px solid var(--border)', color:'var(--text-secondary)', fontSize:'0.8rem', textDecoration:'none' }}>
          Kitchen View →
        </Link>
      </div>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead><tr><th>Order</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th><th>Update</th></tr></thead>
          <tbody>
            {loading ? Array(5).fill(null).map((_,i) => (
              <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height:'2.5rem', borderRadius:'8px' }}/></td></tr>
            )) : orders.map(order => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              return (
                <tr key={order._id}>
                  <td style={{ fontWeight:600, color:'white', fontSize:'0.8rem' }}>#{order._id.slice(-6).toUpperCase()}</td>
                  <td style={{ fontSize:'0.8rem' }}>Table {order.tableNumber}</td>
                  <td style={{ fontSize:'0.75rem', color:'var(--text-muted)', maxWidth:'150px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {order.items?.map(i => `${i.qty}× ${i.name}`).join(', ')}
                  </td>
                  <td style={{ fontWeight:600, color:'var(--crimson)', fontSize:'0.85rem' }}>{formatNaira(order.total)}</td>
                  <td><span className="badge" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, fontSize:'0.7rem' }}>{sc.label}</span></td>
                  <td style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{timeAgo(order.createdAt)}</td>
                  <td>
                    <select value={order.status} onChange={e => updateStatus(order._id, e.target.value)}
                      style={{ background:'var(--muted)', border:'1px solid var(--border)', color:'var(--text-primary)', borderRadius:'8px', padding:'0.3rem 0.5rem', fontSize:'0.75rem', cursor:'pointer' }}>
                      {['pending','received','preparing','ready','served','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="pagination">
          <span className="pagination__info">Page {page} of {pages || 1}</span>
          <div className="pagination__btns">
            <button className="pagination__btn" disabled={page===1} onClick={() => setPage(p=>p-1)}><ChevronLeft size={14}/></button>
            <button className="pagination__btn" disabled={page>=pages} onClick={() => setPage(p=>p+1)}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── USERS PANEL ─────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: me } = useAuth()

  useEffect(() => {
    userService.getAll().then(d => setUsers(d.users || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const changeRole = async (id, role) => {
    await userService.update(id, { role })
    setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u))
    toast.success('Role updated!', { style:{background:'var(--charcoal)',color:'white'} })
  }

  const del = async (id) => {
    if (!window.confirm('Delete this user?')) return
    await userService.remove(id)
    setUsers(prev => prev.filter(u => u._id !== id))
    toast.success('User deleted', { style:{background:'var(--charcoal)',color:'white'} })
  }

  return (
    <div>
      <div className="dash-main__header"><h2 className="dash-main__title">Users</h2></div>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array(4).fill(null).map((_,i) => (
              <tr key={i}><td colSpan={5}><div className="skeleton" style={{ height:'2.5rem', borderRadius:'8px' }}/></td></tr>
            )) : users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                    <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'var(--crimson)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, color:'white', flexShrink:0 }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <span style={{ color:'white', fontSize:'0.875rem', fontWeight:500 }}>{u.name}</span>
                    {u._id === me?._id && <span className="badge" style={{ background:'rgba(201,168,76,0.15)', color:'var(--gold)', fontSize:'0.6rem' }}>You</span>}
                  </div>
                </td>
                <td style={{ fontSize:'0.8rem' }}>{u.email}</td>
                <td>
                  <select value={u.role} onChange={e => changeRole(u._id, e.target.value)} disabled={u._id === me?._id}
                    style={{ background:'var(--muted)', border:'1px solid var(--border)', color:'var(--text-primary)', borderRadius:'8px', padding:'0.3rem 0.5rem', fontSize:'0.75rem', cursor:'pointer', opacity: u._id === me?._id ? 0.5 : 1 }}>
                    {['customer','staff','kitchen','admin'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{formatDateTime(u.createdAt)}</td>
                <td>
                  {u._id !== me?._id && (
                    <button onClick={() => del(u._id)} style={{ padding:'0.3rem 0.5rem', borderRadius:'7px', background:'var(--muted)', border:'none', color:'#ef4444', cursor:'pointer' }}>
                      <Trash2 size={13}/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── OVERVIEW PANEL ──────────────────────────────────────────────────────────
function OverviewPanel({ isAdmin, myOrders }) {
  const [stats, setStats]   = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    if (isAdmin) {
      analyticsService.getStats().then(setStats).catch(console.error)
      analyticsService.getRecentOrders(8).then(d => setRecent(d.orders || [])).catch(console.error)
    } else {
      // Staff sees their own order processing stats
      orderService.getAll({ limit:50 }).then(d => {
        const orders = d.orders || []
        setRecent(orders.slice(0,8))
        setStats({ totalOrders: orders.length, pendingOrders: orders.filter(o=>o.status==='pending').length, todayOrders: orders.filter(o=>new Date(o.createdAt).toDateString()===new Date().toDateString()).length })
      }).catch(console.error)
    }
  }, [isAdmin])

  return (
    <div>
      <div className="dash-main__header"><h2 className="dash-main__title">Overview</h2></div>

      {stats && (
        <div className="dash-stats-row">
          {isAdmin ? <>
            <StatCard icon={ShoppingBag} label="Total Orders"    value={stats.totalOrders || 0}               color="var(--crimson)" sub={`${stats.todayOrders||0} today`}/>
            <StatCard icon={TrendingUp}  label="Total Revenue"   value={formatNaira(stats.totalRevenue||0)}   color="var(--gold)"    sub={formatNaira(stats.todayRevenue||0) + ' today'}/>
            <StatCard icon={Users}       label="Customers"       value={stats.totalCustomers || 0}             color="#60a5fa"/>
            <StatCard icon={UtensilsCrossed} label="Menu Items"  value={stats.totalMenuItems || 0}            color="#22c55e"/>
            <StatCard icon={Clock}       label="Pending Orders"  value={stats.pendingOrders || 0}             color="#f59e0b"/>
            <StatCard icon={BarChart3}   label="This Month"      value={formatNaira(stats.monthRevenue||0)}   color="var(--crimson)" sub={`${stats.monthOrders||0} orders`}/>
          </> : <>
            <StatCard icon={ShoppingBag} label="Total Orders"    value={stats.totalOrders || 0}               color="var(--crimson)"/>
            <StatCard icon={Clock}       label="Pending"         value={stats.pendingOrders || 0}             color="#f59e0b"/>
            <StatCard icon={Activity}    label="Today's Orders"  value={stats.todayOrders || 0}              color="#22c55e"/>
          </>}
        </div>
      )}

      {/* Recent orders */}
      <div className="dash-table-wrap">
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ color:'white', fontSize:'0.95rem', fontWeight:600 }}>Recent Orders</h3>
        </div>
        <table className="dash-table">
          <thead><tr><th>Order</th><th>Table</th><th>Total</th><th>Status</th><th>When</th></tr></thead>
          <tbody>
            {recent.length === 0
              ? <tr><td colSpan={5} style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No orders yet</td></tr>
              : recent.map(order => {
                  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                  return (
                    <tr key={order._id}>
                      <td style={{ fontWeight:600, color:'white', fontSize:'0.8rem' }}>#{order._id.slice(-6).toUpperCase()}</td>
                      <td style={{ fontSize:'0.8rem' }}>Table {order.tableNumber}</td>
                      <td style={{ fontWeight:600, color:'var(--crimson)', fontSize:'0.85rem' }}>{formatNaira(order.total)}</td>
                      <td><span className="badge" style={{ background:sc.bg, color:sc.color, fontSize:'0.7rem' }}>{sc.label}</span></td>
                      <td style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{timeAgo(order.createdAt)}</td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin  = user?.role === 'admin'
  const [tab, setTab]             = useState('overview')
  const [sidebarOpen, setSidebar] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!user || !['admin','staff'].includes(user.role)) { navigate('/'); return }
    categoryService.getAll(true).then(d => setCategories(d.categories || [])).catch(console.error)
  }, [user])

  const navItems = [
    { id:'overview',   icon:LayoutDashboard, label:'Overview' },
    { id:'menu',       icon:UtensilsCrossed,  label:'Menu Items' },
    { id:'orders',     icon:ShoppingBag,      label:'Orders' },
    { id:'categories', icon:Tag,              label:'Categories' },
    ...(isAdmin ? [{ id:'users', icon:Users, label:'Users' }] : []),
  ]

  return (
    <div style={{ paddingTop:'5rem', background:'var(--obsidian)', minHeight:'100vh' }}>
      <div className="dash-layout">
        {/* Sidebar */}
        <aside className={`dash-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="dash-sidebar__logo">
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', color:'white', fontWeight:700 }}>HMS Dashboard</div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.25rem', textTransform:'capitalize' }}>{user?.role} · {user?.name}</div>
          </div>
          <nav>
            {navItems.map(n => (
              <button key={n.id} className={`dash-nav-item${tab===n.id?' active':''}`}
                onClick={() => { setTab(n.id); setSidebar(false) }}>
                <n.icon size={16} className="nav-icon"/> {n.label}
              </button>
            ))}
            <div style={{ height:'1px', background:'var(--border)', margin:'0.75rem 1.5rem' }}/>
            <Link to="/kitchen" className="dash-nav-item">
              <UtensilsCrossed size={16} className="nav-icon"/> Kitchen View
            </Link>
            <Link to="/" className="dash-nav-item">
              <Eye size={16} className="nav-icon"/> View Site
            </Link>
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && <div onClick={() => setSidebar(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:130 }}/>}

        {/* Main content */}
        <main className="dash-main">
          {tab === 'overview'   && <OverviewPanel isAdmin={isAdmin}/>}
          {tab === 'menu'       && <MenuPanel categories={categories}/>}
          {tab === 'orders'     && <OrdersPanel isAdmin={isAdmin}/>}
          {tab === 'categories' && <CategoriesPanel/>}
          {tab === 'users' && isAdmin && <UsersPanel/>}
        </main>
      </div>

      {/* Mobile sidebar toggle */}
      <button className="dash-mobile-toggle" onClick={() => setSidebar(!sidebarOpen)}>
        <Menu size={20}/>
      </button>
    </div>
  )
}
