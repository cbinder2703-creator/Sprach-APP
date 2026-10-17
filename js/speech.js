let voice = null;
let checked = false;

function findVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  checked = voices.length > 0;
  voice = voices.find((v) => v.lang.toLowerCase().startsWith('ar')) || null;
  return voice;
}

if ('speechSynthesis' in window) {
  findVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', findVoice);
}

export function hasArabicVoice() {
  return voice !== null || (!checked && findVoice() !== null);
}

export function speechSupported() {
  return 'speechSynthesis' in window;
}

export function speak(text) {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = 0.8;
  if (voice || findVoice()) u.voice = voice;
  synth.speak(u);
}
