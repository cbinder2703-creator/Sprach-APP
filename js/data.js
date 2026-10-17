// Lerninhalte: Modernes Hocharabisch (MSA) für Deutschsprachige.
// Umschrift (tr) ist bewusst deutsch-freundlich: sch = ش, dsch = ج, ch = خ (wie in „Bach“),
// ḥ = gehauchtes H, ʿ = Ain (Kehlkopf-Presslaut), gh = Gaumen-R, q = hinteres K.

const letter = (ar, say, tr, de) => ({ ar, say, tr, de });
const word = (ar, tr, de) => ({ ar, say: ar, tr, de });
const phrase = (ar, tr, de) => ({ ar, say: ar, tr, de, words: ar.split(' ') });

const LETTERS = {
  alif: letter('ا', 'ألف', 'Alif', 'Langes A wie in „Aal“'),
  ba: letter('ب', 'باء', 'Ba', 'B wie in „Ball“'),
  ta: letter('ت', 'تاء', 'Ta', 'T wie in „Tanne“'),
  tha: letter('ث', 'ثاء', 'Tha', 'Stimmloses engl. „th“ wie in „think“'),
  nun: letter('ن', 'نون', 'Nun', 'N wie in „Nase“'),
  dschim: letter('ج', 'جيم', 'Dschim', 'DSCH wie in „Dschungel“'),
  ha: letter('ح', 'حاء', 'Ḥa', 'Kräftiges, gehauchtes H aus der Kehle'),
  cha: letter('خ', 'خاء', 'Cha', 'CH wie in „Bach“'),
  dal: letter('د', 'دال', 'Dal', 'D wie in „Dach“'),
  dhal: letter('ذ', 'ذال', 'Dhal', 'Stimmhaftes engl. „th“ wie in „this“'),
  ra: letter('ر', 'راء', 'Ra', 'Gerolltes R (Zungenspitzen-R)'),
  zain: letter('ز', 'زاي', 'Zain', 'Stimmhaftes S wie in „Sonne“'),
  sin: letter('س', 'سين', 'Sin', 'Stimmloses S wie in „Wasser“'),
  schin: letter('ش', 'شين', 'Schin', 'SCH wie in „Schule“'),
  sad: letter('ص', 'صاد', 'Ṣad', 'Dunkles (emphatisches) S'),
  dad: letter('ض', 'ضاد', 'Ḍad', 'Dunkles (emphatisches) D'),
  ta2: letter('ط', 'طاء', 'Ṭa', 'Dunkles (emphatisches) T'),
  za: letter('ظ', 'ظاء', 'Ẓa', 'Dunkles (emphatisches) stimmhaftes „th“'),
  ain: letter('ع', 'عين', 'ʿAin', 'Gepresster Kehllaut aus dem Rachen'),
  ghain: letter('غ', 'غين', 'Ghain', 'GH – Gaumen-R wie das „R“ in „Rot“'),
  fa: letter('ف', 'فاء', 'Fa', 'F wie in „Fisch“'),
  qaf: letter('ق', 'قاف', 'Qaf', 'Q – K ganz hinten im Rachen'),
  kaf: letter('ك', 'كاف', 'Kaf', 'K wie in „Kuh“'),
  lam: letter('ل', 'لام', 'Lam', 'L wie in „Lampe“'),
  mim: letter('م', 'ميم', 'Mim', 'M wie in „Mond“'),
  ha2: letter('ه', 'هاء', 'Ha', 'H wie in „Haus“'),
  waw: letter('و', 'واو', 'Waw', 'W wie in „Wasser“ oder langes U'),
  ya: letter('ي', 'ياء', 'Ya', 'J wie in „Jahr“ oder langes I'),
};
const L = LETTERS;

const GREETINGS = [
  word('مرحبا', 'marhaban', 'Hallo'),
  word('السلام عليكم', 'as-salāmu ʿalaikum', 'Friede sei mit euch'),
  word('صباح الخير', 'ṣabāḥ al-chair', 'Guten Morgen'),
  word('مساء الخير', 'masāʾ al-chair', 'Guten Abend'),
  word('شكرا', 'schukran', 'Danke'),
  word('عفوا', 'ʿafwan', 'Gern geschehen'),
  word('نعم', 'naʿam', 'Ja'),
  word('لا', 'lā', 'Nein'),
  word('من فضلك', 'min faḍlik', 'Bitte'),
  word('مع السلامة', 'maʿa s-salāma', 'Auf Wiedersehen'),
];

const NUMBERS = [
  word('واحد', 'wāḥid', 'eins'),
  word('اثنان', 'ithnān', 'zwei'),
  word('ثلاثة', 'thalātha', 'drei'),
  word('أربعة', 'arbaʿa', 'vier'),
  word('خمسة', 'chamsa', 'fünf'),
  word('ستة', 'sitta', 'sechs'),
  word('سبعة', 'sabʿa', 'sieben'),
  word('ثمانية', 'thamāniya', 'acht'),
  word('تسعة', 'tisʿa', 'neun'),
  word('عشرة', 'ʿaschara', 'zehn'),
];

const FAMILY = [
  word('أب', 'ab', 'Vater'),
  word('أم', 'umm', 'Mutter'),
  word('أخ', 'ach', 'Bruder'),
  word('أخت', 'ucht', 'Schwester'),
  word('ابن', 'ibn', 'Sohn'),
  word('بنت', 'bint', 'Tochter'),
  word('جد', 'dschadd', 'Großvater'),
  word('جدة', 'dschadda', 'Großmutter'),
];

const FOOD = [
  word('ماء', 'māʾ', 'Wasser'),
  word('خبز', 'chubz', 'Brot'),
  word('حليب', 'ḥalīb', 'Milch'),
  word('قهوة', 'qahwa', 'Kaffee'),
  word('شاي', 'schāy', 'Tee'),
  word('تفاحة', 'tuffāḥa', 'Apfel'),
  word('لحم', 'laḥm', 'Fleisch'),
  word('أرز', 'aruzz', 'Reis'),
  word('بيضة', 'baiḍa', 'Ei'),
  word('جبن', 'dschubn', 'Käse'),
];

const COLORS = [
  word('أحمر', 'aḥmar', 'rot'),
  word('أزرق', 'azraq', 'blau'),
  word('أخضر', 'achḍar', 'grün'),
  word('أصفر', 'aṣfar', 'gelb'),
  word('أبيض', 'abyaḍ', 'weiß'),
  word('أسود', 'aswad', 'schwarz'),
];

const SENTENCES = [
  phrase('كيف حالك', 'kaifa ḥāluk', 'Wie geht es dir?'),
  phrase('أنا بخير', 'ana bi-chair', 'Mir geht es gut.'),
  phrase('اسمي أحمد', 'ismī aḥmad', 'Ich heiße Ahmad.'),
  phrase('أنا طالب', 'ana ṭālib', 'Ich bin Student.'),
  phrase('هذا كتاب', 'hādhā kitāb', 'Das ist ein Buch.'),
  phrase('هذه قهوة', 'hādhihi qahwa', 'Das ist Kaffee.'),
  phrase('أنا أحب الشاي', 'ana uḥibbu asch-schāy', 'Ich mag Tee.'),
];

function chunk(items, sizes) {
  const out = [];
  let i = 0;
  for (const size of sizes) {
    out.push(items.slice(i, i + size));
    i += size;
  }
  return out.filter((c) => c.length);
}

function makeUnit({ id, title, desc, kind, color, groups }) {
  const items = groups.flat();
  const lessons = groups.map((g, n) => ({
    id: `${id}-${n + 1}`,
    title: g.map((x) => x.ar).join('  ').slice(0, 24),
    items: g,
  }));
  if (groups.length > 1) {
    lessons.push({ id: `${id}-review`, title: 'Wiederholung', review: true, items });
  }
  return { id, title, desc, kind, color, items, lessons };
}

export const UNITS = [
  makeUnit({
    id: 'buchstaben-1', title: 'Buchstaben 1', desc: 'Die ersten Laute', kind: 'letters', color: '#0f766e',
    groups: [
      [L.alif, L.ba, L.ta, L.tha, L.nun],
      [L.dschim, L.ha, L.cha, L.dal, L.dhal],
    ],
  }),
  makeUnit({
    id: 'buchstaben-2', title: 'Buchstaben 2', desc: 'Zischlaute & dunkle Laute', kind: 'letters', color: '#b45309',
    groups: [
      [L.ra, L.zain, L.sin, L.schin, L.sad],
      [L.dad, L.ta2, L.za, L.ain, L.ghain],
    ],
  }),
  makeUnit({
    id: 'buchstaben-3', title: 'Buchstaben 3', desc: 'Das Alphabet komplett', kind: 'letters', color: '#7c3aed',
    groups: [
      [L.fa, L.qaf, L.kaf, L.lam, L.mim],
      [L.ha2, L.waw, L.ya],
    ],
  }),
  makeUnit({
    id: 'begruessung', title: 'Begrüßung', desc: 'Hallo, Danke, Tschüss', kind: 'words', color: '#0369a1',
    groups: chunk(GREETINGS, [5, 5]),
  }),
  makeUnit({
    id: 'zahlen', title: 'Zahlen', desc: 'Von eins bis zehn', kind: 'words', color: '#be185d',
    groups: chunk(NUMBERS, [5, 5]),
  }),
  makeUnit({
    id: 'familie', title: 'Familie', desc: 'Mutter, Vater, Geschwister', kind: 'words', color: '#15803d',
    groups: chunk(FAMILY, [4, 4]),
  }),
  makeUnit({
    id: 'essen', title: 'Essen & Trinken', desc: 'Im Café und beim Essen', kind: 'words', color: '#c2410c',
    groups: chunk(FOOD, [5, 5]),
  }),
  makeUnit({
    id: 'farben', title: 'Farben', desc: 'Rot, blau, grün …', kind: 'words', color: '#a21caf',
    groups: chunk(COLORS, [3, 3]),
  }),
  makeUnit({
    id: 'saetze', title: 'Erste Sätze', desc: 'Sich vorstellen & kleine Sätze', kind: 'phrases', color: '#0f766e',
    groups: chunk(SENTENCES, [4, 3]),
  }),
];

export const ALL_LESSONS = UNITS.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));

export function itemsOfKind(kind) {
  return UNITS.filter((u) => u.kind === kind).flatMap((u) => u.items);
}
