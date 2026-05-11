import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

const T = {"pl":{"title":"Twoj osobisty dziennik treningowy","login":"Zaloguj sie","register":"Zarejestruj sie","email":"Email","password":"Haslo","passPlaceholder":"... min 6 znakow","loginBtn":"Zaloguj sie","registerBtn":"Zarejestruj sie","or":"lub","google":"Zaloguj przez Google","noAccount":"Nie masz konta? ","hasAccount":"Masz juz konto? ","forgotPassword":"Zapomniales hasla?","resetTitle":"Reset hasla","resetDesc":"Wpisz email – wyslemy link do resetu hasla","resetBtn":"Wyslij link","resetSent":"Link wyslany! Sprawdz email.","back":"Powrot do logowania","errors":{"auth/invalid-credential":"Bledny email lub haslo","auth/email-already-in-use":"Ten email jest juz zajety","auth/weak-password":"Haslo musi miec min. 6 znakow","auth/invalid-email":"Nieprawidlowy email","auth/user-not-found":"Nie znaleziono uzytkownika"}},"en":{"title":"Your personal workout journal","login":"Log in","register":"Create account","email":"Email","password":"Password","passPlaceholder":"... min 6 characters","loginBtn":"Log in","registerBtn":"Create account","or":"or","google":"Continue with Google","noAccount":"No account? ","hasAccount":"Already have an account? ","forgotPassword":"Forgot password?","resetTitle":"Reset password","resetDesc":"Enter your email – we will send a reset link","resetBtn":"Send link","resetSent":"Link sent! Check your email.","back":"Back to login","errors":{"auth/invalid-credential":"Invalid email or password","auth/email-already-in-use":"Email already in use","auth/weak-password":"Password must be at least 6 characters","auth/invalid-email":"Invalid email address","auth/user-not-found":"User not found"}}}

export default function Login() {
  const [lang, setLang] = useState('pl')
  const t = T[lang]
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [mode, setMode] = useState('login')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handle = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      if (mode === 'login') await signInWithEmailAndPassword(auth, email, pass)
      else await createUserWithEmailAndPassword(auth, email, pass)
    } catch(e) {
      setErr(t.errors[e.code] || e.message)
    }
    setLoading(false)
  }

  const googleLogin = async () => {
    setErr(''); setLoading(true)
    try { await signInWithPopup(auth, googleProvider) }
    catch(e) { setErr(e.message) }
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setResetSent(true)
    } catch(e) {
      setErr(t.errors[e.code] || e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:380 }}>

        {/* Language toggle */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16, gap:6 }}>
          <button onClick={()=>setLang('pl')} style={{ padding:'4px 12px', borderRadius:20, border:'1px solid '+(lang==='pl'?'var(--accent)':'var(--border)'), background:lang==='pl'?'rgba(249,115,22,0.1)':'transparent', color:lang==='pl'?'var(--accent)':'var(--text3)', fontSize:12, fontWeight:lang==='pl'?600:400 }}>PL</button>
          <button onClick={()=>setLang('en')} style={{ padding:'4px 12px', borderRadius:20, border:'1px solid '+(lang==='en'?'var(--accent)':'var(--border)'), background:lang==='en'?'rgba(249,115,22,0.1)':'transparent', color:lang==='en'?'var(--accent)':'var(--text3)', fontSize:12, fontWeight:lang==='en'?600:400 }}>EN</button>
        </div>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:52, letterSpacing:4, color:'var(--accent)', lineHeight:1 }}>GYM</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, letterSpacing:8, color:'var(--text2)' }}>BINIARZ</div>
          <div style={{ marginTop:8, color:'var(--text3)', fontSize:13 }}>{t.title}</div>
        </div>

        <div className='card' style={{ padding:28 }}>

          {/* RESET PASSWORD MODE */}
          {mode === 'reset' && (
            <>
              <h2 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>{t.resetTitle}</h2>
              <p style={{ fontSize:13, color:'var(--text3)', marginBottom:20 }}>{t.resetDesc}</p>
              {resetSent ? (
                <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid var(--success)', borderRadius:'var(--radius-sm)', padding:14, fontSize:14, color:'var(--success)', textAlign:'center', marginBottom:16 }}>
                  {t.resetSent}
                </div>
              ) : (
                <form onSubmit={handleReset} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <label style={{ fontSize:12, color:'var(--text2)', marginBottom:6, display:'block' }}>{t.email}</label>
                    <input type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='email@example.com' required />
                  </div>
                  {err && <div style={{ color:'var(--danger)', fontSize:13, background:'rgba(239,68,68,0.1)', padding:'8px 12px', borderRadius:'var(--radius-sm)' }}>{err}</div>}
                  <button type='submit' className='btn-primary' disabled={loading}>{loading ? '...' : t.resetBtn}</button>
                </form>
              )}
              <button onClick={()=>{setMode('login');setResetSent(false);setErr('')}} style={{ background:'none', color:'var(--accent)', fontSize:13, padding:0, marginTop:16, display:'block', width:'100%', textAlign:'center' }}>
                ← {t.back}
              </button>
            </>
          )}

          {/* LOGIN / REGISTER MODE */}
          {mode !== 'reset' && (
            <>
              <h2 style={{ fontSize:18, fontWeight:600, marginBottom:24 }}>{mode==='login' ? t.login : t.register}</h2>
              <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, color:'var(--text2)', marginBottom:6, display:'block' }}>{t.email}</label>
                  <input type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='email@example.com' required />
                </div>
                <div>
                  <label style={{ fontSize:12, color:'var(--text2)', marginBottom:6, display:'block' }}>{t.password}</label>
                  <input type='password' value={pass} onChange={e=>setPass(e.target.value)} placeholder={t.passPlaceholder} required />
                </div>
                {err && <div style={{ color:'var(--danger)', fontSize:13, background:'rgba(239,68,68,0.1)', padding:'8px 12px', borderRadius:'var(--radius-sm)' }}>{err}</div>}
                <button type='submit' className='btn-primary' disabled={loading}>
                  {loading ? '...' : (mode==='login' ? t.loginBtn : t.registerBtn)}
                </button>
              </form>
              {mode === 'login' && (
                <button onClick={()=>{setMode('reset');setErr('');setResetSent(false)}} style={{ background:'none', color:'var(--text3)', fontSize:12, padding:0, marginTop:10, display:'block', width:'100%', textAlign:'center' }}>
                  {t.forgotPassword}
                </button>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
                <div style={{ flex:1, height:1, background:'var(--border)' }}/><span style={{ fontSize:12, color:'var(--text3)' }}>{t.or}</span><div style={{ flex:1, height:1, background:'var(--border)' }}/>
              </div>
              <button onClick={googleLogin} disabled={loading} style={{ width:'100%', background:'white', color:'#333', padding:'11px 20px', borderRadius:'var(--radius-sm)', fontWeight:500, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <svg width='18' height='18' viewBox='0 0 48 48'><path fill='#FFC107' d='M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z'/><path fill='#FF3D00' d='M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z'/><path fill='#4CAF50' d='M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.6-2.9-11.3-7H6.3C9.7 39.7 16.3 44 24 44z'/><path fill='#1976D2' d='M43.6 20H24v8h11.3c-.9 2.5-2.5 4.6-4.5 6.1l6.2 5.2C40.5 36 44 30.5 44 24c0-1.3-.1-2.7-.4-4z'/></svg>
                {t.google}
              </button>
              <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text3)' }}>
                {mode==='login' ? t.noAccount : t.hasAccount}
                <button onClick={()=>{setMode(m=>m==='login'?'register':'login');setErr('')}} style={{ background:'none', color:'var(--accent)', fontWeight:600, fontSize:13, padding:0 }}>
                  {mode==='login' ? t.register : t.login}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}