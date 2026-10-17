# Yalla – Arabisch lernen (für Deutschsprachige)

Duolingo-artige Lern-App für Modernes Hocharabisch. Reine statische Web-App
(HTML/CSS/ES-Module, kein Build-Schritt), mobile-first und als PWA installierbar.

## Starten

```bash
cd arabisch
python3 -m http.server 8123     # oder: npx http-server .
# → http://localhost:8123
```

## Inhalt

27 Lektionen in 9 Einheiten: Alphabet (28 Buchstaben in 3 Einheiten), Begrüßung,
Zahlen 1–10, Familie, Essen & Trinken, Farben, erste Sätze. Jede Einheit endet mit einer
Wiederholungslektion. Inhalte stehen in `js/data.js`, neue Einheit = neuer `makeUnit()`-Eintrag.

## Aufgabentypen (`js/exercises.js`)

Mehrfachauswahl (Arabisch→Deutsch, Deutsch→Arabisch), Hörverstehen, Paare finden,
Satz bauen (Wortbank). Falsche Antworten kommen am Ende der Lektion erneut dran.
3 Herzen pro Lektion, XP, Tages-Serie (🔥), Fortschritt in `localStorage`.

## Aussprache

Nutzt die Web-Speech-API (`ar-SA`). Auf Geräten ohne arabische Stimme wird ein Hinweis angezeigt.
Umschrift ist deutsch-freundlich (sch, dsch, ch wie in „Bach“, ḥ, ʿ).

## Hinweise

- Inhalte/Umschrift vor einem Release von Muttersprachlern gegenlesen lassen.
- Arabische Wörter sind ohne Vokalzeichen (Harakat) geschrieben, wie im Alltag üblich.
