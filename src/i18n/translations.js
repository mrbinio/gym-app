export const translations = {
  pl: {
    appName: 'GYM BINIARZ', loading: 'Ladowanie...', logout: 'Wyloguj',
    nav: { dashboard: 'Dashboard', workout: 'Trening', progress: 'Postep', exercises: 'Cwiczenia' },
    login: {
      title: 'Zaloguj sie', register: 'Utworz konto', email: 'Email', password: 'Haslo',
      loginBtn: 'Zaloguj sie', registerBtn: 'Utworz konto', googleBtn: 'Zaloguj przez Google',
      noAccount: 'Nie masz konta?', hasAccount: 'Masz juz konto?', registerLink: 'Zarejestruj sie', loginLink: 'Zaloguj sie',
      tagline: 'Twoj osobisty dziennik treningowy',
      errors: { 'auth/invalid-credential': 'Bledny email lub haslo', 'auth/email-already-in-use': 'Ten email jest juz zajety', 'auth/weak-password': 'Haslo min. 6 znakow', 'auth/invalid-email': 'Nieprawidlowy email', google: 'Blad logowania Google' }
    },
    dashboard: { greeting: 'WITAJ', totalWorkouts: 'Wszystkie treningi', thisWeek: 'Ten tydzien', exercisesInPlan: 'Cwiczenia w planie', startWorkout: 'Zacznij trening', recentWorkouts: 'Ostatnie treningi', noWorkouts: 'Brak treningow. Zacznij pierwszy!', sets: 'cw.' },
    workout: { title: 'TRENING', addSet: '+ Dodaj serie', saveWorkout: 'Zapisz trening', saving: 'Zapisywanie...', clickToStart: 'Kliknij cwiczenie aby zaczac', saved: 'TRENING ZAPISANY!', startAnother: 'Zacznij kolejny', prevBest: 'Poprzednio:', weight: 'Ciezar (kg)', reps: 'Powt.', seriesSaved: 'serii zapisanych' },
    progress: { title: 'POSTEP', subtitle: 'Sledz swoj rozwoj sily', selectExercise: 'Wybierz cwiczenie', record: 'Rekord', latest: 'Ostatnio', change: 'Zmiana', maxWeight: 'Max ciezar (kg)', volume: 'Objetosc (kg x powt.)', history: 'Historia', noData: 'Brak danych. Zaloguj trening!', reps: 'powt.' },
    exercises: { title: 'CWICZENIA', subtitle: 'Baza cwiczen i opisy techniczne', add: 'Dodaj', cancel: 'Anuluj', newExercise: 'Nowe cwiczenie', name: 'Nazwa *', muscle: 'Grupa miesniowa *', day: 'Dzien treningowy', desc: 'Opis / technika', descPlaceholder: 'Opisz jak wykonac cwiczenie...', saveExercise: 'Zapisz cwiczenie', saving: 'Zapisywanie...', all: 'Wszystkie', custom: 'wlasne', count: 'cwiczen', own: 'wlasnych' },
    days: { A: 'Dzien A', B: 'Dzien B', C: 'Dzien C', D: 'Dzien D' }
  },
  en: {
    appName: 'GYM BINIARZ', loading: 'Loading...', logout: 'Logout',
    nav: { dashboard: 'Dashboard', workout: 'Workout', progress: 'Progress', exercises: 'Exercises' },
    login: {
      title: 'Sign in', register: 'Create account', email: 'Email', password: 'Password',
      loginBtn: 'Sign in', registerBtn: 'Create account', googleBtn: 'Sign in with Google',
      noAccount: "Don't have an account?", hasAccount: 'Already have an account?', registerLink: 'Sign up', loginLink: 'Sign in',
      tagline: 'Your personal workout journal',
      errors: { 'auth/invalid-credential': 'Invalid email or password', 'auth/email-already-in-use': 'Email already in use', 'auth/weak-password': 'Password min. 6 characters', 'auth/invalid-email': 'Invalid email', google: 'Google login error' }
    },
    dashboard: { greeting: 'WELCOME', totalWorkouts: 'Total workouts', thisWeek: 'This week', exercisesInPlan: 'Exercises in plan', startWorkout: 'Start workout', recentWorkouts: 'Recent workouts', noWorkouts: 'No workouts yet. Start your first!', sets: 'ex.' },
    workout: { title: 'WORKOUT', addSet: '+ Add set', saveWorkout: 'Save workout', saving: 'Saving...', clickToStart: 'Click exercise to start', saved: 'WORKOUT SAVED!', startAnother: 'Start another', prevBest: 'Previous:', weight: 'Weight (kg)', reps: 'Reps', seriesSaved: 'sets saved' },
    progress: { title: 'PROGRESS', subtitle: 'Track your strength gains', selectExercise: 'Select exercise', record: 'Record', latest: 'Latest', change: 'Change', maxWeight: 'Max weight (kg)', volume: 'Volume (kg x reps)', history: 'History', noData: 'No data yet. Log a workout!', reps: 'reps' },
    exercises: { title: 'EXERCISES', subtitle: 'Exercise library and technique guides', add: 'Add', cancel: 'Cancel', newExercise: 'New exercise', name: 'Name *', muscle: 'Muscle group *', day: 'Training day', desc: 'Description / technique', descPlaceholder: 'Describe how to perform...', saveExercise: 'Save exercise', saving: 'Saving...', all: 'All', custom: 'custom', count: 'exercises', own: 'custom' },
    days: { A: 'Day A', B: 'Day B', C: 'Day C', D: 'Day D' }
  }
};

export const createT = (lang) => (path) => {
  const keys = path.split('.');
  let val = translations[lang] || translations['pl'];
  for (const k of keys) { val = val?.[k]; if (val === undefined) return path; }
  return val;
};