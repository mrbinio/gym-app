import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { Dumbbell, BarChart2, BookOpen, Home, LogOut, Clock, Scale, Salad, Menu, X } from 'lucide-react'

const ALL_NAV = [
  { to:'/', icon:Home, label:'Dashboard' },
  { to:'/workout', icon:Dumbbell, label:'Trening' },
  { to:'/progress', icon:BarChart2, label:'Postep' },
  { to:'/diet', icon:Salad, label:'Dieta' },
  { to:'/weight', icon:Scale, label:'Waga' },
  { to:'/history', icon:Clock, label:'Historia' },
  { to:'/exercises', icon:BookOpen, label:'Cwicz.' },
]

const MAIN_NAV = ALL_NAV.slice(0, 4)
const MORE_NAV = ALL_NAV.slice(4)

export default function Layout({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)
  const logout = async () => { await signOut(auth); navigate('/login') }
  const isMoreActive = MORE_NAV.some(n => location.pathname === n.to)

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
          {ALL_NAV.map(({ to, icon:Icon, label }) => (
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

      {/* Mobile bottom nav - 4 main + More button */}
      <nav style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, background:'var(--bg2)', borderTop:'1px solid var(--border)', zIndex:100 }} className='bottom-nav'>
        <div style={{ display:'flex', padding:'6px 0' }}>
          {MAIN_NAV.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to} end={to==='/'} onClick={() => setShowMore(false)} style={({ isActive }) => ({
              display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 0', flex:1,
              color:isActive?'var(--accent)':'var(--text3)', textDecoration:'none', fontSize:10, fontWeight:isActive?600:400
            })}>
              <Icon size={20}/> {label}
            </NavLink>
          ))}
          <button onClick={() => setShowMore(s => !s)} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 0', flex:1,
            color:showMore||isMoreActive?'var(--accent)':'var(--text3)', background:'none', fontSize:10,
            fontWeight:showMore||isMoreActive?600:400, border:'none'
          }}>
            {showMore ? <X size={20}/> : <Menu size={20}/>}
            Wiecej
          </button>
        </div>

        {/* More menu dropdown */}
        {showMore && (
          <div style={{ position:'absolute', bottom:'100%', right:0, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm) 0 0 0', minWidth:160, boxShadow:'0 -4px 20px rgba(0,0,0,0.3)' }}>
            {MORE_NAV.map(({ to, icon:Icon, label }) => (
              <NavLink key={to} to={to} onClick={() => setShowMore(false)} style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:12, padding:'14px 20px',
                color:isActive?'var(--accent)':'var(--text2)', textDecoration:'none', fontSize:14,
                fontWeight:isActive?600:400, borderBottom:'1px solid var(--border)'
              })}>
                <Icon size={18}/> {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .sidebar { display: none !important; }
          .bottom-nav { display: block !important; }
          main { padding-bottom: 75px !important; }
        }
      `}</style>
    </div>
  )
}