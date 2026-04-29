import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, Timestamp, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useLocation } from 'react-router-dom'
import { DEFAULT_EXERCISES, DAYS } from '../data/exercises'
import { Plus, Trash2, CheckCircle, ChevronDown, ChevronUp, Info, Calendar } from 'lucide-react'

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
  const todayStr = new Date().toISOString().split('T')[0]
  const [workoutDate, setWorkoutDate] = useState(todayStr)
  const [extraName, setExtraName] = useState('')
  const [extraIsCardio, setExtraIsCardio] = useState(true)
  const [showExtra, setShowExtra] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db,'custom_exercises'), where('uid','==',user.uid))
        const snap = await getDocs(q)
        const custom = snap.docs.map(d=>({id:d.id,...d.data()}))
        setExercises([...DEFAULT_EXERCISES.filter(e=>e.day===selectedDay),...custom.filter(e=>e.day===selectedDay)])
      } catch { setExercises(DEFAULT_EXERCISES.filter(e=>e.day===selectedDay)) }
      try {
        const q2 = query(collection(db,'workouts'),where('uid','==',user.uid),where('day','==',selectedDay),orderBy('date','desc'),limit(1))
        const snap2 = await getDocs(q2)
        if (!snap2.empty) { const bests={}; snap2.docs[0].data().exercises?.forEach(e=>{bests[e.exId]=e.sets}); setPrevBests(bests) }
        else setPrevBests({})
      } catch(e) { console.error('prev',e) }
    }
    load(); setLog({}); setSaved(false); setExpanded({})
  }, [selectedDay, user.uid])

  const initSets = (ex) => {
    if (log[ex.id]?.length > 0) { setExpanded(e=>({...e,[ex.id]:true})); return }
    setLog(l=>({...l,[ex.id]:Array.from({length:ex.sets||3},()=>({weight:'',reps:''}))}))
    setExpanded(e=>({...e,[ex.id]:true}))
  }
  const addSet = (exId) => setLog(l=>({...l,[exId]:[...(l[exId]||[]),{weight:'',reps:''}]}))
  const updateSet = (exId,idx,field,val) => setLog(l=>{const s=[...(l[exId]||[])];s[idx]={...s[idx],[field]:val};return{...l,[exId]:s}})
  const removeSet = (exId,idx) => setLog(l=>({...l,[exId]:(l[exId]||[]).filter((_,i)=>i!==idx)}))

  const addExtraExercise = () => {
    if (!extraName.trim()) return
    const id = 'extra_' + Date.now()
    const isCardio = extraIsCardio
    const newEx = { id, name: extraName.trim(), group: isCardio ? 'Cardio' : 'Dodatkowe', sets: 1, reps: isCardio ? 'min' : '10', noWeight: isCardio, isExtra: true }
    setExercises(ex => [...ex, newEx])
    setLog(l => ({...l, [id]: Array.from({length: isCardio ? 1 : 3}, ()=>({weight:'', reps:''}))}))    
    setExpanded(e => ({...e, [id]: true}))
    setExtraName('')
    setShowExtra(false)
  }

  const saveWorkout = async () => {
    const loggedEx = exercises
      .filter(e=>log[e.id]?.length>0)
      .map(e=>({ exId:e.id, name:e.name, sets:log[e.id].filter(s=>s.reps||s.weight) }))
      .filter(e=>e.sets.length>0)
    if (!loggedEx.length) return
    setSaving(true)
    try {
      const dateObj = new Date(workoutDate + 'T12:00:00')
      await addDoc(collection(db,'workouts'), {
        uid: user.uid,
        day: selectedDay,
        exercises: loggedEx,
        date: Timestamp.fromDate(dateObj)
      })
      setSaved(true)
    } catch(e) { console.error('save error', e); alert('Blad zapisu: ' + e.message) }
    setSaving(false)
  }
  const totalSets = Object.values(log).reduce((a,s)=>a+(s?.filter(s=>s.reps||s.weight).length||0),0)
  const dayConfig = DAYS[selectedDay]
  return (
    <div>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:32,letterSpacing:2,marginBottom:16}}>TRENING</h1>
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {Object.entries(DAYS).map(([key,{label,color}])=>(
          <button key={key} onClick={()=>setSelectedDay(key)} style={{padding:'8px 18px',borderRadius:20,border:'1px solid '+(selectedDay===key?color:'var(--border)'),background:selectedDay===key?color+'22':'transparent',color:selectedDay===key?color:'var(--text2)',fontWeight:selectedDay===key?600:400,fontSize:14}}>{label}</button>
        ))}
      </div>
      <div style={{marginBottom:16,padding:'12px 16px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',display:'flex',alignItems:'center',gap:10}}>
        <Calendar size={16} color='var(--accent)'/>
        <label style={{fontSize:13,color:'var(--text2)',whiteSpace:'nowrap'}}>Data:</label>
        <input type='date' value={workoutDate} onChange={e=>setWorkoutDate(e.target.value)} style={{flex:1,padding:'6px 10px',fontSize:13,maxWidth:180}}/>
      </div>
      <div style={{marginBottom:20,padding:'10px 16px',background:dayConfig.color+'11',border:'1px solid '+dayConfig.color+'33',borderRadius:'var(--radius-sm)',fontSize:13,color:'var(--text2)'}}>{dayConfig.sub}</div>
      {saved ? (
        <div style={{textAlign:'center',padding:'40px 20px',background:'var(--bg2)',borderRadius:'var(--radius)',border:'1px solid var(--success)44'}}>
          <CheckCircle size={48} color='var(--success)' style={{marginBottom:12}}/>
          <div style={{fontFamily:'var(--font-display)',fontSize:28,letterSpacing:2,color:'var(--success)',marginBottom:8}}>TRENING ZAPISANY!</div>
          <div style={{color:'var(--text3)',fontSize:14,marginBottom:6}}>{workoutDate}</div>
          <div style={{color:'var(--text3)',fontSize:14,marginBottom:20}}>{totalSets} serii zapisanych</div>
          <button className='btn-ghost' onClick={()=>{setSaved(false);setLog({});setWorkoutDate(todayStr)}}>Zacznij kolejny</button>
        </div>
      ) : (
        <>
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
            {exercises.map(ex=>{
              const sets=log[ex.id]||[]
              const prev=prevBests[ex.id]||[]
              const doneSets=sets.filter(s=>s.reps||s.weight).length
              const isBodyweight = ex.noWeight === true
              return (
                <div key={ex.id} className='card' style={{padding:0,overflow:'hidden',border:doneSets>0?'1px solid var(--accent)44':'1px solid var(--border)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>expanded[ex.id]?setExpanded(e=>({...e,[ex.id]:false})):initSets(ex)}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600}}>{ex.name}</div>
                      <div style={{display:'flex',gap:6,marginTop:4,alignItems:'center',flexWrap:'wrap'}}>
                        <span className='tag'>{ex.group}</span>
                        <span style={{fontSize:12,color:'var(--accent)',fontWeight:600,background:'var(--bg3)',padding:'2px 8px',borderRadius:10,border:'1px solid var(--accent)33'}}>{ex.sets} x {ex.reps}</span>
                        {isBodyweight&&<span style={{fontSize:11,color:'#a78bfa',background:'rgba(167,139,250,0.1)',padding:'2px 8px',borderRadius:10}}>bez kg</span>}
                        {doneSets>0&&<span style={{fontSize:12,color:'var(--success)',fontWeight:600}}>{String.fromCharCode(10003)} {doneSets} serii</span>}
                      </div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setShowDesc(d=>({...d,[ex.id]:!d[ex.id]}))}} style={{background:'none',color:'var(--text3)',padding:4}}><Info size={14}/></button>
                    {expanded[ex.id]?<ChevronUp size={16} color='var(--text3)'/>:<ChevronDown size={16} color='var(--text3)'/>}
                  </div>
                  {showDesc[ex.id]&&ex.desc&&<div style={{padding:'8px 16px 12px',fontSize:13,color:'var(--text2)',background:'var(--bg3)',borderTop:'1px solid var(--border)',lineHeight:1.6}}>{ex.desc}</div>}
                  {expanded[ex.id]&&(
                    <div style={{padding:'8px 16px 14px',borderTop:'1px solid var(--border)'}}>
                      {prev.length>0&&(
                        <div style={{fontSize:12,color:'var(--text3)',marginBottom:10,padding:'6px 10px',background:'var(--bg3)',borderRadius:'var(--radius-sm)'}}>
                          Poprzednio: {prev.map((s,i)=><span key={i} style={{color:'var(--accent)',fontWeight:600,marginRight:8}}>{isBodyweight?'':s.weight+'kg '}{s.reps}</span>)}
                        </div>
                      )}
                      <div style={{display:'grid',gridTemplateColumns:isBodyweight?'28px 1fr 28px':'28px 1fr 1fr 28px',gap:6,fontSize:11,color:'var(--text3)',marginBottom:6}}>
                        <span>#</span>{!isBodyweight&&<span>Ciezar (kg)</span>}<span>Powt./Czas</span><span></span>
                      </div>
                      {sets.map((s,i)=>(
                        <div key={i} style={{display:'grid',gridTemplateColumns:isBodyweight?'28px 1fr 28px':'28px 1fr 1fr 28px',gap:6,marginBottom:6,alignItems:'center'}}>
                          <span style={{fontSize:12,color:(s.reps||s.weight)?'var(--accent)':'var(--text3)',paddingTop:8,fontWeight:600}}>{i+1}</span>
                          {!isBodyweight&&<input type='number' inputMode='decimal' placeholder={prev[i]?.weight||'kg'} value={s.weight} onChange={e=>updateSet(ex.id,i,'weight',e.target.value)} min='0' step='0.5'/>}
                          <input type='text' placeholder={ex.reps||prev[i]?.reps||'powt/min'} value={s.reps} onChange={e=>updateSet(ex.id,i,'reps',e.target.value)}/>
                          <button onClick={()=>removeSet(ex.id,i)} style={{background:'none',color:'var(--text3)',padding:4,paddingTop:8}}><Trash2 size={13}/></button>
                        </div>
                      ))}
                      <button onClick={()=>addSet(ex.id)} style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg3)',border:'1px dashed var(--border)',color:'var(--text2)',padding:'8px 14px',borderRadius:'var(--radius-sm)',fontSize:13,width:'100%',justifyContent:'center',marginTop:4}}><Plus size={14}/> Dodaj serie</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{marginBottom:16,padding:'14px 16px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)'}}>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text2)',marginBottom:10}}>+ Dodaj wlasne cwiczenie</div>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <button onClick={()=>setExtraIsCardio(true)} style={{flex:1,padding:'8px',borderRadius:'var(--radius-sm)',border:'1px solid '+(extraIsCardio?'#a78bfa':'var(--border)'),background:extraIsCardio?'rgba(167,139,250,0.15)':'transparent',color:extraIsCardio?'#a78bfa':'var(--text3)',fontSize:13,fontWeight:extraIsCardio?600:400}}>Cardio / bez kg</button>
              <button onClick={()=>setExtraIsCardio(false)} style={{flex:1,padding:'8px',borderRadius:'var(--radius-sm)',border:'1px solid '+(!extraIsCardio?'var(--accent)':'var(--border)'),background:!extraIsCardio?'rgba(249,115,22,0.15)':'transparent',color:!extraIsCardio?'var(--accent)':'var(--text3)',fontSize:13,fontWeight:!extraIsCardio?600:400}}>Silowe / z kg</button>
            </div>
            <div style={{display:'flex',gap:8}}>
              <input value={extraName} onChange={e=>setExtraName(e.target.value)} placeholder={extraIsCardio?'np. Bieznia, Rower, Plywanie':'np. Wyciskanie sztangi'} onKeyDown={e=>e.key==='Enter'&&addExtraExercise()} style={{flex:1}}/>
              <button onClick={addExtraExercise} disabled={!extraName.trim()} className='btn-primary' style={{width:'auto',padding:'10px 16px',whiteSpace:'nowrap',opacity:extraName.trim()?1:0.4}}>Dodaj</button>
            </div>
          </div>
          <button onClick={saveWorkout} disabled={saving||totalSets===0} className='btn-primary' style={{opacity:totalSets===0?0.4:1}}>
            {saving?'Zapisywanie...':totalSets===0?'Kliknij cwiczenie aby zaczac':'Zapisz trening ('+totalSets+' serii)'}
          </button>
        </>
      )}
    </div>
  )
}