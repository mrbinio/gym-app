import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { DEFAULT_EXERCISES, DAYS } from '../data/exercises'
import { Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react'

export default function Exercises({ user }) {
  const [custom, setCustom] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({name:'',group:'',day:'A',desc:'',sets:3,reps:'10'})
  const [saving, setSaving] = useState(false)
  const [filterDay, setFilterDay] = useState('all')
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db,'custom_exercises'),where('uid','==',user.uid))
        setCustom((await getDocs(q)).docs.map(d=>({id:d.id,...d.data()})))
      } catch(e) { console.error(e) }
    }
    load()
  }, [user.uid])

  const saveEx = async () => {
    if (!form.name.trim()||!form.group.trim()) return
    setSaving(true)
    try {
      const ref = await addDoc(collection(db,'custom_exercises'),{...form,uid:user.uid})
      setCustom(c=>[...c,{id:ref.id,...form,uid:user.uid}])
      setForm({name:'',group:'',day:'A',desc:'',sets:3,reps:'10'}); setShowForm(false)
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  const deleteEx = async (id) => {
    try { await deleteDoc(doc(db,'custom_exercises',id)); setCustom(c=>c.filter(e=>e.id!==id)) } catch(e) { console.error(e) }
  }

  const all = [...DEFAULT_EXERCISES.map(e=>({...e,isDefault:true})), ...custom.map(e=>({...e,isDefault:false}))]
  const filtered = filterDay==='all' ? all : all.filter(e=>e.day===filterDay)
  const groups = {}
  filtered.forEach(e=>{if(!groups[e.group])groups[e.group]=[];groups[e.group].push(e)})

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:32,letterSpacing:2}}>CWICZENIA</h1>
        <button onClick={()=>setShowForm(s=>!s)} className='btn-primary' style={{width:'auto',display:'flex',alignItems:'center',gap:6}}>
          {showForm?<X size={14}/>:<Plus size={14}/>} {showForm?'Anuluj':'Dodaj'}
        </button>
      </div>
      <p style={{color:'var(--text3)',fontSize:13,marginBottom:24}}>Baza cwiczen i opisy techniczne</p>
      {showForm && (
        <div className='card' style={{marginBottom:20,border:'1px solid var(--accent)44'}}>
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:16,color:'var(--accent)'}}>Nowe cwiczenie</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={{fontSize:12,color:'var(--text2)',marginBottom:6,display:'block'}}>Nazwa *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder='np. Wyciskanie sztangi'/></div>
              <div><label style={{fontSize:12,color:'var(--text2)',marginBottom:6,display:'block'}}>Grupa miesniowa *</label><input value={form.group} onChange={e=>setForm(f=>({...f,group:e.target.value}))} placeholder='np. Klatka'/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div><label style={{fontSize:12,color:'var(--text2)',marginBottom:6,display:'block'}}>Dzien</label>
                <select value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))}>
                  {Object.entries(DAYS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div><label style={{fontSize:12,color:'var(--text2)',marginBottom:6,display:'block'}}>Serie</label><input type='number' value={form.sets} onChange={e=>setForm(f=>({...f,sets:parseInt(e.target.value)||3}))} min='1' max='10'/></div>
              <div><label style={{fontSize:12,color:'var(--text2)',marginBottom:6,display:'block'}}>Powt.</label><input value={form.reps} onChange={e=>setForm(f=>({...f,reps:e.target.value}))} placeholder='np. 10-12'/></div>
            </div>
            <div><label style={{fontSize:12,color:'var(--text2)',marginBottom:6,display:'block'}}>Opis / technika</label><textarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder='Opisz jak wykonac cwiczenie...' rows={3} style={{resize:'vertical'}}/></div>
            <button onClick={saveEx} disabled={saving||!form.name.trim()||!form.group.trim()} className='btn-primary'>{saving?'Zapisywanie...':'Zapisz cwiczenie'}</button>
          </div>
        </div>
      )}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        <button onClick={()=>setFilterDay('all')} style={{padding:'6px 16px',borderRadius:20,border:'1px solid '+(filterDay==='all'?'var(--accent)':'var(--border)'),background:filterDay==='all'?'rgba(249,115,22,0.1)':'transparent',color:filterDay==='all'?'var(--accent)':'var(--text2)',fontSize:13}}>Wszystkie</button>
        {Object.entries(DAYS).map(([key,{label,color}])=>(
          <button key={key} onClick={()=>setFilterDay(key)} style={{padding:'6px 16px',borderRadius:20,border:'1px solid '+(filterDay===key?color:'var(--border)'),background:filterDay===key?color+'22':'transparent',color:filterDay===key?color:'var(--text2)',fontSize:13}}>{label}</button>
        ))}
      </div>
      {Object.entries(groups).map(([group,exs])=>(
        <div key={group} style={{marginBottom:20}}>
          <div style={{fontSize:12,color:'var(--text3)',textTransform:'uppercase',letterSpacing:1,marginBottom:8,fontWeight:600}}>{group}</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {exs.map(ex=>(
              <div key={ex.id} className='card' style={{padding:0,overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',cursor:'pointer'}} onClick={()=>setExpanded(e=>({...e,[ex.id]:!e[ex.id]}))}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500}}>{ex.name}</div>
                    <div style={{display:'flex',gap:6,marginTop:3,alignItems:'center'}}>
                      <span className='tag'>{DAYS[ex.day]?.label}</span>
                      {ex.sets&&<span style={{fontSize:12,color:'var(--accent)',fontWeight:600}}>{ex.sets}x{ex.reps}</span>}
                      {!ex.isDefault&&<span style={{fontSize:11,color:'var(--accent)'}}>wlasne</span>}
                    </div>
                  </div>
                  {!ex.isDefault&&<button onClick={e=>{e.stopPropagation();deleteEx(ex.id)}} style={{background:'none',color:'var(--text3)',padding:6}}><Trash2 size={14}/></button>}
                  {expanded[ex.id]?<ChevronUp size={16} color='var(--text3)'/>:<ChevronDown size={16} color='var(--text3)'/>}
                </div>
                {expanded[ex.id]&&ex.desc&&<div style={{padding:'10px 16px 14px',borderTop:'1px solid var(--border)',fontSize:13,color:'var(--text2)',lineHeight:1.6,background:'var(--bg3)'}}>{ex.desc}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{textAlign:'center',padding:'12px 0',fontSize:12,color:'var(--text3)'}}>{filtered.length} cwiczen ({custom.length} wlasnych)</div>
    </div>
  )
}