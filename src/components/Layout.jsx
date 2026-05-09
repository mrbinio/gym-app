import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { Dumbbell, BarChart2, BookOpen, Home, LogOut, Clock, Scale, Salad } from 'lucide-react'

export default function Layout({ user }) {
  const navigate = useNavigate()
  const logout = async () => { await signOut(auth); navigate('/login') }
  const nav = [
    { to:'/', icon:Home, label:'Dashboard' },
    { to:'/workout', icon:Dumbbell, label:'Trening' },
    { to:'/progress', icon:BarChart2, label:'Postep' },
    { to:'/weight', icon:Scale, label:'Waga' },
    { to:'/diet', icon:Salad, label:'Dieta' },
    { to:'/history', icon:Clock, label:'Historia' },
    { to:'/exercises', icon:BookOpen, label:'Cwicz.' },
  ]
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <header style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:22, letterSpacing:2, color:'var(--accent)' }}>GYM BINIARZ</div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12, color:'var(--text3)' }}>{user.email?.split('@')[0]}</span>
          <button onClick={logout} style={{ background:'transparent', color:'var(--text3)', display:'flex', alignItems:'center', gap:4, fontSize:13, padding:'6px 10px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
            <LogOut size={14}/> Wyloguj
          </button>
        </div>
      </header>
      <div style={{ flex:1, display:'flex' }}>
        <nav style={{ width:200, background:'var(--bg2)', borderRight:'1px solid var(--border)', padding:'20px 12px', display:'flex', flexDirection:'column', gap:4, position:'sticky', top:57, height:'calc(100vh - 57px)', overflowY:'auto' }} className='sidebar'>
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
      <nav style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, background:'var(--bg2)', borderTop:'1px solid var(--border)', padding:'4px 0', zIndex:100 }} className='bottom-nav'>
        {nav.map(({ to, icon:Icon, label }) => (
          <NavLink key={to} to={to} end={to==='/'} style={({ isActive }) => ({
            display:'flex', flexDirection:'column', alignItems:'center', gap:1, padding:'4px 0', flex:1,
            color:isActive?'var(--accent)':'var(--text3)', textDecoration:'none', fontSize:9, fontWeight:isActive?600:400
          })}>
            <Icon size={18}/> {label}
          </NavLink>
        ))}
      </nav>
      <style>{`@media (max-width: 640px) { .sidebar { display: none !important; } .bottom-nav { display: flex !important; } main { padding-bottom: 80px !important; } }`}</style>
    </div>
  )
}