# FitStep · Sprint 1

Expo-Fitness-App für M426 mit **Schrittanzeige, Tagesziel, Fortschritt und Wochenübersicht**. Dieser Stand baut auf dem Grundgerüst von Sprint 0 auf.

## Starten

Voraussetzungen: mindestens **Node.js 22.13**, empfohlen **Node.js 24 LTS**, dazu npm und für einen Smartphone-Test Expo Go. Das Projekt verwendet Expo SDK 57. Öffne ein Terminal in diesem Projektordner.

```bash
npm ci
npm run start
```

Öffne den QR-Code mit Expo Go beziehungsweise auf dem iPhone mit der Kamera. Smartphone und Computer sollen im gleichen Netzwerk sein. `npm run dev` startet denselben Expo-Entwicklungsserver.

**Android Studio:** Starte zuerst einen Android-Emulator im Device Manager, danach:

```bash
npm run android
```

Optionale UI-Demo im Browser:

```bash
npm run web
```

## Benutzen

- **Dashboard:** Heutige Schritte, Tagesziel, Fortschritt und die letzten sieben Kalendertage.
- **Pedometer:** Sensorstatus, Berechtigung und Wechsel zwischen Live- und Demomodus.
- **Settings:** Tagesziel als positive ganze Zahl speichern. Der Startwert ist 8'000 Schritte.

Im **Demomodus** sind Beispieldaten sichtbar. Mit **+100**, **+1'000** und **Demo zurücksetzen** lässt sich die Anzeige vorführen. Die Kennzeichnung bleibt auf allen Ansichten sichtbar. Live- und Demo-Schrittverläufe werden getrennt gespeichert; Demo-Schritte gelangen nicht in die Sensordaten.

## Was der Schrittzähler erfasst

- **Android:** Erfasst Schritte, während die App im Vordergrund aktiv ist. Der Tageswert enthält die von dieser App erfassten Schritte.
- **iOS:** Liest verfügbare Bewegungsdaten für die letzten sieben Tage über Core Motion und aktualisiert den aktuellen Tag im Vordergrund.
- **Browser/Emulator:** Ein Schrittsensor ist möglicherweise nicht verfügbar. Für eine verlässliche Funktionsvorführung eignet sich der Demomodus.

Den Sensorzugriff über die angezeigte Aktion erlauben. Bei verweigerter Berechtigung oder fehlendem Sensor zeigt die App den Zustand und bietet den Demomodus an. Der Health-Abgleich ist für Sprint 3 vorgesehen.

Tagesziel, Modus und beide Schrittverläufe werden lokal auf dem Gerät gespeichert. Ein lokaler Kalendertag bestimmt die Zuordnung der Schritte.

## Prüfen und Dokumentation

```bash
npm run typecheck
npm test
npm run verify
```

`verify` führt TypeScript-Prüfung und Tests aus. Nutze zusätzlich die [manuelle Abnahme](docs/ABNAHME.md). [ARCHITEKTUR.md](docs/ARCHITEKTUR.md) erklärt den Aufbau; [SPRINTS.md](docs/SPRINTS.md) enthält die Story-Zuordnung und den Commit-Vorschlag.

### Messgrenze auf Android

Android zählt nur bei geöffneter App im Vordergrund. Der erste Sensorwert einer neuen Messsitzung dient als Ausgangswert. Dadurch kann ungefähr ein Schritt pro neuer Sitzung fehlen. Hintergrunddaten und die Health-Anbindung sind für Sprint 3 vorgesehen.

## Diesen Stand in euer Repository übernehmen

Jedes Sprint-ZIP enthält einen vollständigen, eigenständig startbaren Projektstand. Übernimm die Stände in der Reihenfolge **Sprint 0 → Sprint 1 → Sprint 2** in denselben Repository-Ordner. Kopiere jeweils den **Inhalt** des entpackten ZIPs in den Repository-Ordner und ersetze die vorhandenen Projektdateien. Kopiere auch `.github`, `.gitignore` und `.gitattributes`. Der vorhandene `.git`-Ordner eures Repositories bleibt erhalten.

Lege keine drei Sprint-Unterordner im Repository an. Prüfe und committe jeden Stand, bevor du den nächsten übernimmst. Die Dateien liegen in allen Ständen an denselben Pfaden, damit Git die Ergänzungen und Änderungen als normale Diffs zeigt. Bereits gespeicherte App-Daten werden beim Wechsel von Sprint 1 auf Sprint 2 übernommen.

Commit für diesen Stand:

```bash
git add .
git commit -m "feat(sprint-1): Schritte, Tagesziel, Fortschritt und Wochenübersicht"
git push
```

Nach einem Standwechsel die laufende Expo-Instanz stoppen, `npm ci` ausführen und die App neu starten. Bei einem Metro-Cacheproblem hilft `npx expo start --clear`.

Die Commit-Nachricht steht auch in `COMMIT.txt`. Durchgeführte technische Prüfungen und ihre Grenzen: [PRUEFUNG.md](docs/PRUEFUNG.md). Der Commit erhält das tatsächliche Datum deiner Ausführung; die Sprint-Nummer beschreibt den jeweiligen Funktionsumfang.
