import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { Dumbbell, BarChart2, BookOpen, Home, LogOut } from 'lucide-react'
import { useLang } from '../context/LangContext'

export default function Layout({ user }) {
  const navigate = useNavigate()
  const { lang, toggle, t } = useLang()
  const logout = async () => { await signOut(auth); navigate('/login') }

  const nav = [
    { to:'/', icon:Home, label:t('nav.dashboard') },
    { to:'/workout', icon:Dumbbell, label:t('nav.workout') },
    { to:'/progress', icon:BarChart2, label:t('nav.progress') },
    { to:'/exercises', icon:BookOpen, label:t('nav.exercises') },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <header style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:22, letterSpacing:2, color:'var(--accent)' }}>GYM BINIARZ</div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={toggle} style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)', padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600, letterSpacing:1, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            {lang === 'pl' ? '🇬🇧 EN' : '🇵🇱 PL'}
          </button>
          <span style={{ fontSize:13, color:'var(--text3)', display:'none' }} className="email-label">{user.email}</span>
          <button onClick={logout} style={{ background:'transparent', color:'var(--text3)', display:'flex', alignItems:'center', gap:4, fontSize:13, padding:'6px 10px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
            <LogOut size={14}/> {t('logout')}
          </button>
        </div>
      </header>
      <div style={{ flex:1, display:'flex' }}>
        <nav style={{ width:200, background:'var(--bg2)', borderRight:'1px solid var(--border)', padding:'20px 12px', display:'flex', flexDirection:'column', gap:4, position:'sticky', top:57, height:'calc(100vh - 57px)' }} className="sidebar">
          {nav.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to} end={to==='/'} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--radius-sm)',
              color:isActive?'var(--accent)':'var(--text2)', background:isActive?'rgba(249,115,22,0.1)':'transparent',
              textDecoration:'none', fontSize:14, fontWeight:isActive?600:400,
              borderLeft:isActive?'2px solid var(--accent)':'2px solid transparent', transition:'all 0.15s'
            })}>
              <Icon size={16}/> {label}
            </NavLink>
          ))}
        </nav>
        <main style={{ flex:1, padding:'24px 20px', maxWidth:900, margin:'0 auto', width:'100%' }}>
          <Outlet/>
        </main>
      </div>
      <nav style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, background:'var(--bg2)', borderTop:'1px solid var(--border)', padding:'8px 0', zIndex:100 }} className="bottom-nav">
        {nav.map(({ to, icon:Icon, label }) => (
          <NavLink key={to} to={to} end={to==='/'} style={({ isActive }) => ({
            display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 0', flex:1,
            color:isActive?'var(--accent)':'var(--text3)', textDecoration:'none', fontSize:10, fontWeight:isActive?600:400
          })}>
            <Icon size={20}/> {label}
          </NavLink>
        ))}
      </nav>
      <style>{`
        @media (max-width: 640px) {
          .sidebar { display: none !important; }
          .bottom-nav { display: flex !important; }
          main { padding-bottom: 80px !important; }
        }
        @media (min-width: 641px) { .email-label { display: block !important; } }
      `}</style>
    </div>
  )
}