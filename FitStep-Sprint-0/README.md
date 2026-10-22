# FitStep · Sprint 0

Expo-Projekt für das Schulmodul M426. Dieser Stand enthält das App-Grundgerüst und die Navigation zwischen **Dashboard**, **Pedometer** und **Settings**. Die Ansichten zeigen den Aufbau; die Fachfunktionen folgen in den späteren Projektständen.

## Starten

Voraussetzungen: mindestens **Node.js 22.13**, empfohlen **Node.js 24 LTS**, dazu npm und für einen Smartphone-Test Expo Go. Das Projekt verwendet Expo SDK 57. Öffne ein Terminal in diesem Projektordner.

```bash
npm ci
npm run start
```

Öffne den angezeigten QR-Code mit Expo Go beziehungsweise auf dem iPhone mit der Kamera. Smartphone und Computer sollen im gleichen Netzwerk sein. `npm run dev` ist ein Alias für `npm run start`.

**Android Studio:** Starte zuerst einen Android-Emulator im Device Manager. Führe danach im Projektordner aus:

```bash
npm run android
```

Für eine optionale Ansicht im Browser:

```bash
npm run web
```

## Prüfen

```bash
npm run typecheck
npm test
npm run verify
```

In Sprint 0 führen `typecheck`, `test` und `verify` die TypeScript-Prüfung aus. Fachliche Unit-Tests kommen mit der Fachlogik ab Sprint 1 hinzu. Geräte- und Bedienprüfungen stehen in [ABNAHME.md](docs/ABNAHME.md).

## Projektstand

- [Umfang und Commit-Vorschlag](docs/SPRINTS.md)
- [Aufbau und Entwicklungsregeln](docs/ARCHITEKTUR.md)

Die Sprint-Nummer bezeichnet den enthaltenen Funktionsumfang. Dokumentiere tatsächlich durchgeführte Prüfungen und eure eigenen Entscheidungen bei der Arbeit am Projekt.

## Diesen Stand in euer Repository übernehmen

Jedes Sprint-ZIP enthält einen vollständigen, eigenständig startbaren Projektstand. Übernimm die Stände in der Reihenfolge **Sprint 0 → Sprint 1 → Sprint 2** in denselben Repository-Ordner. Kopiere jeweils den **Inhalt** des entpackten ZIPs in den Repository-Ordner und ersetze die vorhandenen Projektdateien. Kopiere auch `.github`, `.gitignore` und `.gitattributes`. Der vorhandene `.git`-Ordner eures Repositories bleibt erhalten.

Lege keine drei Sprint-Unterordner im Repository an. Prüfe und committe jeden Stand, bevor du den nächsten übernimmst. Die Dateien liegen in allen Ständen an denselben Pfaden, damit Git die Ergänzungen und Änderungen als normale Diffs zeigt. Bereits gespeicherte App-Daten werden beim Wechsel von Sprint 1 auf Sprint 2 übernommen.

Commit für diesen Stand:

```bash
git add .
git commit -m "chore(sprint-0): Expo-Grundgerüst und Tab-Navigation"
git push
```

Nach einem Standwechsel die laufende Expo-Instanz stoppen, `npm ci` ausführen und die App neu starten. Bei einem Metro-Cacheproblem hilft `npx expo start --clear`.

Die Commit-Nachricht steht auch in `COMMIT.txt`. Durchgeführte technische Prüfungen und ihre Grenzen: [PRUEFUNG.md](docs/PRUEFUNG.md). Der Commit erhält das tatsächliche Datum deiner Ausführung; die Sprint-Nummer beschreibt den jeweiligen Funktionsumfang.
