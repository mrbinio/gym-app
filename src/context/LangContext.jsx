import { createContext, useContext, useState } from 'react'
import { createT } from '../i18n/translations'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('gym_lang') || 'pl')
  const toggle = () => {
    const next = lang === 'pl' ? 'en' : 'pl'
    localStorage.setItem('gym_lang', next)
    setLang(next)
  }
  const t = createT(lang)
  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)