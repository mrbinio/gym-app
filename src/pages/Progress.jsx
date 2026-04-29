import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DEFAULT_EXERCISES } from '../data/exercises'
import { TrendingUp } from 'lucide-react'

export default function Progress({ user }) {
  const [workouts, setWorkouts] = useState([])
  const [allExNames, setAllExNames] = useState([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db,'workouts'), where('uid','==',user.uid), orderBy('date','asc'))
        const snap = await getDocs(q)
        const data = snap.docs.map(d => ({ id:d.id, ...d.data() }))
        setWorkouts(data)
        // Build unique exercise names from actual workout data + default exercises
        const namesFromWorkouts = new Set()
        data.forEach(w => w.exercises?.forEach(e => { if (e.name) namesFromWorkouts.add(e.name) }))
        // Also add default exercises
        DEFAULT_EXERCISES.forEach(e => namesFromWorkouts.add(e.name))
        const namesList = [...namesFromWorkouts]
        setAllExNames(namesList)
        if (namesList.length > 0) setSelected(namesList[0])
      } catch(e) { console.error('progress load', e) }
      setLoading(false)
    }
    load()
  }, [user.uid])

  useEffect(() => {
    if (!selected || !workouts.length) { setChartData([]); return }
    const data = []
    workouts.forEach(w => {
      // Match by name OR by exId for backwards compatibility
      const ex = w.exercises?.find(e =>
        e.name === selected ||
        (e.exId && DEFAULT_EXERCISES.find(d => d.id === e.exId && d.name === selected))
      )
      if (ex?.sets?.length) {
        const validSets = ex.sets.filter(s => parseFloat(s.weight) > 0 || parseInt(s.reps) > 0)
        if (!validSets.length) return
        const maxW = Math.max(...validSets.map(s => parseFloat(s.weight) || 0))
        const totalR = validSets.reduce((a,s) => a + (parseInt(s.reps) || 0), 0)
        const vol = validSets.reduce((a,s) => a + ((parseFloat(s.weight)||0) * (parseInt(s.reps)||0)), 0)
        data.push({
          date: w.date?.toDate().toLocaleDateString('pl-PL', {day:'numeric', month:'short'}),
          fullDate: w.date?.toDate(),
          maxWeight: maxW,
          totalReps: totalR,
          volume: Math.round(vol),
          sets: validSets.length
        })
      }
    })
    setChartData(data)
  }, [selected, workouts])

  const best = chartData.length ? Math.max(...chartData.map(d => d.maxWeight)) : 0
  const latest = chartData[chartData.length-1]
  const prev = chartData[chartData.length-2]
  const trend = latest && prev ? latest.maxWeight - prev.maxWeight : 0

  const Tip = ({active,payload,label}) => active && payload?.length ? (
    <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',fontSize:13}}>
      <div style={{color:'var(--text2)',marginBottom:4}}>{label}</div>
      {payload.map(p => <div key={p.name} style={{color:p.color}}>{p.name==='maxWeight'?'Max ciezar':p.name==='volume'?'Objetosc':'Powt.'}: <strong>{p.value}{p.name==='maxWeight'||p.name==='volume'?' kg':''}</strong></div>)}
    </div>
  ) : null

  // Group exercises by day for the selector
  const exByDay = { A:[], B:[], C:[], inne:[] }
  DEFAULT_EXERCISES.forEach(e => {
    if (exByDay[e.day]) exByDay[e.day].push(e.name)
    else exByDay['inne'].push(e.name)
  })
  // Add custom names not in defaults
  allExNames.forEach(n => {
    const inDefault = DEFAULT_EXERCISES.find(e => e.name === n)
    if (!inDefault) exByDay['inne'].push(n)
  })

  return (
    <div>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:32,letterSpacing:2,marginBottom:4}}>POSTEP</h1>
      <p style={{color:'var(--text3)',fontSize:13,marginBottom:24}}>Sledz swoj rozwoj sily</p>
      <div className='card' style={{marginBottom:20}}>
        <label style={{fontSize:12,color:'var(--text2)',marginBottom:8,display:'block'}}>Wybierz cwiczenie</label>
        <select value={selected} onChange={e=>setSelected(e.target.value)}>
          {Object.entries(exByDay).map(([day, names]) => {
            if (!names.length) return null
            const label = day==='A'?'Dzien A':day==='B'?'Dzien B':day==='C'?'Dzien C':day==='inne'?'Inne':day
            return <optgroup key={day} label={label}>{names.map(n => <option key={n} value={n}>{n}</option>)}</optgroup>
          })}
        </select>
      </div>
      {loading ? <div style={{color:'var(--text3)',textAlign:'center',padding:40}}>Ladowanie...</div> : chartData.length===0 ? (
        <div className='card' style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{color:'var(--text3)',fontSize:14,marginBottom:8}}>Brak danych dla: <strong style={{color:'var(--text2)'}}>{selected}</strong></div>
          <div style={{color:'var(--text3)',fontSize:12}}>Upewnij sie ze wpisalas ciezar lub powtorzenia przy tym cwiczeniu</div>
        </div>
      ) : (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
            {[
              {label:'Rekord',value:best>0?best+' kg':'brak',color:'var(--accent)'},
              {label:'Ostatnio',value:latest?.maxWeight>0?(latest.maxWeight+' kg'):latest?.totalReps+' powt',color:'var(--text)'},
              {label:'Zmiana',value:trend!==0?(trend>0?'+':'')+trend+' kg':'=',color:trend>0?'var(--success)':trend<0?'var(--danger)':'var(--text3)'}
            ].map(({label,value,color})=>(
              <div key={label} className='card' style={{textAlign:'center',padding:'14px 10px'}}>
                <div style={{fontSize:18,fontFamily:'var(--font-display)',letterSpacing:1,color}}>{value}</div>
                <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
          {best > 0 && (
            <div className='card' style={{marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}><TrendingUp size={16} color='var(--accent)'/><span style={{fontSize:14,fontWeight:600}}>Max ciezar (kg)</span></div>
              <ResponsiveContainer width='100%' height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#1e2d45'/>
                  <XAxis dataKey='date' tick={{fontSize:11,fill:'#475569'}}/>
                  <YAxis tick={{fontSize:11,fill:'#475569'}}/>
                  <Tooltip content={<Tip/>}/>
                  <Line type='monotone' dataKey='maxWeight' stroke='var(--accent)' strokeWidth={2} dot={{fill:'var(--accent)',r:4}} activeDot={{r:6}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className='card' style={{marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Objetosc (kg x powt.)</div>
            <ResponsiveContainer width='100%' height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#1e2d45'/>
                <XAxis dataKey='date' tick={{fontSize:11,fill:'#475569'}}/>
                <YAxis tick={{fontSize:11,fill:'#475569'}}/>
                <Tooltip content={<Tip/>}/>
                <Line type='monotone' dataKey='volume' stroke='#3b82f6' strokeWidth={2} dot={{fill:'#3b82f6',r:3}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className='card'>
            <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>Historia</div>
            {[...chartData].reverse().map((d,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,padding:'10px 0',borderBottom:'1px solid var(--border)',fontSize:13}}>
                <span style={{color:'var(--text2)'}}>{d.date}</span>
                <span style={{color:'var(--accent)',fontWeight:600}}>{d.maxWeight>0?d.maxWeight+' kg':'-'}</span>
                <span style={{color:'var(--text3)'}}>{d.totalReps} powt.</span>
                <span style={{color:'var(--text3)'}}>{d.sets} serii</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}