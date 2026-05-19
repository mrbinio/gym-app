import { useState, useRef, useEffect } from 'react'
import { Camera, ExternalLink, X, Loader, Dumbbell } from 'lucide-react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

const HEIGHT_CM = 176
const WORKER_URL = 'https://homefresh-api.damianbiniarz.workers.dev'

const RECIPES = [
  { name:'Kurczak z ryzem i brokuly', protein:52, kcal:480, time:'20 min', tag:'Klasyk', emoji:'🍗', skladniki:['150g piersi z kurczaka','80g ryzu','150g brokul','2 zabki czosnku','oliwa','sol i pieprz'], kroki:['Ugotuj ryz','Smaż kurczaka 8-10 min','Brokuly na parze 5 min','Wymieszaj i podaj'] },
  { name:'Jajecznica z lososiem', protein:38, kcal:380, time:'10 min', tag:'Szybkie', emoji:'🥚', skladniki:['3 jajka','80g wedzony losos','szczypiorek','maslo'], kroki:['Rozmieszaj jajka','Smaż na masle','Dodaj lososia na koncu'] },
  { name:'Twarog z bananem', protein:28, kcal:320, time:'5 min', tag:'Bez gotowania', emoji:'🧀', skladniki:['200g chudego twarogu','1 banan','miod','orzechy'], kroki:['Rozgnioc twarog','Dodaj banana i miod','Posyp orzechami'] },
  { name:'Salatka z tunczykiem', protein:35, kcal:290, time:'10 min', tag:'Bez gotowania', emoji:'🥗', skladniki:['1 puszka tunczyka','pomidor','ogorek','cebula','oliwa'], kroki:['Pokroj warzywa','Dodaj tunczyka','Polej oliwa'] },
  { name:'Omlet z serem i szynka', protein:42, kcal:420, time:'15 min', tag:'Sniadanie', emoji:'🍳', skladniki:['4 jajka','50g ser zolty','60g chuda szynka','szpinak'], kroki:['Ubij jajka','Smaż omleta','Dodaj nadzienie i zloz'] },
  { name:'Kotlety z indyka', protein:48, kcal:350, time:'25 min', tag:'Obiad', emoji:'🦃', skladniki:['200g mielony indyk','jajko','bulka tarta','czosnek'], kroki:['Wymieszaj skladniki','Uformuj kotlety','Smaż po 5 min z kazdej strony'] },
  { name:'Shake bialkowy z owsianka', protein:40, kcal:440, time:'5 min', tag:'Sniadanie', emoji:'🥛', skladniki:['40g platki owsiane','300ml mleka','1 banan','jogurt grecki'], kroki:['Wrzuc wszystko do blendera','Blenduj 30 sekund','Gotowe!'] },
  { name:'Makaron z kurczakiem i szpinakiem', protein:45, kcal:520, time:'20 min', tag:'Obiad', emoji:'🍝', skladniki:['100g makaron','150g kurczak','100g szpinak','czosnek','parmezan'], kroki:['Ugotuj makaron','Smaż kurczaka z czosnkiem','Dodaj szpinak i makaron'] },
  { name:'Jogurt grecki z orzechami', protein:22, kcal:280, time:'2 min', tag:'Przekaska', emoji:'🫙', skladniki:['200g jogurt grecki','orzechy wloskie','siemie lniane','miod'], kroki:['Wloz jogurt do miski','Posyp orzechami','Polej miodem'] },
  { name:'Losos z batatami', protein:44, kcal:490, time:'30 min', tag:'Obiad', emoji:'🐟', skladniki:['150g losos','200g bataty','brokuly','oliwa','cytryna'], kroki:['Piecz bataty 15 min w 180 st','Dodaj lososia','Piecz jeszcze 15 min'] },
]

const POST_WORKOUT_PROMPT = (day, weight, goal) => `Jestes dietetykiem sportowym. Uzytkownik wazy ${weight}kg (wzrost 176cm, cel: ${goal}kg) i wlasnie wykonal trening Dzien ${day}. Zaproponuj 3 posilki po treningu po polsku i po angielsku. Format JSON: {"pl":[{"name":"nazwa","protein":liczba,"kcal":liczba,"time":"czas","desc":"krotki opis"}],"en":[{"name":"name","protein":number,"kcal":number,"time":"time","desc":"short desc"}]}. Odpowiedz TYLKO czystym JSON bez markdown.`

const SCAN_PROMPT = (weight, goal) => `Jestes ekspertem od zywienia sportowego. Uzytkownik wazy ${weight}kg, cel: ${goal}kg. Przeanalizuj zdjecie produktu spozywczego. Format JSON: {"name":"nazwa","protein":liczba,"calories":liczba,"rating":"dobry lub sredni lub zly","emoji":"znak","reason":"2 zdania po polsku","portion":"rekomendowana porcja dla tego uzytkownika","en_reason":"2 sentences in English"}. TYLKO czysty JSON.`

export default function Diet({ user }) {
  const [tab, setTab] = useState('recipes')
  const [modal, setModal] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')
  const [preview, setPreview] = useState(null)
  const [postWorkout, setPostWorkout] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [selectedDay, setSelectedDay] = useState('A')
  const [lang, setLang] = useState('pl')
  const [userWeight, setUserWeight] = useState(null)
  const [weightGoal, setWeightGoal] = useState('82')
  const fileRef = useRef()

  useEffect(() => {
    const goal = localStorage.getItem('weight_goal') || '82'
    setWeightGoal(goal)
    if (!user) return
    const load = async () => {
      try {
        const q = query(collection(db,'weight_entries'), where('uid','==',user.uid), orderBy('date','desc'), limit(1))
        const snap = await getDocs(q)
        if (!snap.empty) setUserWeight(snap.docs[0].data().weight)
      } catch(e) { console.error(e) }
    }
    load()
  }, [user])

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const b64 = ev.target.result.split(',')[1]
      setPreview(ev.target.result); setResult(null); setErr(''); setScanning(true)
      try {
        const res = await fetch(WORKER_URL, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:600,
            messages:[{role:'user',content:[
              {type:'image',source:{type:'base64',media_type:file.type,data:b64}},
              {type:'text',text:SCAN_PROMPT(userWeight||90, weightGoal)}
            ]}]
          })
        })
        const data = await res.json()
        const text = (data.content?.[0]?.text||'').replace(/```json|```/g,'').trim()
        setResult(JSON.parse(text))
      } catch(e) { setErr('Blad analizy: ' + e.message) }
      setScanning(false)
    }
    reader.readAsDataURL(file)
  }

  const generatePlan = async () => {
    setLoadingPlan(true); setPostWorkout(null)
    try {
      const res = await fetch(WORKER_URL, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:800,
          messages:[{role:'user',content:POST_WORKOUT_PROMPT(selectedDay, userWeight||90, weightGoal)}]
        })
      })
      const data = await res.json()
      const text = (data.content?.[0]?.text||'').replace(/```json|```/g,'').trim()
      setPostWorkout(JSON.parse(text))
    } catch(e) { setErr('Blad generowania planu') }
    setLoadingPlan(false)
  }

  const rC = (r) => r==='dobry'||r==='good'?'var(--success)':r==='sredni'||r==='average'?'var(--accent)':'var(--danger)'
  const rB = (r) => r==='dobry'||r==='good'?'rgba(34,197,94,0.1)':r==='sredni'||r==='average'?'rgba(249,115,22,0.1)':'rgba(239,68,68,0.1)'

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:32,letterSpacing:2}}>DIETA</h1>
        <div style={{display:'flex',gap:6}}>
          <button onClick={()=>setLang('pl')} style={{padding:'4px 12px',borderRadius:20,border:'1px solid '+(lang==='pl'?'var(--accent)':'var(--border)'),background:lang==='pl'?'rgba(249,115,22,0.1)':'transparent',color:lang==='pl'?'var(--accent)':'var(--text3)',fontSize:12,fontWeight:lang==='pl'?600:400}}>PL</button>
          <button onClick={()=>setLang('en')} style={{padding:'4px 12px',borderRadius:20,border:'1px solid '+(lang==='en'?'var(--accent)':'var(--border)'),background:lang==='en'?'rgba(249,115,22,0.1)':'transparent',color:lang==='en'?'var(--accent)':'var(--text3)',fontSize:12,fontWeight:lang==='en'?600:400}}>EN</button>
        </div>
      </div>
      {userWeight&&<p style={{color:'var(--text3)',fontSize:13,marginBottom:16}}>Twoja waga: <strong style={{color:'var(--accent)'}}>{userWeight} kg</strong> · Cel: <strong style={{color:'var(--success)'}}>{weightGoal} kg</strong></p>}

      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        {[['recipes','🍗 Przepisy'],['scanner','📸 Skaner'],['plan','💪 Plan po treningu']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,minWidth:100,padding:'10px 8px',borderRadius:'var(--radius-sm)',border:'1px solid '+(tab===id?'var(--accent)':'var(--border)'),background:tab===id?'rgba(249,115,22,0.1)':'transparent',color:tab===id?'var(--accent)':'var(--text2)',fontWeight:tab===id?600:400,fontSize:13}}>{label}</button>
        ))}
      </div>

      {tab==='recipes'&&(
        <>
          <a href='https://homefresh.damianbiniarz.com' target='_blank' rel='noreferrer' style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:'rgba(74,124,89,0.15)',border:'1px solid rgba(74,124,89,0.4)',borderRadius:'var(--radius-sm)',marginBottom:20,textDecoration:'none',color:'var(--text)'}}>
            <span style={{fontSize:24}}>🥗</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>HomeFresh</div><div style={{fontSize:12,color:'var(--text3)'}}>Twoje przepisy i planowanie posilkow</div></div>
            <ExternalLink size={16} color='var(--text3)'/>
          </a>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10}}>
            {RECIPES.map((r,i)=>(
              <button key={i} onClick={()=>setModal(r)} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'14px 12px',textAlign:'left',cursor:'pointer'}}>
                <div style={{fontSize:26,marginBottom:6}}>{r.emoji}</div>
                <div style={{fontSize:12,fontWeight:600,marginBottom:4,lineHeight:1.3}}>{r.name}</div>
                <div style={{fontSize:11,color:'var(--success)',fontWeight:600}}>💪 {r.protein}g</div>
                <div style={{fontSize:10,color:'var(--text3)'}}>🔥 {r.kcal} · ⏱ {r.time}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {tab==='scanner'&&(
        <div>
          <div className='card' style={{marginBottom:16,textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:8}}>📸</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{lang==='pl'?'Skaner produktow':'Product Scanner'}</div>
            <div style={{fontSize:13,color:'var(--text3)',marginBottom:12}}>{lang==='pl'?'AI oceni produkt na podstawie Twojej wagi i celu':'AI evaluates the product based on your weight and goal'}</div>
            {userWeight&&<div style={{fontSize:12,color:'var(--accent)',marginBottom:12}}>Profil: {userWeight}kg → cel {weightGoal}kg</div>}
            <input ref={fileRef} type='file' accept='image/*' capture='environment' onChange={handlePhoto} style={{display:'none'}}/>
            <button onClick={()=>{fileRef.current.value='';fileRef.current.click()}} className='btn-primary'>
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Camera size={18}/> {lang==='pl'?'Zrob zdjecie':'Take photo'}</span>
            </button>
          </div>
          {preview&&<div className='card' style={{marginBottom:16,padding:12}}><img src={preview} alt='skan' style={{width:'100%',maxHeight:220,objectFit:'contain',borderRadius:8}}/></div>}
          {scanning&&<div className='card' style={{textAlign:'center',padding:'30px'}}><Loader size={32} color='var(--accent)' style={{animation:'spin 1s linear infinite',marginBottom:12}}/><div>{lang==='pl'?'Analizuje produkt...':'Analyzing product...'}</div><style>{'@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style></div>}
          {err&&<div className='card' style={{color:'var(--danger)',padding:16,textAlign:'center'}}>{err}</div>}
          {result&&!scanning&&(
            <div className='card' style={{border:'2px solid '+rC(result.rating),background:rB(result.rating)}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <span style={{fontSize:44}}>{result.emoji}</span>
                <div>
                  <div style={{fontSize:18,fontWeight:700}}>{result.name}</div>
                  <div style={{fontSize:13,color:rC(result.rating),fontWeight:700,textTransform:'uppercase'}}>{result.rating}</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                <div style={{background:'var(--bg2)',borderRadius:'var(--radius-sm)',padding:'10px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:700,color:'var(--success)'}}>{result.protein}g</div><div style={{fontSize:10,color:'var(--text3)'}}>{lang==='pl'?'Bialko/100g':'Protein/100g'}</div></div>
                <div style={{background:'var(--bg2)',borderRadius:'var(--radius-sm)',padding:'10px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:700,color:'var(--accent)'}}>{result.calories}</div><div style={{fontSize:10,color:'var(--text3)'}}>{lang==='pl'?'Kcal/100g':'Kcal/100g'}</div></div>
              </div>
              {result.portion&&<div style={{fontSize:13,color:'var(--accent)',fontWeight:600,marginBottom:8,padding:'8px 12px',background:'var(--bg2)',borderRadius:'var(--radius-sm)'}}>💡 {lang==='pl'?'Porcja dla Ciebie':'Your portion'}: {result.portion}</div>}
              <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6,padding:'10px 12px',background:'var(--bg2)',borderRadius:'var(--radius-sm)'}}>{lang==='pl'?result.reason:result.en_reason}</div>
            </div>
          )}
        </div>
      )}

      {tab==='plan'&&(
        <div>
          <div className='card' style={{marginBottom:16}}>
            <div style={{fontSize:15,fontWeight:600,marginBottom:4,display:'flex',alignItems:'center',gap:8}}><Dumbbell size={16} color='var(--accent)'/> {lang==='pl'?'Plan zywieniowy po treningu':'Post-workout nutrition plan'}</div>
            <div style={{fontSize:13,color:'var(--text3)',marginBottom:16}}>{lang==='pl'?'Wybierz dzien treningu – AI dobierze co zjesc':'Select training day – AI will suggest what to eat'}</div>
            <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
              {['A','B','C','D'].map(d=>(
                <button key={d} onClick={()=>setSelectedDay(d)} style={{flex:1,padding:'8px',borderRadius:'var(--radius-sm)',border:'1px solid '+(selectedDay===d?'var(--accent)':'var(--border)'),background:selectedDay===d?'rgba(249,115,22,0.1)':'transparent',color:selectedDay===d?'var(--accent)':'var(--text2)',fontWeight:selectedDay===d?600:400}}>{lang==='pl'?'Dzien':'Day'} {d}</button>
              ))}
            </div>
            <button onClick={generatePlan} disabled={loadingPlan} className='btn-primary'>
              {loadingPlan?<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Loader size={16} style={{animation:'spin 1s linear infinite'}}/>{lang==='pl'?'Generuje...':'Generating...'}</span>:(lang==='pl'?'Generuj plan po treningu':'Generate post-workout plan')}
            </button>
          </div>
          {postWorkout&&(
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {(postWorkout[lang]||postWorkout.pl||[]).map((meal,i)=>(
                <div key={i} className='card' style={{border:'1px solid var(--accent)33'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <span style={{width:28,height:28,borderRadius:'50%',background:'var(--accent)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0}}>{i+1}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600}}>{meal.name}</div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>⏱ {meal.time}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:10,marginBottom:8}}>
                    <span style={{fontSize:12,color:'var(--success)',fontWeight:600}}>💪 {meal.protein}g {lang==='pl'?'bialka':'protein'}</span>
                    <span style={{fontSize:12,color:'var(--text3)'}}>🔥 {meal.kcal} kcal</span>
                  </div>
                  <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.5}}>{meal.desc}</div>
                </div>
              ))}
              <style>{'@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style>
            </div>
          )}
        </div>
      )}

      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'flex-end'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'var(--bg)',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:600,margin:'0 auto',maxHeight:'85vh',overflowY:'auto',padding:'24px 20px 40px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:32}}>{modal.emoji}</span><div><div style={{fontSize:16,fontWeight:700}}>{modal.name}</div><div style={{fontSize:11,color:'var(--text3)'}}>⏱ {modal.time} · {modal.tag}</div></div></div>
              <button onClick={()=>setModal(null)} style={{background:'var(--bg2)',border:'none',borderRadius:'50%',width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)'}}><X size={16}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'var(--radius-sm)',padding:'10px',textAlign:'center'}}><div style={{fontSize:24,fontWeight:700,color:'var(--success)'}}>{modal.protein}g</div><div style={{fontSize:10,color:'var(--text3)'}}>Bialko</div></div>
              <div style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'var(--radius-sm)',padding:'10px',textAlign:'center'}}><div style={{fontSize:24,fontWeight:700,color:'var(--accent)'}}>{modal.kcal}</div><div style={{fontSize:10,color:'var(--text3)'}}>Kcal</div></div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Skladniki</div>
              {modal.skladniki.map((s,i)=>(<div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--accent)'}}>•</span><span style={{fontSize:13,color:'var(--text2)'}}>{s}</span></div>))}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Przygotowanie</div>
              {modal.kroki.map((k,i)=>(<div key={i} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}><span style={{width:22,height:22,borderRadius:'50%',background:'var(--accent)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</span><span style={{fontSize:13,color:'var(--text2)',lineHeight:1.5,paddingTop:2}}>{k}</span></div>))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}