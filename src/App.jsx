import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Workout from './pages/Workout'
import Progress from './pages/Progress'
import Exercises from './pages/Exercises'
import Layout from './components/Layout'

export default function App() {
  const [user, setUser] = useState(undefined)
  useEffect(() => { const unsub = onAuthStateChanged(auth, u => setUser(u)); return unsub }, [])
  if (user === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48, fontFamily:'var(--font-display)', letterSpacing:2, color:'var(--accent)' }}>GYM BINIARZ</div>
      <div style={{ color:'var(--text2)', fontSize:14 }}>Ladowanie...</div>
    </div>
  )
  return (
    <BrowserRouter basename="/gym-app">
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Layout user={user} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard user={user} />} />
          <Route path="workout" element={<Workout user={user} />} />
          <Route path="progress" element={<Progress user={user} />} />
          <Route path="exercises" element={<Exercises user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}