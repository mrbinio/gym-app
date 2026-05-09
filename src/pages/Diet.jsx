import { useState, useRef } from 'react'
import { Camera, ExternalLink, ChevronDown, ChevronUp, Loader } from 'lucide-react'

const RECIPES = [
  { name:'Kurczak z ryzem i brokuly', protein:52, kcal:480, time:'20 min', tag:'Klasyk', desc:'150g piersi z kurczaka, 80g ryzu, 150g brokul, oliwa, czosnek. Gotuj ryz, smaż kurczaka, podgotuj brokuly.' },
  { name:'Jajecznica z lososiem', protein:38, kcal:380, time:'10 min', tag:'Szybkie', desc:'3 jajka, 80g wedzony losos, szczypiorek, maslo. Usmaż razem, dodaj lososia na koncu.' },
  { name:'Twarog z bananem', protein:28, kcal:320, time:'5 min', tag:'Bez gotowania', desc:'200g chudego twarogu, 1 banan, miod, orzechy. Wymieszaj i gotowe.' },
  { name:'Salatka z tunczykiem', protein:35, kcal:290, time:'10 min', tag:'Bez gotowania', desc:'1 puszka tunczyka w wodzie, pomidor, ogorek, cebula, oliwa, sol.' },
  { name:'Omlet z serem i szynka', protein:42, kcal:420, time:'15 min', tag:'Sniadanie', desc:'4 jajka, 50g sera zoltego, 60g chudej szynki, szpinak. Usmaż omlet, dodaj nadzienie.' },
  { name:'Kotlety z indyka', protein:48, kcal:350, time:'25 min', tag:'Obiad', desc:'200g mielonego indyka, jajko, bula, czosnek, pieprz. Uformuj kotlety, usmaż lub upiecz w piekarniku.' },
  { name:'Shake bialkowy z owsianka', protein:40, kcal:440, time:'5 min', tag:'Sniadanie', desc:'40g platki owsiane, 300ml mleka, 1 banan, 2 lyzki jogurtu greckiego.' },
  { name:'Makaron z kurczakiem i szpinakiem', protein:45, kcal:520, time:'20 min', tag:'Obiad', desc:'100g makaronu, 150g kurczaka, 100g szpinaku, czosnek, oliwa, parmezan.' },
  { name:'Jogurt grecki z orzechami', protein:22, kcal:280, time:'2 min', tag:'Przekaska', desc:'200g jogurtu greckiego 2%, garsc orzechow, siemie lniane, opcjonalnie miod.' },
  { name:'Losos z batatami', protein:44, kcal:490, time:'30 min', tag:'Obiad', desc:'150g fileta z lososia, 200g batatow, brokuly, oliwa, cytryna. Piecz 20 min w 180 stopniach.' },
]

const PROMPT = 'Jestes ekspertem od zywienia sportowego. Przeanalizuj zdjecie produktu spozywczego. Odpowiedz TYLKO czystym JSON bez markdown, bez tekstu przed ani po: {"name":"nazwa produktu","protein":liczba,"calories":liczba,"rating":"dobry lub sredni lub zly","emoji":"✅ lub ⚠️ lub ❌","reason":"uzasadnienie max 2 zdania po polsku"}. Zasady: dobry=bialko>15g/100g, sredni=8-15g, zly=ponizej 8g.'

export default function Diet() {
  const [tab, setTab] = useState('recipes')
  const [exp, setExp] = useState({})
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
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:500,
            messages:[{role:'user',content:[
              {type:'image',source:{type:'base64',media_type:file.type,data:b64}},
              {type:'text',text:PROMPT}
            ]}]
          })
        })
        const data = await res.json()
        const text = (data.content?.[0]?.text||'').replace(/```json|```/g,'').trim()
        setResult(JSON.parse(text))
      } catch(e) { setErr('Blad analizy – sprobuj ponownie') }
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
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>HomeFresh – Twoje przepisy</div><div style={{fontSize:12,color:'var(--text3)'}}>Planuj obiady i znajdz co w lodowce</div></div>
            <ExternalLink size={16} color='var(--text3)'/>
          </a>
          <div style={{fontSize:12,color:'var(--text3)',marginBottom:12,textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Top przepisy dla kulturysty</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {RECIPES.map((r,i)=>(
              <div key={i} className='card' style={{padding:0,overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>setExp(e=>({...e,[i]:!e[i]}))}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}><span style={{fontSize:14,fontWeight:600}}>{r.name}</span><span style={{fontSize:11,padding:'2px 8px',borderRadius:10,background:'rgba(249,115,22,0.15)',color:'var(--accent)',fontWeight:600}}>{r.tag}</span></div>
                    <div style={{display:'flex',gap:12,fontSize:12,flexWrap:'wrap'}}><span style={{color:'var(--success)',fontWeight:600}}>💪 {r.protein}g bialka</span><span style={{color:'var(--text3)'}}>🔥 {r.kcal} kcal</span><span style={{color:'var(--text3)'}}>⏱ {r.time}</span></div>
                  </div>
                  {exp[i]?<ChevronUp size={16} color='var(--text3)'/>:<ChevronDown size={16} color='var(--text3)'/>}
                </div>
                {exp[i]&&<div style={{padding:'12px 16px 16px',borderTop:'1px solid var(--border)',background:'var(--bg3)',fontSize:13,color:'var(--text2)',lineHeight:1.7}}>{r.desc}</div>}
              </div>
            ))}
          </div>
        </>
      )}
      {tab==='scanner'&&(
        <div>
          <div className='card' style={{marginBottom:16,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:8}}>📸</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Skaner produktow</div>
            <div style={{fontSize:13,color:'var(--text3)',marginBottom:16}}>Zrob zdjecie etykiety – AI oceni czy warto jesc dla budowy miesni</div>
            <input ref={fileRef} type='file' accept='image/*' capture='environment' onChange={handlePhoto} style={{display:'none'}}/>
            <button onClick={()=>{fileRef.current.value='';fileRef.current.click()}} className='btn-primary'><span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Camera size={18}/> Zrob zdjecie / Galeria</span></button>
          </div>
          {preview&&<div className='card' style={{marginBottom:16,padding:12}}><img src={preview} alt='skan' style={{width:'100%',maxHeight:240,objectFit:'contain',borderRadius:8}}/></div>}
          {scanning&&<div className='card' style={{textAlign:'center',padding:'30px 20px'}}><Loader size={32} color='var(--accent)' style={{animation:'spin 1s linear infinite',marginBottom:12}}/><div style={{color:'var(--text2)',fontSize:14}}>Analizuje produkt...</div><style>{'@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style></div>}
          {err&&<div className='card' style={{textAlign:'center',padding:'16px',color:'var(--danger)',border:'1px solid var(--danger)44'}}>{err}</div>}
          {result&&!scanning&&(
            <div className='card' style={{border:'2px solid '+rC(result.rating),background:rB(result.rating)}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}><span style={{fontSize:48}}>{result.emoji}</span><div><div style={{fontSize:18,fontWeight:700}}>{result.name}</div><div style={{fontSize:13,color:rC(result.rating),fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>{result.rating}</div></div></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                <div style={{background:'var(--bg2)',borderRadius:'var(--radius-sm)',padding:'12px',textAlign:'center'}}><div style={{fontSize:26,fontWeight:700,color:'var(--success)',fontFamily:'var(--font-display)'}}>{result.protein}g</div><div style={{fontSize:11,color:'var(--text3)'}}>Bialko / 100g</div></div>
                <div style={{background:'var(--bg2)',borderRadius:'var(--radius-sm)',padding:'12px',textAlign:'center'}}><div style={{fontSize:26,fontWeight:700,color:'var(--accent)',fontFamily:'var(--font-display)'}}>{result.calories}</div><div style={{fontSize:11,color:'var(--text3)'}}>Kcal / 100g</div></div>
              </div>
              <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6,padding:'10px 14px',background:'var(--bg2)',borderRadius:'var(--radius-sm)'}}>{result.reason}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}