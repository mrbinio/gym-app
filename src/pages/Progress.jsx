import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DEFAULT_EXERCISES } from '../data/exercises'
import { TrendingUp } from 'lucide-react'
import { useLang } from '../context/LangContext'

export default function Progress({ user }) {
  const [workouts, setWorkouts] = useState([])
  const [selected, setSelected] = useState(DEFAULT_EXERCISES[0]?.id||'')
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [customEx, setCustomEx] = useState([])
  const { t, lang } = useLang()

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db,'workouts'),where('uid','==',user.uid),orderBy('date','asc'))
        setWorkouts((await getDocs(q)).docs.map(d=>({id:d.id,...d.data()})))
        const cq = query(collection(db,'custom_exercises'),where('uid','==',user.uid))
        setCustomEx((await getDocs(cq)).docs.map(d=>({id:d.id,...d.data()})))
      } catch(e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [user.uid])

  useEffect(() => {
    if (!selected||!workouts.length) { setChartData([]); return }
    const data = []
    workouts.forEach(w => {
      const ex = w.exercises?.find(e=>e.exId===selected)
      if (ex?.sets?.length) {
        const maxW = Math.max(...ex.sets.map(s=>parseFloat(s.weight)||0))
        const totalR = ex.sets.reduce((a,s)=>a+(parseInt(s.reps)||0),0)
        const vol = ex.sets.reduce((a,s)=>a+((parseFloat(s.weight)||0)*(parseInt(s.reps)||0)),0)
        data.push({ date:w.date?.toDate().toLocaleDateString(lang==='pl'?'pl-PL':'en-GB',{day:'numeric',month:'short'}), maxWeight:maxW, totalReps:totalR, volume:Math.round(vol) })
      }
    })
    setChartData(data)
  }, [selected, workouts, lang])

  const allEx = [...DEFAULT_EXERCISES, ...customEx]
  const best = chartData.length ? Math.max(...chartData.map(d=>d.maxWeight)) : 0
  const latest = chartData[chartData.length-1]
  const prev = chartData[chartData.length-2]
  const trend = latest&&prev ? latest.maxWeight-prev.maxWeight : 0

  const Tip = ({active,payload,label}) => active&&payload?.length ? (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', fontSize:13 }}>
      <div style={{ color:'var(--text2)', marginBottom:4 }}>{label}</div>
      {payload.map(p=><div key={p.name} style={{ color:p.color }}>{p.name==='maxWeight'?t('progress.maxWeight'):p.name==='volume'?t('progress.volume'):t('progress.reps')}: <strong>{p.value}{p.name==='maxWeight'?' kg':p.name==='volume'?' kg':''}</strong></div>)}
    </div>
  ) : null

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:32, letterSpacing:2, marginBottom:4 }}>{t('progress.title')}</h1>
      <p style={{ color:'var(--text3)', fontSize:13, marginBottom:24 }}>{t('progress.subtitle')}</p>
      <div className="card" style={{ marginBottom:20 }}>
        <label style={{ fontSize:12, color:'var(--text2)', marginBottom:8, display:'block' }}>{t('progress.selectExercise')}</label>
        <select value={selected} onChange={e=>setSelected(e.target.value)}>
          {['A','B','C','D'].map(day=>{const exs=allEx.filter(e=>e.day===day);return exs.length?<optgroup key={day} label={(lang==='pl'?'Dzien ':'Day ')+day}>{exs.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</optgroup>:null})}
        </select>
      </div>
      {loading ? <div style={{ color:'var(--text3)', textAlign:'center', padding:40 }}>{t('loading')}</div> : chartData.length===0 ? (
        <div className="card" style={{ textAlign:'center', padding:'40px 20px', color:'var(--text3)' }}>{t('progress.noData')} &#128170;</div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
            {[{label:t('progress.record'),value:best+' kg',color:'var(--accent)'},{label:t('progress.latest'),value:(latest?.maxWeight||0)+' kg',color:'var(--text)'},{label:t('progress.change'),value:(trend>=0?'+':'')+trend+' kg',color:trend>=0?'var(--success)':'var(--danger)'}].map(({label,value,color})=>(
              <div key={label} className="card" style={{ textAlign:'center', padding:'14px 10px' }}>
                <div style={{ fontSize:20, fontFamily:'var(--font-display)', letterSpacing:1, color }}>{value}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}><TrendingUp size={16} color="var(--accent)"/><span style={{ fontSize:14, fontWeight:600 }}>{t('progress.maxWeight')}</span></div>
            <ResponsiveContainer width="100%" height={200}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#1e2d45"/><XAxis dataKey="date" tick={{fontSize:11,fill:'#475569'}}/><YAxis tick={{fontSize:11,fill:'#475569'}}/><Tooltip content={<Tip/>}/><Line type="monotone" dataKey="maxWeight" stroke="var(--accent)" strokeWidth={2} dot={{fill:'var(--accent)',r:4}}/></LineChart></ResponsiveContainer>
          </div>
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>{t('progress.volume')}</div>
            <ResponsiveContainer width="100%" height={160}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#1e2d45"/><XAxis dataKey="date" tick={{fontSize:11,fill:'#475569'}}/><YAxis tick={{fontSize:11,fill:'#475569'}}/><Tooltip content={<Tip/>}/><Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={{fill:'#3b82f6',r:3}}/></LineChart></ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>{t('progress.history')}</div>
            {[...chartData].reverse().map((d,i)=>(
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                <span style={{ color:'var(--text2)' }}>{d.date}</span>
                <span style={{ color:'var(--accent)', fontWeight:600 }}>{d.maxWeight} kg</span>
                <span style={{ color:'var(--text3)' }}>{d.totalReps} {t('progress.reps')}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}