import { itemsOfKind } from './data.js';

export const shuffle = (arr) => {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

// Bevorzugt Ablenker aus derselben Einheit, füllt sonst mit gleichartigen Inhalten auf.
function distractors(item, unit, n, key) {
  const seen = new Set([item[key]]);
  const out = [];
  for (const p of [...shuffle(unit.items), ...shuffle(itemsOfKind(unit.kind))]) {
    if (seen.has(p[key])) continue;
    seen.add(p[key]);
    out.push(p);
    if (out.length === n) break;
  }
  return out;
}

function choice(item, unit, dir) {
  const key = dir === 'ar2de' ? 'de' : 'ar';
  const options = shuffle([item, ...distractors(item, unit, 3, key)]);
  return { type: 'choice', dir, kind: unit.kind, item, options, correct: options.indexOf(item) };
}

function listen(item, unit) {
  const options = shuffle([item, ...distractors(item, unit, 3, 'ar')]);
  return { type: 'listen', kind: unit.kind, item, options, correct: options.indexOf(item) };
}

function match(items) {
  return { type: 'match', items: items.slice(0, 5) };
}

function build(item, unit) {
  const extra = [];
  const own = new Set(item.words);
  for (const p of shuffle(unit.items)) {
    for (const w of p.words) {
      if (!own.has(w) && !extra.includes(w) && extra.length < 2) extra.push(w);
    }
  }
  const bank = shuffle([...item.words, ...extra].map((text, id) => ({ id, text })));
  return { type: 'build', item, bank };
}

export function buildExercises(unit, lesson) {
  const items = lesson.items.length > 8 ? shuffle(lesson.items).slice(0, 8) : lesson.items;
  const ex = items.map((i) => choice(i, unit, 'ar2de'));
  if (unit.kind === 'phrases') {
    ex.push(...shuffle(items).map((i) => build(i, unit)));
    ex.push(...shuffle(items).slice(0, 2).map((i) => listen(i, unit)));
    return ex;
  }
  if (items.length >= 3) ex.push(match(shuffle(items)));
  ex.push(...shuffle(items).slice(0, 5).map((i) => choice(i, unit, 'de2ar')));
  ex.push(...shuffle(items).slice(0, 3).map((i) => listen(i, unit)));
  return ex;
}
