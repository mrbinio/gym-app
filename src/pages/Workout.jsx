import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, serverTimestamp, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useLocation } from 'react-router-dom'
import { DEFAULT_EXERCISES, DAYS } from '../data/exercises'
import { Plus, Trash2, CheckCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'

export default function Workout({ user }) {
  const location = useLocation()
  const [selectedDay, setSelectedDay] = useState(location.state?.day || 'A')
  const [exercises, setExercises] = useState([])
  const [log, setLog] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [prevBests, setPrevBests] = useState({})
  const [showDesc, setShowDesc] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db,'custom_exercises'), where('uid','==',user.uid))
        const snap = await getDocs(q)
        const custom = snap.docs.map(d => ({ id:d.id, ...d.data() }))
        setExercises([...DEFAULT_EXERCISES.filter(e=>e.day===selectedDay), ...custom.filter(e=>e.day===selectedDay)])
      } catch { setExercises(DEFAULT_EXERCISES.filter(e=>e.day===selectedDay)) }
      try {
        const q2 = query(collection(db,'workouts'), where('uid','==',user.uid), where('day','==',selectedDay), orderBy('date','desc'), limit(1))
        const snap2 = await getDocs(q2)
        if (!snap2.empty) {
          const prev = snap2.docs[0].data()
          const bests = {}
          prev.exercises?.forEach(e => { bests[e.exId] = e.sets })
          setPrevBests(bests)
        }
      } catch {}
    }
    load(); setLog({}); setSaved(false); setExpanded({})
  }, [selectedDay, user.uid])

  const addSet = (exId) => { setLog(l => ({ ...l, [exId]:[...(l[exId]||[]), { weight:'', reps:'' }] })); setExpanded(e=>({...e,[exId]:true})) }
  const updateSet = (exId,idx,field,val) => { setLog(l => { const sets=[...(l[exId]||[])]; sets[idx]={...sets[idx],[field]:val}; return {...l,[exId]:sets} }) }
  const removeSet = (exId,idx) => { setLog(l => { const sets=(l[exId]||[]).filter((_,i)=>i!==idx); return {...l,[exId]:sets} }) }

  const saveWorkout = async () => {
    const loggedEx = exercises.filter(e=>log[e.id]?.length>0).map(e=>({ exId:e.id, name:e.name, sets:log[e.id].filter(s=>s.weight||s.reps) })).filter(e=>e.sets.length>0)
    if (!loggedEx.length) return
    setSaving(true)
    try { await addDoc(collection(db,'workouts'), { uid:user.uid, day:selectedDay, exercises:loggedEx, date:serverTimestamp() }); setSaved(true) }
    catch(e) { console.error(e) }
    setSaving(false)
  }

  const totalSets = Object.values(log).reduce((a,sets)=>a+(sets?.filter(s=>s.weight||s.reps).length||0),0)
  const dayConfig = DAYS[selectedDay]

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:32, letterSpacing:2, marginBottom:4 }}>TRENING</h1>
      <p style={{ color:'var(--text3)', fontSize:13, marginBottom:24 }}>{new Date().toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'})}</p>
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {Object.entries(DAYS).map(([key,{label,color}]) => (
          <button key={key} onClick={()=>setSelectedDay(key)} style={{ padding:'8px 18px', borderRadius:20, border:'1px solid '+(selectedDay===key?color:'var(--border)'), background:selectedDay===key?color+'22':'transparent', color:selectedDay===key?color:'var(--text2)', fontWeight:selectedDay===key?600:400, fontSize:14 }}>{label}</button>
        ))}
      </div>
      <div style={{ marginBottom:16, padding:'10px 16px', background:dayConfig.color+'11', border:'1px solid '+dayConfig.color+'33', borderRadius:'var(--radius-sm)', fontSize:13, color:'var(--text2)' }}>{dayConfig.sub}</div>
      {saved ? (
        <div style={{ textAlign:'center', padding:'40px 20px', background:'var(--bg2)', borderRadius:'var(--radius)', border:'1px solid var(--success)44' }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom:12 }} />
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, letterSpacing:2, color:'var(--success)', marginBottom:8 }}>TRENING ZAPISANY!</div>
          <div style={{ color:'var(--text3)', fontSize:14, marginBottom:20 }}>{totalSets} serii zapisanych</div>
          <button className="btn-ghost" onClick={()=>{setSaved(false);setLog({})}}>Zacznij kolejny</button>
        </div>
      ) : (
        <>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {exercises.map(ex => {
              const sets = log[ex.id]||[]
              const prev = prevBests[ex.id]||[]
              return (
                <div key={ex.id} className="card" style={{ padding:0, overflow:'hidden' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', cursor:'pointer' }} onClick={()=>setExpanded(e=>({...e,[ex.id]:!e[ex.id]}))}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600 }}>{ex.name}</div>
                      <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>
                        <span className="tag" style={{ marginRight:6 }}>{ex.group}</span>
                        {sets.filter(s=>s.weight||s.reps).length>0 && <span style={{ color:'var(--accent)' }}>{sets.filter(s=>s.weight||s.reps).length} serii</span>}
                      </div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setShowDesc(d=>({...d,[ex.id]:!d[ex.id]}))}} style={{ background:'none', color:'var(--text3)', padding:4 }}><Info size={14} /></button>
                    {expanded[ex.id] ? <ChevronUp size={16} color="var(--text3)" /> : <ChevronDown size={16} color="var(--text3)" />}
                  </div>
                  {showDesc[ex.id] && <div style={{ padding:'0 16px 12px', fontSize:13, color:'var(--text2)', background:'var(--bg3)', borderTop:'1px solid var(--border)' }}>{ex.desc}</div>}
                  {expanded[ex.id] && (
                    <div style={{ padding:'0 16px 14px', borderTop:'1px solid var(--border)' }}>
                      {prev.length>0 && <div style={{ fontSize:11, color:'var(--text3)', margin:'10px 0 6px' }}>Poprzednio: {prev.map(s=>s.weight+'kg x'+s.reps).join(', ')}</div>}
                      {sets.length>0 && (
                        <div style={{ marginTop:10, marginBottom:8 }}>
                          <div style={{ display:'grid', gridTemplateColumns:'30px 1fr 1fr 30px', gap:6, fontSize:11, color:'var(--text3)', marginBottom:6 }}><span>#</span><span>Ciezar (kg)</span><span>Powt.</span><span></span></div>
                          {sets.map((s,i) => (
                            <div key={i} style={{ display:'grid', gridTemplateColumns:'30px 1fr 1fr 30px', gap:6, marginBottom:6, alignItems:'center' }}>
                              <span style={{ fontSize:13, color:'var(--text3)', paddingTop:8 }}>{i+1}</span>
                              <input type="number" placeholder={prev[i]?.weight||'0'} value={s.weight} onChange={e=>updateSet(ex.id,i,'weight',e.target.value)} min="0" step="0.5" />
                              <input type="number" placeholder={prev[i]?.reps||'0'} value={s.reps} onChange={e=>updateSet(ex.id,i,'reps',e.target.value)} min="0" />
                              <button onClick={()=>removeSet(ex.id,i)} style={{ background:'none', color:'var(--text3)', padding:4, paddingTop:8 }}><Trash2 size={14} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={()=>addSet(ex.id)} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg3)', border:'1px dashed var(--border)', color:'var(--text2)', padding:'8px 14px', borderRadius:'var(--radius-sm)', fontSize:13, width:'100%', justifyContent:'center' }}><Plus size={14} /> Dodaj serie</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <button onClick={saveWorkout} disabled={saving||totalSets===0} className="btn-primary" style={{ opacity:totalSets===0?0.4:1 }}>{saving?'Zapisywanie...':'Zapisz trening ('+totalSets+' serii)'}</button>
        </>
      )}
    </div>
  )
}