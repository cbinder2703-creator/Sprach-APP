const KEY = 'yalla-arabisch-v1';
const defaults = { xp: 0, streak: 0, lastDay: null, done: {} };

export function load() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...defaults };
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Speicher blockiert (z. B. privates Fenster) – App läuft ohne Persistenz weiter */
  }
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* siehe save() */
  }
  return { ...defaults, done: {} };
}

function dayString(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function touchStreak(state) {
  const today = dayString(new Date());
  if (state.lastDay === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  state.streak = state.lastDay === dayString(yesterday) ? state.streak + 1 : 1;
  state.lastDay = today;
}

// Zeigt die Serie nur, solange sie nicht gerissen ist.
export function visibleStreak(state) {
  if (!state.lastDay) return 0;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return state.lastDay === dayString(new Date()) || state.lastDay === dayString(yesterday) ? state.streak : 0;
}
