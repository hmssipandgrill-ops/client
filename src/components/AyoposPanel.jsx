import { useEffect, useState } from 'react'
import { Link2, RefreshCw, Unplug, ShieldCheck, CheckCircle2, XCircle, Pencil } from 'lucide-react'
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

const box = { padding: '0.7rem 0.9rem', background: 'var(--obsidian)', border: '1px solid var(--border)', color: 'white', borderRadius: 6, width: '100%', boxSizing: 'border-box' }
const hint = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }

function Field({ label, help, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'white', marginBottom: '0.3rem' }}>{label}</span>
      {children}
      {help && <span style={{ display: 'block', ...hint }}>{help}</span>}
    </label>
  )
}

const emptyForm = { apiBase: '', publicApiUrl: '', siteUrl: '', autoPublish: false, business: { name: '', phone: '', email: '', address: '', logoUrl: '' } }

/** Top admin only (the tab is hidden for everyone else and the server enforces it): connect this menu to an AYOPOS business. */
export default function AyoposPanel() {
  const [s, setS] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(false)
  const [check, setCheck] = useState(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const st = await ayoposService.status()
      setS(st)
      const x = st.settings
      setForm({
        apiBase: x.apiBase || '', publicApiUrl: x.publicApiUrl || st.suggestedPublicApiUrl || '', siteUrl: x.siteUrl || window.location.origin,
        autoPublish: !!x.autoPublish, business: { name: x.business.name || '', phone: x.business.phone || '', email: x.business.email || '', address: x.business.address || '', logoUrl: x.business.logoUrl || '' },
      })
      setEditing(!st.configured && !st.connected)
    } catch (e) { toast.error(msg(e)) }
  }
  useEffect(() => { load() }, [])

  const run = async (fn, ok) => {
    setBusy(true)
    try { const r = await fn(); if (ok) toast.success(ok); return r } catch (e) { toast.error(msg(e)) } finally { setBusy(false) }
  }
  const setField = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setCheck(null) }
  const setBiz = (k, v) => { setForm((f) => ({ ...f, business: { ...f.business, [k]: v } })); setCheck(null) }

  const save = async () => { const r = await run(() => ayoposService.saveSettings(form), 'Settings saved'); if (r) { await load(); setEditing(false) } }
  const runCheck = async () => { const r = await run(() => ayoposService.checkSettings(form)); if (r) setCheck(r) }

  if (!s) return <div className="dash-stat">Loading…</div>
  const canEdit = s.canEditSettings
  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 720 }}>
      <div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: 'white', margin: 0 }}>AYOPOS connection</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>Keep your menu items and business details the same here and in your AYOPOS point-of-sale. Only the main admin can see and change this page.</p>
      </div>

      {/* ---- Step 1: settings ---- */}
      <div className="dash-stat" style={{ display: 'grid', gap: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <b style={{ color: 'white' }}>1 · Connection settings {s.configured && !editing && <CheckCircle2 size={14} style={{ color: '#22c55e', verticalAlign: '-2px' }} />}</b>
          {canEdit && s.configured && !editing && <button className="btn-outline" onClick={() => setEditing(true)}><Pencil size={13} style={{ verticalAlign: '-2px' }} /> Edit</button>}
        </div>

        {!editing && s.configured && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'grid', gap: '0.25rem' }}>
            <span>AYOPOS address: <code style={{ color: 'white' }}>{s.settings.apiBase}</code></span>
            <span>This website's API address: <code style={{ color: 'white' }}>{s.settings.publicApiUrl}</code></span>
            <span>Business shared as: <b style={{ color: 'white' }}>{s.settings.business.name}</b></span>
            {!canEdit && <span style={{ color: '#f59e0b' }}>To change these settings, disconnect from AYOPOS first.</span>}
          </div>
        )}

        {editing && canEdit && (
          <>
            <Field label="AYOPOS API address" help={<>In AYOPOS open <b>Website sync → Connect a website</b>. The box shows an “API address” — paste it here.</>}>
              <input style={box} value={form.apiBase} onChange={(e) => setField('apiBase', e.target.value)} placeholder="https://api.ayopos.com/api/v1" autoComplete="off" />
            </Field>
            <Field label="This website's API address" help="Where AYOPOS sends updates to this website. We filled in our best guess — correct it if it is wrong.">
              <input style={box} value={form.publicApiUrl} onChange={(e) => setField('publicApiUrl', e.target.value)} placeholder="https://api.your-website.com" autoComplete="off" />
            </Field>
            <Field label="Website address (optional)">
              <input style={box} value={form.siteUrl} onChange={(e) => setField('siteUrl', e.target.value)} placeholder="https://your-website.com" autoComplete="off" />
            </Field>

            <b style={{ color: 'white', fontSize: '0.85rem', marginTop: '0.3rem' }}>Business details shared with AYOPOS</b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.7rem' }}>
              <Field label="Business name"><input style={box} value={form.business.name} onChange={(e) => setBiz('name', e.target.value)} maxLength={120} /></Field>
              <Field label="Phone"><input style={box} value={form.business.phone} onChange={(e) => setBiz('phone', e.target.value)} maxLength={40} /></Field>
              <Field label="Email"><input style={box} value={form.business.email} onChange={(e) => setBiz('email', e.target.value)} maxLength={120} /></Field>
              <Field label="Logo address (optional)"><input style={box} value={form.business.logoUrl} onChange={(e) => setBiz('logoUrl', e.target.value)} placeholder="https://…/logo.png" /></Field>
            </div>
            <Field label="Address"><input style={box} value={form.business.address} onChange={(e) => setBiz('address', e.target.value)} maxLength={300} /></Field>

            <label style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={form.autoPublish} onChange={(e) => setField('autoPublish', e.target.checked)} style={{ marginTop: 3 }} />
              <span>Show products created in AYOPOS on the website straight away. <b style={{ color: 'white' }}>Leave off</b> to review them first — they arrive hidden.</span>
            </label>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button className="btn-crimson" disabled={busy || !form.apiBase.trim() || !form.publicApiUrl.trim()} onClick={save}><span>Save settings</span></button>
              <button className="btn-outline" disabled={busy || !form.apiBase.trim() || !form.publicApiUrl.trim()} onClick={runCheck}>Check settings</button>
              {s.configured && <button className="btn-outline" disabled={busy} onClick={() => { setEditing(false); load() }}>Cancel</button>}
            </div>

            {check && (
              <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.82rem' }}>
                {[['AYOPOS', check.ayopos], ['This website', check.website]].map(([label, r]) => (
                  <span key={label} style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start', color: r.ok ? '#22c55e' : '#ef4444' }}>
                    {r.ok ? <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />}<span><b>{label}:</b> {r.message}</span>
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ---- Step 2: pair ---- */}
      {s.configured && !s.connected && !editing && (
        <div className="dash-stat" style={{ display: 'grid', gap: '0.75rem' }}>
          <b style={{ color: 'white' }}>2 · Pair with AYOPOS</b>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>In AYOPOS click <b>Connect a website</b>, then <b>Create pairing code</b>. Copy the code and paste it here. It works once and expires in 15 minutes.</p>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABCD-EFGH-1234" maxLength={40} autoComplete="off" style={{ ...box, letterSpacing: '0.12em', fontFamily: 'monospace' }} />
          <button className="btn-crimson" disabled={busy || code.trim().length < 8} onClick={async () => { const r = await run(() => ayoposService.pair(code), 'Connected to AYOPOS'); if (r) { setCode(''); await load() } }} style={{ justifySelf: 'start' }}><span><Link2 size={14} style={{ verticalAlign: '-2px' }} /> Connect</span></button>
        </div>
      )}

      {/* ---- Connected ---- */}
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
            {s.direction !== 'AYOPOS_TO_SITE' && <button className="btn-outline" disabled={busy || s.status !== 'ACTIVE'} onClick={async () => { await run(ayoposService.sync, 'Sync finished'); load() }}><RefreshCw size={13} style={{ verticalAlign: '-2px' }} /> Sync now</button>}
            <button className="btn-outline" disabled={busy} onClick={async () => { if (window.confirm('Disconnect from AYOPOS? Nothing will sync any more. Your menu is not changed. You can then change the connection settings.')) { await run(ayoposService.disconnect, 'Disconnected'); load() } }}><Unplug size={13} style={{ verticalAlign: '-2px' }} /> Disconnect</button>
          </div>
        </div>
      )}

      <p style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}><ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        Only name, description, price, category, image and visibility are shared — never orders, customers, staff or sales. New items created in AYOPOS arrive hidden until you switch them on.</p>
    </div>
  )
}
