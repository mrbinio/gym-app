import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, serverTimestamp, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useLocation } from 'react-router-dom'
import { DEFAULT_EXERCISES } from '../data/exercises'
import { Plus, Trash2, CheckCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useLang } from '../App'

export default function Workout({ user }) {
  const location = useLocation()
  const { lang, t } = useLang()
  const [selectedDay, setSelectedDay] = useState(location.state?.day || 'A')
  const [exercises, setExercises] = useState([])
  const [log, setLog] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [prevBests, setPrevBests] = useState({})
  const [showDesc, setShowDesc] = useState({})

  const DAYS_T = {
    A: { label:t.dayA, sub:t.subA, color:'#3b82f6' },
    B: { label:t.dayB, sub:t.subB, color:'#22c55e' },
    C: { label:t.dayC, sub:t.subC, color:'#f97316' },
    D: { label:t.dayD, sub:t.subD, color:'#a78bfa' },
  }
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
      } catch {}
    }
    load(); setLog({}); setSaved(false); setExpanded({})
  }, [selectedDay, user.uid])

  const initSets = (ex) => {
    if (log[ex.id]?.length>0) return
    setLog(l=>({...l,[ex.id]:Array.from({length:ex.sets||3},()=>({weight:'',reps:''}))}))
    setExpanded(e=>({...e,[ex.id]:true}))
  }
  const addSet = (id) => setLog(l=>({...l,[id]:[...(l[id]||[]),{weight:'',reps:''}]}))
  const updateSet = (id,i,f,v) => setLog(l=>{const s=[...(l[id]||[])];s[i]={...s[i],[f]:v};return{...l,[id]:s}})
  const removeSet = (id,i) => setLog(l=>({...l,[id]:(l[id]||[]).filter((_,j)=>j!==i)}))
  const saveWorkout = async () => {
    const loggedEx=exercises.filter(e=>log[e.id]?.length>0).map(e=>({exId:e.id,name:e.name,sets:log[e.id].filter(s=>s.weight||s.reps)})).filter(e=>e.sets.length>0)
    if (!loggedEx.length) return
    setSaving(true)
    try { await addDoc(collection(db,'workouts'),{uid:user.uid,day:selectedDay,exercises:loggedEx,date:serverTimestamp()}); setSaved(true) }
    catch(e) { console.error(e) }
    setSaving(false)
  }
  const totalSets=Object.values(log).reduce((a,s)=>a+(s?.filter(s=>s.weight||s.reps).length||0),0)
  const dayConfig=DAYS_T[selectedDay]undefined