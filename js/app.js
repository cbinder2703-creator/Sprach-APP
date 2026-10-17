import { UNITS, ALL_LESSONS } from './data.js';
import { buildExercises, shuffle } from './exercises.js';
import * as store from './store.js';
import { speak, hasArabicVoice, speechSupported } from './speech.js';

const root = document.getElementById('app');
const MAX_HEARTS = 3;
const OFFSETS = [0, 34, 52, 34, 0, -34, -52, -34];

let state = store.load();
let run = null;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const speakBtn = (text, cls = '') =>
  `<button class="speak ${cls}" data-act="speak" data-say="${esc(text)}" aria-label="Aussprache anhören">🔊</button>`;

function beep(ok) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    beep.ctx = beep.ctx || new Ctx();
    const ctx = beep.ctx;
    const t = ctx.currentTime;
    (ok ? [660, 880] : [220, 180]).forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = ok ? 'sine' : 'triangle';
      g.gain.setValueAtTime(0.08, t + i * 0.11);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 0.14);
      o.connect(g).connect(ctx.destination);
      o.start(t + i * 0.11);
      o.stop(t + i * 0.11 + 0.15);
    });
  } catch {
    /* Ton ist optional */
  }
}

function toast(msg) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

/* ---------- Startseite / Lernpfad ---------- */

function nextIndex() {
  return ALL_LESSONS.findIndex(({ lesson }) => !state.done[lesson.id]);
}

function renderHome() {
  run = null;
  const current = nextIndex();
  let idx = 0;
  const units = UNITS.map((unit) => {
    const nodes = unit.lessons
      .map((lesson, j) => {
        const i = idx++;
        const done = !!state.done[lesson.id];
        const isCurrent = i === current;
        const locked = current !== -1 && i > current;
        const icon = done ? '✓' : locked ? '🔒' : lesson.review ? '🏆' : '★';
        const cls = done ? 'done' : isCurrent ? 'current' : locked ? 'locked' : '';
        return `
          <div class="node-wrap" style="--o:${OFFSETS[j % OFFSETS.length]}px">
            ${isCurrent ? '<div class="start-bubble">START</div>' : ''}
            <button class="node ${cls}" data-act="open" data-i="${i}" aria-label="${esc(lesson.title)}">${icon}</button>
            <div class="node-label">${esc(lesson.review ? 'Wiederholung' : lesson.title)}</div>
          </div>`;
      })
      .join('');
    return `
      <section class="unit" style="--c:${unit.color}">
        <div class="unit-banner"><h2>${esc(unit.title)}</h2><p>${esc(unit.desc)}</p></div>
        <div class="path">${nodes}</div>
      </section>`;
  }).join('');

  root.innerHTML = `
    <header class="top">
      <div class="brand"><span class="ar" lang="ar" dir="rtl">يلا</span> Yalla</div>
      <div class="stats">
        <span title="Tage in Folge">🔥 ${store.visibleStreak(state)}</span>
        <span title="Erfahrungspunkte">⭐ ${state.xp}</span>
      </div>
    </header>
    <main class="home">
      ${current === -1 ? '<div class="banner-done">🎉 Alle Lektionen geschafft! Wiederhole sie, so oft du magst.</div>' : ''}
      ${units}
      <footer class="home-foot">
        <button class="link" data-act="reset">Fortschritt zurücksetzen</button>
      </footer>
    </main>`;
  window.scrollTo(0, 0);
}

/* ---------- Einführung ---------- */

function renderIntro(i) {
  const { unit, lesson } = ALL_LESSONS[i];
  const hint =
    !speechSupported() || !hasArabicVoice()
      ? '<p class="note">Tipp: Für die Aussprache braucht dein Gerät eine arabische Sprachausgabe (in den Systemeinstellungen unter „Sprache“ installierbar).</p>'
      : '';
  const cards = lesson.items
    .map(
      (it) => `
      <div class="card">
        <div class="card-ar ${unit.kind === 'letters' ? 'big' : ''}" lang="ar" dir="rtl">${esc(it.ar)}</div>
        <div class="card-mid"><div class="card-tr">${esc(it.tr)}</div><div class="card-de">${esc(it.de)}</div></div>
        ${speakBtn(it.say)}
      </div>`,
    )
    .join('');
  root.innerHTML = `
    <div class="intro" style="--c:${unit.color}">
      <header class="lhead"><button class="icon-btn" data-act="home" aria-label="Zurück">←</button><h1>${esc(unit.title)}</h1><span></span></header>
      <main class="lbody">
        <p class="lead">${lesson.review ? 'Wiederholung: Das hast du in dieser Einheit gelernt.' : 'Das lernst du jetzt:'}</p>
        <div class="cards">${cards}</div>
        ${hint}
      </main>
      <footer class="lfoot"><button class="btn primary" data-act="start" data-i="${i}">Los geht’s</button></footer>
    </div>`;
  window.scrollTo(0, 0);
}

/* ---------- Lektion ---------- */

function startLesson(i) {
  const { unit, lesson } = ALL_LESSONS[i];
  const queue = buildExercises(unit, lesson);
  run = {
    i, unit, lesson, queue, pos: 0,
    total: queue.length, done: 0, firstTry: 0, initial: queue.length,
    hearts: MAX_HEARTS, mistakes: 0, cur: null,
  };
  root.innerHTML = `
    <div class="lesson" style="--c:${unit.color}">
      <header class="lhead">
        <button class="icon-btn" data-act="quit" aria-label="Lektion abbrechen">✕</button>
        <div class="bar"><i id="bar"></i></div>
        <div class="hearts" id="hearts"></div>
      </header>
      <main class="lbody" id="body"></main>
      <footer class="lfoot" id="foot"></footer>
    </div>`;
  showExercise();
}

function updateHeader() {
  document.getElementById('bar').style.width = `${Math.round((run.done / run.total) * 100)}%`;
  document.getElementById('hearts').textContent = `❤️ ${run.hearts}`;
}

function questionText(ex) {
  const k = ex.kind;
  if (ex.type === 'listen') return 'Tippe auf das, was du hörst';
  if (ex.type === 'build') return 'Übersetze den Satz';
  if (ex.dir === 'ar2de') return k === 'letters' ? 'Welcher Laut ist das?' : k === 'phrases' ? 'Was bedeutet der Satz?' : 'Was bedeutet das?';
  return k === 'letters' ? 'Welcher Buchstabe ist das?' : k === 'phrases' ? 'Wähle die Übersetzung' : 'Wie heißt das auf Arabisch?';
}

function showExercise() {
  if (run.pos >= run.queue.length) return finishLesson();
  const ex = run.queue[run.pos];
  run.cur = { answered: false, selected: null, mistake: false, left: null, matched: new Set(), placed: [] };
  updateHeader();
  const body = document.getElementById('body');
  const foot = document.getElementById('foot');
  body.className = 'lbody';
  const q = `<h1 class="q">${esc(questionText(ex))}</h1>`;

  if (ex.type === 'choice') {
    const isArPrompt = ex.dir === 'ar2de';
    const prompt = isArPrompt
      ? `<div class="prompt"><div class="prompt-ar ${ex.kind === 'letters' ? 'big' : ''}" lang="ar" dir="rtl">${esc(ex.item.ar)}</div>
         <div class="prompt-tr">${esc(ex.item.tr)}</div>${speakBtn(ex.item.say, 'round')}</div>`
      : `<div class="prompt"><div class="prompt-de">${esc(ex.item.de)}</div></div>`;
    const opts = ex.options
      .map((o, n) =>
        isArPrompt
          ? `<button class="opt" data-act="pick" data-n="${n}">${esc(o.de)}</button>`
          : `<button class="opt ar-opt" lang="ar" dir="rtl" data-act="pick" data-n="${n}">${esc(o.ar)}</button>`,
      )
      .join('');
    body.innerHTML = `${q}${prompt}<div class="opts ${isArPrompt ? '' : 'grid'}">${opts}</div>`;
  } else if (ex.type === 'listen') {
    const opts = ex.options
      .map((o, n) => `<button class="opt ar-opt" lang="ar" dir="rtl" data-act="pick" data-n="${n}">${esc(o.ar)}</button>`)
      .join('');
    body.innerHTML = `${q}<div class="prompt">${speakBtn(ex.item.say, 'round huge')}</div><div class="opts grid">${opts}</div>`;
    speak(ex.item.say);
  } else if (ex.type === 'match') {
    ex.order = ex.order || shuffle(ex.items);
    const left = ex.items
      .map((it) => `<button class="tile ar-opt" lang="ar" dir="rtl" data-act="mleft" data-id="${esc(it.ar)}">${esc(it.ar)}</button>`)
      .join('');
    const right = ex.order
      .map((it) => `<button class="tile" data-act="mright" data-id="${esc(it.ar)}">${esc(it.de)}</button>`)
      .join('');
    body.innerHTML = `<h1 class="q">Finde die Paare</h1><div class="match"><div class="col">${left}</div><div class="col">${right}</div></div>`;
  } else if (ex.type === 'build') {
    body.innerHTML = `${q}<div class="prompt"><div class="prompt-de">${esc(ex.item.de)}</div></div>
      <div class="answer" id="answer" dir="rtl" lang="ar"></div>
      <div class="bank" id="bank" dir="rtl" lang="ar"></div>`;
    renderBuild();
  }

  foot.innerHTML =
    ex.type === 'match' ? '' : '<button class="btn primary" data-act="check" disabled>Prüfen</button>';
}

function renderBuild() {
  const ex = run.queue[run.pos];
  const placed = run.cur.placed;
  document.getElementById('answer').innerHTML = placed
    .map((id) => `<button class="chip" data-act="unbank" data-id="${id}">${esc(ex.bank.find((b) => b.id === id).text)}</button>`)
    .join('');
  document.getElementById('bank').innerHTML = ex.bank
    .map((b) =>
      placed.includes(b.id)
        ? `<span class="chip ghost">${esc(b.text)}</span>`
        : `<button class="chip" data-act="bank" data-id="${b.id}">${esc(b.text)}</button>`,
    )
    .join('');
  const check = document.querySelector('[data-act="check"]');
  if (check) check.disabled = placed.length === 0;
}

function reveal(correct, { answer = '', penalty = true, requeue = true } = {}) {
  const ex = run.queue[run.pos];
  run.cur.answered = true;
  beep(correct);
  if (correct) {
    run.done++;
    if (!ex.retry && !run.cur.mistake) run.firstTry++;
    if (ex.item) speak(ex.item.say);
  } else {
    run.mistakes++;
    if (penalty) run.hearts--;
    if (requeue) {
      run.queue.push({ ...ex, retry: true });
      run.total++;
    } else {
      run.done++;
    }
  }
  updateHeader();
  const foot = document.getElementById('foot');
  const outOfHearts = run.hearts <= 0;
  foot.innerHTML = `
    <div class="fb ${correct ? 'ok' : 'bad'}">
      <strong>${correct ? 'Richtig! 🎉' : 'Leider falsch'}</strong>
      ${!correct && answer ? `<div class="fb-ans">${answer}</div>` : ''}
    </div>
    <button class="btn ${correct ? 'primary' : 'danger'}" data-act="${outOfHearts ? 'fail' : 'next'}">Weiter</button>`;
}

function check() {
  const ex = run.queue[run.pos];
  const cur = run.cur;
  if (cur.answered) return;
  if (ex.type === 'choice' || ex.type === 'listen') {
    if (cur.selected === null) return;
    const correct = cur.selected === ex.correct;
    document.querySelectorAll('.opt').forEach((el, n) => {
      el.disabled = true;
      if (n === ex.correct) el.classList.add('right');
      else if (n === cur.selected) el.classList.add('wrong');
    });
    const solution =
      ex.type === 'choice' && ex.dir === 'ar2de'
        ? esc(ex.item.de)
        : `<span lang="ar" dir="rtl" class="ar-inline">${esc(ex.item.ar)}</span> · ${esc(ex.item.tr)}`;
    reveal(correct, { answer: `Richtig wäre: ${solution}` });
  } else if (ex.type === 'build') {
    if (!cur.placed.length) return;
    const given = cur.placed.map((id) => ex.bank.find((b) => b.id === id).text).join(' ');
    const correct = given === ex.item.words.join(' ');
    reveal(correct, {
      answer: `Richtig wäre: <span lang="ar" dir="rtl" class="ar-inline">${esc(ex.item.ar)}</span><br><small>${esc(ex.item.tr)}</small>`,
    });
  }
}

function finishLesson() {
  const bonus = run.mistakes === 0 ? 5 : 0;
  const gained = 10 + bonus;
  const accuracy = Math.round((run.firstTry / run.initial) * 100);
  state.done[run.lesson.id] = true;
  state.xp += gained;
  store.touchStreak(state);
  store.save(state);
  root.innerHTML = `
    <div class="result" style="--c:${run.unit.color}">
      <div class="trophy">🏆</div>
      <h1>Lektion geschafft!</h1>
      <div class="result-stats">
        <div><b>+${gained}</b><span>XP${bonus ? ' (Perfekt-Bonus)' : ''}</span></div>
        <div><b>${accuracy}%</b><span>Treffer beim ersten Versuch</span></div>
        <div><b>🔥 ${store.visibleStreak(state)}</b><span>Tage in Folge</span></div>
      </div>
      <button class="btn primary" data-act="home">Weiter</button>
    </div>`;
}

function failLesson() {
  const i = run.i;
  root.innerHTML = `
    <div class="result" style="--c:#dc2626">
      <div class="trophy">💔</div>
      <h1>Keine Herzen mehr</h1>
      <p class="lead">Kein Problem – Üben gehört dazu. Versuch es gleich noch einmal!</p>
      <button class="btn primary" data-act="start" data-i="${i}">Nochmal versuchen</button>
      <button class="btn ghost" data-act="home">Zur Übersicht</button>
    </div>`;
  run = null;
}

/* ---------- Ereignisse ---------- */

const actions = {
  open(el) {
    const i = Number(el.dataset.i);
    const current = nextIndex();
    if (current !== -1 && i > current) return toast('Schließe zuerst die vorherige Lektion ab 🔒');
    renderIntro(i);
  },
  start: (el) => startLesson(Number(el.dataset.i)),
  home: renderHome,
  quit() {
    if (confirm('Lektion abbrechen? Der Fortschritt dieser Lektion geht verloren.')) renderHome();
  },
  reset() {
    if (confirm('Wirklich den gesamten Fortschritt löschen?')) {
      state = store.reset();
      renderHome();
    }
  },
  speak: (el) => speak(el.dataset.say),
  pick(el) {
    if (run.cur.answered) return;
    run.cur.selected = Number(el.dataset.n);
    document.querySelectorAll('.opt').forEach((o) => o.classList.toggle('selected', o === el));
    const ex = run.queue[run.pos];
    if (ex.type === 'choice' && ex.dir === 'de2ar') speak(ex.options[run.cur.selected].say);
    document.querySelector('[data-act="check"]').disabled = false;
  },
  check,
  next() {
    run.pos++;
    showExercise();
  },
  fail: failLesson,
  bank(el) {
    if (run.cur.answered) return;
    run.cur.placed.push(Number(el.dataset.id));
    renderBuild();
  },
  unbank(el) {
    if (run.cur.answered) return;
    run.cur.placed = run.cur.placed.filter((id) => id !== Number(el.dataset.id));
    renderBuild();
  },
  mleft(el) {
    const cur = run.cur;
    if (cur.answered || cur.matched.has(el.dataset.id)) return;
    cur.left = el.dataset.id;
    document.querySelectorAll('[data-act="mleft"]').forEach((t) => t.classList.toggle('selected', t === el));
    speak(run.queue[run.pos].items.find((it) => it.ar === cur.left).say);
  },
  mright(el) {
    const cur = run.cur;
    const ex = run.queue[run.pos];
    if (cur.answered || cur.left === null || cur.matched.has(el.dataset.id)) return;
    if (el.dataset.id === cur.left) {
      cur.matched.add(cur.left);
      document.querySelectorAll(`[data-id="${CSS.escape(cur.left)}"]`).forEach((t) => {
        t.classList.remove('selected');
        t.classList.add('matched');
        t.disabled = true;
      });
      cur.left = null;
      if (cur.matched.size === ex.items.length) reveal(true);
    } else {
      cur.mistake = true;
      run.hearts--;
      run.mistakes++;
      beep(false);
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 400);
      updateHeader();
      if (run.hearts <= 0) failLesson();
    }
  },
};

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  actions[el.dataset.act]?.(el);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const btn = document.querySelector('.lfoot .btn:not([disabled])');
  if (btn && document.activeElement?.tagName !== 'BUTTON') btn.click();
});

renderHome();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
