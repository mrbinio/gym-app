import { useState, useRef } from 'react'
import { Camera, ExternalLink, X, Loader } from 'lucide-react'

const RECIPES = [
  { name:'Kurczak z ryzem i brokuly', protein:52, kcal:480, time:'20 min', tag:'Klasyk', emoji:'🍗', skladniki:['150g piersi z kurczaka','80g ryzu','150g brokul','2 zabki czosnku','1 lyzka oliwy','sol i pieprz'], kroki:['Ugotuj ryz na sypko','Pokroj kurczaka w kostke, dopraw','Smaż kurczaka na oliwie 8-10 min','Brokuly gotuj na parze 5 min','Wymieszaj i podaj'] },
  { name:'Jajecznica z lososiem', protein:38, kcal:380, time:'10 min', tag:'Szybkie', emoji:'🥚', skladniki:['3 jajka','80g wedzonego lososia','szczypiorek','maslo','sol i pieprz'], kroki:['Rozmieszaj jajka z sol i pieprzem','Rozgrzej maslo na patelni','Wlej jajka i mieszaj','Dodaj lososia i szczypiorek','Zdejmij gdy jajka mokre'] },
  { name:'Twarog z bananem', protein:28, kcal:320, time:'5 min', tag:'Bez gotowania', emoji:'🧀', skladniki:['200g chudego twarogu','1 banan','miod','orzechy wloskie'], kroki:['Rozgnioc twarog widelcem','Pokroj banana','Wymieszaj z miodem','Posyp orzechami','Gotowe!'] },
  { name:'Salatka z tunczykiem', protein:35, kcal:290, time:'10 min', tag:'Bez gotowania', emoji:'🥗', skladniki:['1 puszka tunczyka','1 pomidor','1 ogorek','cebula','oliwa','sol i pieprz'], kroki:['Odcedz tunczyka','Pokroj warzywa','Wymieszaj wszystko','Polej oliwa','Dopraw do smaku'] },
  { name:'Omlet z serem i szynka', protein:42, kcal:420, time:'15 min', tag:'Sniadanie', emoji:'🍳', skladniki:['4 jajka','50g sera zoltego','60g chudej szynki','szpinak','maslo'], kroki:['Ubij jajka z sola','Rozgrzej maslo','Wlej jajka nie mieszajac','Dodaj ser szynke szpinak','Zloz na pol'] },
  { name:'Kotlety z indyka', protein:48, kcal:350, time:'25 min', tag:'Obiad', emoji:'🦃', skladniki:['200g mielonego indyka','1 jajko','bulka tarta','czosnek','przyprawy'], kroki:['Wymieszaj skladniki','Uformuj kotlety','Smaż 4-5 min z kazdej strony','Lub piecz 180 stopni 20 min','Podaj z warzywami'] },
  { name:'Shake bialkowy z owsianka', protein:40, kcal:440, time:'5 min', tag:'Sniadanie', emoji:'🥛', skladniki:['40g platki owsiane','300ml mleka','1 banan','150g jogurtu greckiego'], kroki:['Wrzuc wszystko do blendera','Blenduj 30 sekund','Gotowe!','Pij od razu po treningu'] },
  { name:'Makaron z kurczakiem i szpinakiem', protein:45, kcal:520, time:'20 min', tag:'Obiad', emoji:'🍝', skladniki:['100g makaronu','150g kurczaka','100g szpinaku','czosnek','parmezan'], kroki:['Ugotuj makaron','Pokroj kurczaka smaż 8 min','Dodaj czosnek i szpinak','Wymieszaj z makaronem','Posyp parmezanem'] },
  { name:'Jogurt grecki z orzechami', protein:22, kcal:280, time:'2 min', tag:'Przekaska', emoji:'🫙', skladniki:['200g jogurtu greckiego','orzechy wloskie','siemie lniane','miod'], kroki:['Wloz jogurt do miski','Posyp orzechami','Dodaj siemie','Polej miodem','Gotowe!'] },
  { name:'Losos z batatami', protein:44, kcal:490, time:'30 min', tag:'Obiad', emoji:'🐟', skladniki:['150g lososia','200g batatow','brokuly','oliwa','cytryna'], kroki:['Rozgrzej piekarnik 180 stopni','Piecz bataty 15 min','Dodaj lososia z cytryna','Piecz 15 min','Podaj z brokuli'] },
]

const WORKER_URL = 'https://homefresh-api.damianbiniarz.workers.dev'

const PROMPT = 'Jestes ekspertem od zywienia sportowego. Przeanalizuj zdjecie produktu spozywczego. Odpowiedz TYLKO czystym JSON bez markdown: {"name":"nazwa produktu","protein":liczba,"calories":liczba,"rating":"dobry lub sredni lub zly","emoji":"odpowiedni znak","reason":"uzasadnienie max 2 zdania po polsku"}. Zasady: dobry=bialko>15g/100g, sredni=8-15g, zly=ponizej 8g.'

export default function Diet() {
  const [tab, setTab] = useState('recipes')
  const [modal, setModal] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const b64 = ev.target.result.split(',')[1]
      setPreview(ev.target.result); setResult(null); setErr(''); setScanning(true)
      try {
        const res = await fetch(WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{ role: 'user', content: [
              { type: 'image', source: { type: 'base64', media_type: file.type, data: b64 } },
              { type: 'text', text: PROMPT }
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

  const rC = (r) => r==='dobry'?'var(--success)':r==='sredni'?'var(--accent)':'var(--danger)'
  const rB = (r) => r==='dobry'?'rgba(34,197,94,0.1)':r==='sredni'?'rgba(249,115,22,0.1)':'rgba(239,68,68,0.1)'

  return (
    <div>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:32,letterSpacing:2,marginBottom:4}}>DIETA</h1>
      <p style={{color:'var(--text3)',fontSize:13,marginBottom:20}}>Przepisy wysokobialkowe i skaner produktow</p>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        <button onClick={()=>setTab('recipes')} style={{flex:1,padding:'10px',borderRadius:'var(--radius-sm)',border:'1px solid '+(tab==='recipes'?'var(--accent)':'var(--border)'),background:tab==='recipes'?'rgba(249,115,22,0.1)':'transparent',color:tab==='recipes'?'var(--accent)':'var(--text2)',fontWeight:tab==='recipes'?600:400,fontSize:14}}>Przepisy</button>
        <button onClick={()=>setTab('scanner')} style={{flex:1,padding:'10px',borderRadius:'var(--radius-sm)',border:'1px solid '+(tab==='scanner'?'var(--accent)':'var(--border)'),background:tab==='scanner'?'rgba(249,115,22,0.1)':'transparent',color:tab==='scanner'?'var(--accent)':'var(--text2)',fontWeight:tab==='scanner'?600:400,fontSize:14}}>Skaner foto</button>
      </div>
      {tab==='recipes'&&(
        <>
          <a href='https://homefresh.damianbiniarz.com' target='_blank' rel='noreferrer' style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:'rgba(74,124,89,0.15)',border:'1px solid rgba(74,124,89,0.4)',borderRadius:'var(--radius-sm)',marginBottom:20,textDecoration:'none',color:'var(--text)'}}>
            <span style={{fontSize:24}}>🥗</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>HomeFresh</div><div style={{fontSize:12,color:'var(--text3)'}}>Twoje przepisy i planowanie posilkow</div></div>
            <ExternalLink size={16} color='var(--text3)'/>
          </a>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
            {RECIPES.map((r,i)=>(
              <button key={i} onClick={()=>setModal(r)} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'16px 12px',textAlign:'left',cursor:'pointer'}}>
                <div style={{fontSize:28,marginBottom:8}}>{r.emoji}</div>
                <div style={{fontSize:13,fontWeight:600,marginBottom:6,lineHeight:1.3}}>{r.name}</div>
                <div style={{fontSize:12,color:'var(--success)',fontWeight:600}}>💪 {r.protein}g bialka</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>🔥 {r.kcal} · ⏱ {r.time}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {tab==='scanner'&&(
        <div>
          <div className='card' style={{marginBottom:16,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:8}}>📸</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Skaner produktow</div>
            <div style={{fontSize:13,color:'var(--text3)',marginBottom:16}}>Zrob zdjecie etykiety – AI oceni czy warto jesc</div>
            <input ref={fileRef} type='file' accept='image/*' capture='environment' onChange={handlePhoto} style={{display:'none'}}/>
            <button onClick={()=>{fileRef.current.value='';fileRef.current.click()}} className='btn-primary'><span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Camera size={18}/> Zrob zdjecie / Galeria</span></button>
          </div>
          {preview&&<div className='card' style={{marginBottom:16,padding:12}}><img src={preview} alt='skan' style={{width:'100%',maxHeight:240,objectFit:'contain',borderRadius:8}}/></div>}
          {scanning&&<div className='card' style={{textAlign:'center',padding:'30px'}}><Loader size={32} color='var(--accent)' style={{animation:'spin 1s linear infinite',marginBottom:12}}/><div>Analizuje...</div><style>{'@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style></div>}
          {err&&<div className='card' style={{color:'var(--danger)',padding:16,textAlign:'center'}}>{err}</div>}
          {result&&!scanning&&(
            <div className='card' style={{border:'2px solid '+rC(result.rating),background:rB(result.rating)}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}><span style={{fontSize:48}}>{result.emoji}</span><div><div style={{fontSize:18,fontWeight:700}}>{result.name}</div><div style={{fontSize:13,color:rC(result.rating),fontWeight:700,textTransform:'uppercase'}}>{result.rating}</div></div></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                <div style={{background:'var(--bg2)',borderRadius:'var(--radius-sm)',padding:'12px',textAlign:'center'}}><div style={{fontSize:26,fontWeight:700,color:'var(--success)'}}>{result.protein}g</div><div style={{fontSize:11,color:'var(--text3)'}}>Bialko/100g</div></div>
                <div style={{background:'var(--bg2)',borderRadius:'var(--radius-sm)',padding:'12px',textAlign:'center'}}><div style={{fontSize:26,fontWeight:700,color:'var(--accent)'}}>{result.calories}</div><div style={{fontSize:11,color:'var(--text3)'}}>Kcal/100g</div></div>
              </div>
              <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6,padding:'10px 14px',background:'var(--bg2)',borderRadius:'var(--radius-sm)'}}>{result.reason}</div>
            </div>
          )}
        </div>
      )}
      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'flex-end'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'var(--bg)',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:600,margin:'0 auto',maxHeight:'85vh',overflowY:'auto',padding:'24px 20px 40px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:36}}>{modal.emoji}</span><div><div style={{fontSize:18,fontWeight:700}}>{modal.name}</div><div style={{fontSize:12,color:'var(--text3)'}}>⏱ {modal.time}</div></div></div>
              <button onClick={()=>setModal(null)} style={{background:'var(--bg2)',border:'none',borderRadius:'50%',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)'}}><X size={18}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
              <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'var(--radius-sm)',padding:'12px',textAlign:'center'}}><div style={{fontSize:28,fontWeight:700,color:'var(--success)'}}>{modal.protein}g</div><div style={{fontSize:11,color:'var(--text3)'}}>Bialko</div></div>
              <div style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'var(--radius-sm)',padding:'12px',textAlign:'center'}}><div style={{fontSize:28,fontWeight:700,color:'var(--accent)'}}>{modal.kcal}</div><div style={{fontSize:11,color:'var(--text3)'}}>Kcal</div></div>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Skladniki</div>
              {modal.skladniki.map((s,i)=>(<div key={i} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--accent)'}}>•</span><span style={{fontSize:14,color:'var(--text2)'}}>{s}</span></div>))}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Przygotowanie</div>
              {modal.kroki.map((k,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}><span style={{width:24,height:24,borderRadius:'50%',background:'var(--accent)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</span><span style={{fontSize:14,color:'var(--text2)',lineHeight:1.5,paddingTop:2}}>{k}</span></div>))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}