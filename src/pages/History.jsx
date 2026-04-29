import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { DAYS } from '../data/exercises'
import { Trash2, Edit2, ChevronDown, ChevronUp, Check, X } from 'lucide-react'

export default function History({ user }) {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [user.uid])

  const load = async () => {
    setLoading(true)
    try {
      const q = query(collection(db,'workouts'), where('uid','==',user.uid), orderBy('date','desc'))
      const snap = await getDocs(q)
      setWorkouts(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const deleteWorkout = async (id) => {
    if (!window.confirm('Usunac ten trening?')) return
    setDeleting(id)
    try {
      await deleteDoc(doc(db, 'workouts', id))
      setWorkouts(w => w.filter(x => x.id !== id))
    } catch(e) { console.error(e) }
    setDeleting(null)
  }

  const startEdit = (workout) => {
    setEditing(workout.id)
    const copy = {}
    workout.exercises?.forEach(ex => { copy[ex.exId || ex.name] = ex.sets.map(s => ({...s})) })
    setEditData(copy)
  }

  const updateSet = (exKey, idx, field, val) => {
    setEditData(d => {
      const sets = [...(d[exKey]||[])]
      sets[idx] = { ...sets[idx], [field]: val }
      return { ...d, [exKey]: sets }
    })
  }

  const saveEdit = async (workout) => {
    setSaving(true)
    try {
      const updatedExercises = workout.exercises?.map(ex => {
        const key = ex.exId || ex.name
        return { ...ex, sets: editData[key] || ex.sets }
      })
      await updateDoc(doc(db, 'workouts', workout.id), { exercises: updatedExercises })
      setWorkouts(w => w.map(x => x.id===workout.id ? {...x, exercises:updatedExercises} : x))
      setEditing(null)
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  return (
    <div>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:32,letterSpacing:2,marginBottom:4}}>HISTORIA</h1>
      <p style={{color:'var(--text3)',fontSize:13,marginBottom:24}}>Edytuj lub usun zapisane treningi</p>

      {loading ? <div style={{color:'var(--text3)',textAlign:'center',padding:40}}>Ladowanie...</div> :
      workouts.length === 0 ? (
        <div className='card' style={{textAlign:'center',padding:'40px 20px',color:'var(--text3)'}}>Brak treningow</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {workouts.map(w => {
            const isExpanded = expanded[w.id]
            const isEditing = editing === w.id
            const color = DAYS[w.day]?.color || '#888'
            const dateStr = w.date?.toDate().toLocaleDateString('pl-PL', {weekday:'short',day:'numeric',month:'long',year:'numeric'})

            return (
              <div key={w.id} className='card' style={{padding:0,overflow:'hidden',border:isEditing?'1px solid var(--accent)':'1px solid var(--border)'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:18,color,flexShrink:0}}>{w.day}</div>
                  <div style={{flex:1,cursor:'pointer'}} onClick={()=>setExpanded(e=>({...e,[w.id]:!e[w.id]}))}>
                    <div style={{fontSize:14,fontWeight:600}}>{DAYS[w.day]?.sub || w.day}</div>
                    <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{dateStr} &bull; {w.exercises?.length||0} cw.</div>
                  </div>
                  {!isEditing && (
                    <>
                      <button onClick={()=>startEdit(w)} style={{background:'none',color:'var(--text3)',padding:6,borderRadius:6,border:'1px solid var(--border)'}} title='Edytuj'>
                        <Edit2 size={14}/>
                      </button>
                      <button onClick={()=>deleteWorkout(w.id)} disabled={deleting===w.id} style={{background:'none',color:'var(--danger)',padding:6,borderRadius:6,border:'1px solid var(--border)'}} title='Usun'>
                        <Trash2 size={14}/>
                      </button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <button onClick={()=>saveEdit(w)} disabled={saving} style={{background:'var(--success)',color:'white',padding:'6px 12px',borderRadius:6,border:'none',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
                        <Check size={13}/> {saving?'...':'Zapisz'}
                      </button>
                      <button onClick={()=>setEditing(null)} style={{background:'none',color:'var(--text3)',padding:6,borderRadius:6,border:'1px solid var(--border)'}}>
                        <X size={14}/>
                      </button>
                    </>
                  )}
                  <button onClick={()=>setExpanded(e=>({...e,[w.id]:!e[w.id]}))} style={{background:'none',color:'var(--text3)',padding:4}}>
                    {isExpanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}
                  </button>
                </div>

                {(isExpanded || isEditing) && w.exercises?.map((ex,ei) => {
                  const key = ex.exId || ex.name
                  const sets = isEditing ? (editData[key] || ex.sets) : ex.sets
                  const noWeight = !ex.sets?.some(s => parseFloat(s.weight) > 0)
                  return (
                    <div key={ei} style={{borderTop:'1px solid var(--border)',padding:'12px 16px',background:'var(--bg3)'}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:8,color:'var(--text2)'}}>{ex.name}</div>
                      <div style={{display:'grid',gridTemplateColumns:noWeight?'28px 1fr':'28px 1fr 1fr',gap:6,fontSize:11,color:'var(--text3)',marginBottom:6}}>
                        <span>#</span>{!noWeight&&<span>Ciezar (kg)</span>}<span>Powt./Czas</span>
                      </div>
                      {sets.map((s,si) => (
                        <div key={si} style={{display:'grid',gridTemplateColumns:noWeight?'28px 1fr':'28px 1fr 1fr',gap:6,marginBottom:6,alignItems:'center'}}>
                          <span style={{fontSize:12,color:'var(--accent)',fontWeight:600}}>{si+1}</span>
                          {!noWeight && (
                            isEditing ?
                            <input type='number' value={s.weight||''} onChange={e=>updateSet(key,si,'weight',e.target.value)} placeholder='kg' min='0' step='0.5' style={{fontSize:13,padding:'6px 10px'}}/> :
                            <span style={{fontSize:13,color:'var(--text)'}}>{s.weight||'-'} kg</span>
                          )}
                          {isEditing ?
                            <input type='text' value={s.reps||''} onChange={e=>updateSet(key,si,'reps',e.target.value)} placeholder='powt' style={{fontSize:13,padding:'6px 10px'}}/> :
                            <span style={{fontSize:13,color:'var(--text2)'}}>{s.reps||'-'}</span>
                          }
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}