import { useState, useRef } from 'react'
import { Camera, ExternalLink, X, Loader } from 'lucide-react'

const RECIPES = [
  { name:'Kurczak z ryzem i brokuly', protein:52, kcal:480, time:'20 min', tag:'Klasyk', emoji:'ÃÂ°ÃÂÃÂÃÂ',
    skladniki:['150g piersi z kurczaka','80g ryzu','150g brokul','2 zabki czosnku','1 lyzka oliwy','sol i pieprz'],
    kroki:['Ugotuj ryz na sypko (ok. 15 min)','Pokroj kurczaka w kostkÃÂÃÂ, dopraw sola i pieprzem','SmaÃÂÃÂ¼ kurczaka na oliwie z czosnkiem 8-10 min','Brokuly gotuj na parze 5 min','Wymieszaj i podaj'] },
  { name:'Jajecznica z lososiem', protein:38, kcal:380, time:'10 min', tag:'Szybkie', emoji:'ÃÂ°ÃÂÃÂ¥ÃÂ',
    skladniki:['3 jajka','80g wedzonego lososia','szczypiorek','1 lyzeczka masla','sol i pieprz'],
    kroki:['Rozmieszaj jajka z sol i pieprzem','Rozgrzej maslo na patelni','Wlej jajka i mieszaj na malym ogniu','Na koniec dodaj lososia i szczypiorek','Zdejmij z ognia gdy jajka jeszcze troche mokre'] },
  { name:'Twarog z bananem', protein:28, kcal:320, time:'5 min', tag:'Bez gotowania', emoji:'ÃÂ°ÃÂÃÂ§ÃÂ',
    skladniki:['200g chudego twarogu','1 banan','1 lyzka miodu','garsc orzechow wloskich','opcjonalnie: cynamon'],
    kroki:['Rozgnioc twarog widelcem','Pokroj banana w plastry','Wymieszaj twarog z bananem i miodem','Posyp orzechami i cynamonem','Gotowe ÃÂ¢ÃÂÃÂ jesc od razu'] },
  { name:'Salatka z tunczykiem', protein:35, kcal:290, time:'10 min', tag:'Bez gotowania', emoji:'ÃÂ°ÃÂÃÂ¥ÃÂ',
    skladniki:['1 puszka tunczyka w wodzie (170g)','1 pomidor','1 ogorek','pol cebuli','1 lyzka oliwy','sol i pieprz'],
    kroki:['Odcedz tunczyka','Pokroj pomidora, ogurka i cebule w kostke','Wymieszaj wszystko razem','Polej oliwa, dopraw sol i pieprzem','Mozna dodac lyzke jogurtu greckiego'] },
  { name:'Omlet z serem i szynka', protein:42, kcal:420, time:'15 min', tag:'Sniadanie', emoji:'ÃÂ°ÃÂÃÂÃÂ³',
    skladniki:['4 jajka','50g sera zoltego','60g chudej szynki','garsc szpinaku','1 lyzeczka masla','sol i pieprz'],
    kroki:['Ubij jajka z sola i pieprzem','Rozgrzej maslo na patelni','Wlej jajka ÃÂ¢ÃÂÃÂ nie mieszaj!','Gdy spod jest ÃÂÃÂciety (2-3 min) dodaj ser, szynke i szpinak','Zloz omlet na pol i usmaÃÂÃÂ¼ jeszcze 1 min'] },
  { name:'Kotlety z indyka', protein:48, kcal:350, time:'25 min', tag:'Obiad', emoji:'ÃÂ°ÃÂÃÂ¦ÃÂ',
    skladniki:['200g mielonego indyka','1 jajko','2 lyzki bulki tartej','2 zabki czosnku','sol, pieprz, oregano'],
    kroki:['Wymieszaj indyka z jajkiem, bulka i przyprawami','Uformuj 4 kotlety','UsmaÃÂÃÂ¼ na oleju po 4-5 min z kazdej strony','Lub upiecz w 180 stopniach przez 20 min','Podaj z warzywami lub ryzem'] },
  { name:'Shake bialkowy z owsianka', protein:40, kcal:440, time:'5 min', tag:'Sniadanie', emoji:'ÃÂ°ÃÂÃÂ¥ÃÂ',
    skladniki:['40g platki owsiane','300ml mleka 2%','1 banan','150g jogurtu greckiego','opcjonalnie: 1 lyzka masla orzechowego'],
    kroki:['Wrzuc wszystko do blendera','Blenduj 30 sekund','Gotowe! Pij od razu po treningu','Mozna dodac lod dla swiezosci','Zamrozone owoce tez swietne'] },
  { name:'Makaron z kurczakiem i szpinakiem', protein:45, kcal:520, time:'20 min', tag:'Obiad', emoji:'ÃÂ°ÃÂÃÂÃÂ',
    skladniki:['100g makaronu penne','150g piersi z kurczaka','100g szpinaku','3 zabki czosnku','2 lyzki oliwy','30g parmezanu','sol i pieprz'],
    kroki:['Ugotuj makaron al dente','Pokroj kurczaka w paski, smaÃÂÃÂ¼ 6-8 min','Dodaj czosnek i szpinak ÃÂ¢ÃÂÃÂ smaÃÂÃÂ¼ 2 min','Wymieszaj z makaronem','Posyp parmezanem i podaj'] },
  { name:'Jogurt grecki z orzechami', protein:22, kcal:280, time:'2 min', tag:'Przekaska', emoji:'ÃÂ°ÃÂÃÂ«ÃÂ',
    skladniki:['200g jogurtu greckiego 2%','garsc orzechow wloskich','1 lyzka siemienia lnianego','1 lyzeczka miodu','opcjonalnie: jagody'],
    kroki:['Wloz jogurt do miski','Posyp orzechami i siemieniem','Polej miodem','Dodaj owoce jesli chcesz','Idealny jako przekaska miedzy treningami'] },
  { name:'Losos z batatami', protein:44, kcal:490, time:'30 min', tag:'Obiad', emoji:'ÃÂ°ÃÂÃÂÃÂ',
    skladniki:['150g fileta z lososia','200g batatow','150g brokul','1 lyzka oliwy','sok z pol cytryny','sol, pieprz, ziolowe przyprawy'],
    kroki:['Rozgrzej piekarnik do 180 stopni','Pokroj bataty w plastry, piecz 15 min','Dodaj lososia skropionego cytryna i oliwa','Piecz kolejne 15 min','Podaj z brokuli ugotowanymi na parze'] },
]

const PROMPT = 'Jestes ekspertem od zywienia sportowego. Przeanalizuj zdjecie produktu spozywczego. Odpowiedz TYLKO czystym JSON bez markdown: {"name":"nazwa produktu","protein":liczba,"calories":liczba,"rating":"dobry lub sredni lub zly","emoji":"odpowiedni znak","reason":"uzasadnienie max 2 zdania po polsku"}. Zasady: dobry=bialko>15g/100g, sredni=8-15g, zly=ponizej 8g. Emoji: dobry=pozytywny, sredni=neutralny, zly=negatywny.'

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
        const res = await fetch('https://gym-api-proxy.damianbiniarz.workers.dev', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:500,
            messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:file.type,data:b64}},{type:'text',text:PROMPT}]}]
          })
        })
        const data = await res.json()
        const text = (data.content?.[0]?.text||'').replace(/```json|```/g,'').trim()
        setResult(JSON.parse(text))
      } catch(e) { setErr('Blad analizy ÃÂ¢ÃÂÃÂ sprobuj ponownie') }
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
        <button onClick={()=>setTab('recipes')} style={{flex:1,padding:'10px',borderRadius:'var(--radius-sm)',border:'1px solid '+(tab==='recipes'?'var(--accent)':'var(--border)'),background:tab==='recipes'?'rgba(249,115,22,0.1)':'transparent',color:tab==='recipes'?'var(--accent)':'var(--text2)',fontWeight:tab==='recipes'?600:400,fontSize:14}}>ÃÂ°ÃÂÃÂÃÂ Przepisy</button>
        <button onClick={()=>setTab('scanner')} style={{flex:1,padding:'10px',borderRadius:'var(--radius-sm)',border:'1px solid '+(tab==='scanner'?'var(--accent)':'var(--border)'),background:tab==='scanner'?'rgba(249,115,22,0.1)':'transparent',color:tab==='scanner'?'var(--accent)':'var(--text2)',fontWeight:tab==='scanner'?600:400,fontSize:14}}>ÃÂ°ÃÂÃÂÃÂ¸ Skaner</button>
      </div>

      {tab==='recipes'&&(
        <>
          <a href='https://homefresh.damianbiniarz.com' target='_blank' rel='noreferrer' style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:'rgba(74,124,89,0.15)',border:'1px solid rgba(74,124,89,0.4)',borderRadius:'var(--radius-sm)',marginBottom:20,textDecoration:'none',color:'var(--text)'}}>
            <span style={{fontSize:24}}>ÃÂ°ÃÂÃÂ¥ÃÂ</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>HomeFresh ÃÂ¢ÃÂÃÂ Twoje przepisy</div><div style={{fontSize:12,color:'var(--text3)'}}>Planuj obiady i znajdz co w lodowce</div></div>
            <ExternalLink size={16} color='var(--text3)'/>
          </a>
          <div style={{fontSize:12,color:'var(--text3)',marginBottom:12,textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Kliknij przepis aby zobaczyc szczegoly</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
            {RECIPES.map((r,i)=>(
              <button key={i} onClick={()=>setModal(r)} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'16px 12px',textAlign:'left',cursor:'pointer',transition:'border-color 0.15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <div style={{fontSize:28,marginBottom:8}}>{r.emoji}</div>
                <div style={{fontSize:13,fontWeight:600,marginBottom:6,lineHeight:1.3}}>{r.name}</div>
                <div style={{display:'flex',flexDirection:'column',gap:3}}>
                  <span style={{fontSize:12,color:'var(--success)',fontWeight:600}}>ÃÂ°ÃÂÃÂÃÂª {r.protein}g bialka</span>
                  <span style={{fontSize:11,color:'var(--text3)'}}>ÃÂ°ÃÂÃÂÃÂ¥ {r.kcal} kcal ÃÂÃÂ· ÃÂ¢ÃÂÃÂ± {r.time}</span>
                </div>
                <span style={{display:'inline-block',marginTop:8,fontSize:10,padding:'2px 8px',borderRadius:10,background:'rgba(249,115,22,0.15)',color:'var(--accent)',fontWeight:600}}>{r.tag}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {tab==='scanner'&&(
        <div>
          <div className='card' style={{marginBottom:16,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:8}}>ÃÂ°ÃÂÃÂÃÂ¸</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Skaner produktow</div>
            <div style={{fontSize:13,color:'var(--text3)',marginBottom:16}}>Zrob zdjecie etykiety ÃÂ¢ÃÂÃÂ AI oceni czy warto jesc dla budowy miesni</div>
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

      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'var(--bg)',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:600,maxHeight:'85vh',overflowY:'auto',padding:'24px 20px 40px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:36}}>{modal.emoji}</span>
                <div>
                  <div style={{fontSize:18,fontWeight:700,lineHeight:1.2}}>{modal.name}</div>
                  <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>ÃÂ¢ÃÂÃÂ± {modal.time} ÃÂÃÂ· ÃÂ°ÃÂÃÂÃÂ· {modal.tag}</div>
                </div>
              </div>
              <button onClick={()=>setModal(null)} style={{background:'var(--bg2)',border:'none',borderRadius:'50%',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',flexShrink:0}}><X size={18}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
              <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'var(--radius-sm)',padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:28,fontWeight:700,color:'var(--success)',fontFamily:'var(--font-display)'}}>{modal.protein}g</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>Bialko</div>
              </div>
              <div style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'var(--radius-sm)',padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:28,fontWeight:700,color:'var(--accent)',fontFamily:'var(--font-display)'}}>{modal.kcal}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>Kcal</div>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Skladniki</div>
              {modal.skladniki.map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{color:'var(--accent)',fontSize:16}}>ÃÂ¢ÃÂÃÂ¢</span>
                  <span style={{fontSize:14,color:'var(--text2)'}}>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Przygotowanie</div>
              {modal.kroki.map((k,i)=>(
                <div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{width:24,height:24,borderRadius:'50%',background:'var(--accent)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</span>
                  <span style={{fontSize:14,color:'var(--text2)',lineHeight:1.5,paddingTop:2}}>{k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}