import { useEffect, useState } from 'react'
import { Link2, RefreshCw, Unplug, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { ayoposService } from '../services/ayoposService'
import { formatDateTime } from '../utils/date'

const DIRECTION = {
  TWO_WAY: 'Two-way: edits on either side update the other',
  SITE_TO_AYOPOS: 'This website → AYOPOS only',
  AYOPOS_TO_SITE: 'AYOPOS → this website only',
}
const POLICY = { LATEST_WINS: 'Most recent edit wins', AYOPOS_WINS: 'AYOPOS wins', SITE_WINS: 'This website wins' }
const msg = (e) => e?.response?.data?.message || 'Something went wrong'

/** Admin-only: link this menu to an AYOPOS business so products and business details stay in sync. */
export default function AyoposPanel() {
  const [s, setS] = useState(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => ayoposService.status().then(setS).catch((e) => toast.error(msg(e)))
  useEffect(() => { load() }, [])

  const run = async (fn, ok) => {
    setBusy(true)
    try { const r = await fn(); if (ok) toast.success(ok); await load(); return r } catch (e) { toast.error(msg(e)) } finally { setBusy(false) }
  }

  if (!s) return <div className="dash-stat">Loading…</div>
  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 720 }}>
      <div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: 'white', margin: 0 }}>AYOPOS connection</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>Keep your menu items and business details the same here and in your AYOPOS point-of-sale.</p>
      </div>

      {!s.configured && <div className="dash-stat" style={{ color: '#f59e0b' }}>The server is not set up for AYOPOS yet. Ask your developer to set <code>AYOPOS_API_BASE</code> and <code>PUBLIC_API_URL</code>.</div>}

      {s.configured && !s.connected && (
        <div className="dash-stat" style={{ display: 'grid', gap: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>In AYOPOS open <b>Website sync → Connect a website</b>, copy the pairing code and paste it here.</p>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABCD-EFGH-1234" maxLength={40} autoComplete="off"
            style={{ padding: '0.7rem 0.9rem', background: 'var(--obsidian)', border: '1px solid var(--border)', color: 'white', borderRadius: 6, letterSpacing: '0.12em', fontFamily: 'monospace' }} />
          <button className="btn-crimson" disabled={busy || code.trim().length < 8} onClick={() => run(() => ayoposService.pair(code), 'Connected to AYOPOS')} style={{ justifySelf: 'start' }}><span><Link2 size={14} style={{ verticalAlign: '-2px' }} /> Connect</span></button>
        </div>
      )}

      {s.connected && (
        <div className="dash-stat" style={{ display: 'grid', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <b style={{ color: 'white' }}>{s.ayoposBusinessName || 'AYOPOS business'}</b>
            <span style={{ color: s.status === 'ACTIVE' ? '#22c55e' : '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>{s.status}</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {DIRECTION[s.direction]}{s.direction === 'TWO_WAY' ? ` · if both change: ${POLICY[s.conflictPolicy]}` : ''}<br />
            {s.linkedProducts} product{s.linkedProducts === 1 ? '' : 's'} linked · {s.lastSyncAt ? `last sync ${formatDateTime(s.lastSyncAt)}` : 'not synced yet'}
          </div>
          {s.lastError && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{s.lastError}</div>}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {s.direction !== 'AYOPOS_TO_SITE' && <button className="btn-outline" disabled={busy || s.status !== 'ACTIVE'} onClick={() => run(ayoposService.sync, 'Sync finished')}><RefreshCw size={13} style={{ verticalAlign: '-2px' }} /> Sync now</button>}
            <button className="btn-outline" disabled={busy} onClick={() => { if (window.confirm('Disconnect from AYOPOS? Nothing will sync any more. Your menu is not changed.')) run(ayoposService.disconnect, 'Disconnected') }}><Unplug size={13} style={{ verticalAlign: '-2px' }} /> Disconnect</button>
          </div>
        </div>
      )}

      <p style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}><ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        Only name, description, price, category, image and visibility are shared — never orders, customers, staff or sales. New items created in AYOPOS arrive hidden until you switch them on.</p>
    </div>
  )
}
