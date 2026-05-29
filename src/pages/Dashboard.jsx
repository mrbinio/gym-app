import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Flame, TrendingUp } from 'lucide-react'
import { DAYS } from '../data/exercises'

export default function Dashboard({ user }) {
  const [recent, setRecent] = useState([])
  const [stats, setStats] = useState({ total:0, thisWeek:0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db,'workouts'),where('uid','==',user.uid),orderBy('date','desc'),limit(10))
        const snap = await getDocs(q)
        const data = snap.docs.map(d=>({id:d.id,...d.data()}))
        setRecent(data)
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7)
        const thisWeek = data.filter(w=>w.date?.toDate()>weekAgo).length
        const allQ = query(collection(db,'workouts'),where('uid','==',user.uid))
        const allSnap = await getDocs(allQ)
        setStats({ total:allSnap.size, thisWeek })
      } catch(e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [user.uid])

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:36,letterSpacing:2}}>WITAJ, {(user.displayName?.split(' ')[0]||user.email.split('@')[0]).toUpperCase()}!</h1>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:28}}>
        {[{label:'Wszystkie treningi',value:stats.total,icon:Dumbbell,color:'#3b82f6'},{label:'Ten tydzien',value:stats.thisWeek,icon:Flame,color:'var(--accent)'},{label:'Cwiczenia w planie',value:22,icon:TrendingUp,color:'#22c55e'}].map(({label,value,icon:Icon,color})=>(
          <div key={label} className='card' style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:40,height:40,borderRadius:10,background:color+'22',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon size={20} color={color}/></div>
            <div><div style={{fontSize:24,fontFamily:'var(--font-display)',letterSpacing:1,color}}>{value}</div><div style={{fontSize:12,color:'var(--text3)'}}>{label}</div></div>
          </div>
        ))}
      </div>
      <div className='card' style={{marginBottom:24,border:'1px solid var(--accent)33'}}>
        <h2 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Zacznij trening</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10}}>
          {Object.entries(DAYS).map(([key,{label,sub,color}])=>(
            <button key={key} onClick={()=>navigate('/workout',{state:{day:key}})} style={{background:'var(--bg3)',border:'1px solid '+color+'44',borderRadius:'var(--radius-sm)',padding:'14px 16px',textAlign:'left',cursor:'pointer'}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:20,letterSpacing:1,color,marginBottom:2}}>{label}</div>
              <div style={{fontSize:11,color:'var(--text3)'}}>{sub}</div>
            </button>
          ))}
        </div>
      </div>
      <div className='card'>
        <h2 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Ostatnie treningi</h2>
        {loading?<div style={{color:'var(--text3)',fontSize:13}}>Ladowanie...</div>:recent.length===0?(
          <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:14}}>Brak treningow. Zacznij pierwszy!</div>
        ):(recent.map(w=>(
          <div key={w.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
            <div style={{width:36,height:36,borderRadius:8,background:(DAYS[w.day]?.color||'#888')+'22',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:16,color:DAYS[w.day]?.color||'#888',flexShrink:0}}>{w.day}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:500}}>{DAYS[w.day]?.sub||w.day}</div>
              <div style={{fontSize:12,color:'var(--text3)'}}>{w.date?.toDate().toLocaleDateString('pl-PL')}</div>
            </div>
            <div style={{fontSize:12,color:'var(--text2)'}}>{w.exercises?.length||0} cw.</div>
          </div>
        )))}
      </div>
    </div>
  )
}