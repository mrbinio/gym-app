import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [mode, setMode] = useState('login')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      if (mode === 'login') await signInWithEmailAndPassword(auth, email, pass)
      else await createUserWithEmailAndPassword(auth, email, pass)
    } catch (e) {
      const msgs = { 'auth/invalid-credential':'Bledny email lub haslo', 'auth/email-already-in-use':'Ten email jest juz zajety', 'auth/weak-password':'Haslo musi miec min. 6 znakow', 'auth/invalid-email':'Nieprawidlowy email' }
      setErr(msgs[e.code] || e.message)
    }
    setLoading(false)
  }

  const googleLogin = async () => {
    setErr(''); setLoading(true)
    try { await signInWithPopup(auth, googleProvider) } catch { setErr('Blad logowania Google') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:52, letterSpacing:4, color:'var(--accent)', lineHeight:1 }}>GYM</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, letterSpacing:8, color:'var(--text2)' }}>BINIARZ</div>
          <div style={{ marginTop:8, color:'var(--text3)', fontSize:13 }}>Twoj osobisty dziennik treningowy</div>
        </div>
        <div className="card" style={{ padding:28 }}>
          <h2 style={{ fontSize:18, fontWeight:600, marginBottom:24 }}>{mode === 'login' ? 'Zaloguj sie' : 'Utworz konto'}</h2>
          <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ fontSize:12, color:'var(--text2)', marginBottom:6, display:'block' }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="twoj@email.com" required />
            </div>
            <div>
              <label style={{ fontSize:12, color:'var(--text2)', marginBottom:6, display:'block' }}>Haslo</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required />
            </div>
            {err && <div style={{ color:'var(--danger)', fontSize:13, background:'rgba(239,68,68,0.1)', padding:'8px 12px', borderRadius:'var(--radius-sm)' }}>{err}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Ladowanie...' : mode === 'login' ? 'Zaloguj sie' : 'Utworz konto'}</button>
          </form>
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }} /><span style={{ fontSize:12, color:'var(--text3)' }}>lub</span><div style={{ flex:1, height:1, background:'var(--border)' }} />
          </div>
          <button onClick={googleLogin} disabled={loading} style={{ width:'100%', background:'white', color:'#333', padding:'11px 20px', borderRadius:'var(--radius-sm)', fontWeight:500, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.6-2.9-11.3-7H6.3C9.7 39.7 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.6-4.5 6.1l6.2 5.2C40.5 36 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
            Zaloguj przez Google
          </button>
          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text3)' }}>
            {mode === 'login' ? 'Nie masz konta? ' : 'Masz juz konto? '}
            <button onClick={() => { setMode(m => m==='login'?'register':'login'); setErr('') }} style={{ background:'none', color:'var(--accent)', fontWeight:600, fontSize:13, padding:0 }}>
              {mode === 'login' ? 'Zarejestruj sie' : 'Zaloguj sie'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}