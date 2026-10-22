# FitStep · Sprint 2

Expo-Fitness-App für M426. Dieser Stand enthält **Schritte, Tagesziel, Fortschritt, Wochenübersicht, geschätzte Distanz, eigene Ziele und einen gespeicherten Profilnamen**.

## Starten

Voraussetzungen: mindestens **Node.js 22.13**, empfohlen **Node.js 24 LTS**, dazu npm und für einen Smartphone-Test Expo Go. Das Projekt verwendet Expo SDK 57. Öffne ein Terminal in diesem Projektordner.

```bash
npm ci
npm run start
```

Öffne den QR-Code mit Expo Go beziehungsweise auf dem iPhone mit der Kamera. Smartphone und Computer sollen im gleichen Netzwerk sein. `npm run dev` ist ein Alias für denselben Entwicklungsserver.

**Android Studio:** Starte einen Android-Emulator im Device Manager, danach:

```bash
npm run android
```

Optionale UI-Demo im Browser:

```bash
npm run web
```

## Benutzen

- **Dashboard:** Heutige Schritte, Tagesziel, Fortschritt, Wochenverlauf und geschätzte Distanz.
- **Pedometer:** Sensorstatus und Berechtigungsaktion; Live- und Demomodus wechseln.
- **Settings:** Profilname und Tagesziel speichern. Eigene Ziele hinzufügen, abhaken und löschen.

Der Startwert für das Tagesziel ist 8'000 Schritte; der Profilname beginnt mit **Nikos** und lässt sich ändern. Ein Ziel muss eine positive ganze Zahl sein. Profilnamen dürfen 1–40 Zeichen, eigene Zieltexte 1–120 Zeichen enthalten; reine Leerzeichen sind ungültig.

Die **geschätzte Distanz** verwendet 0,75 Meter pro Schritt. Beispiel: 1'000 Schritte ergeben 0,75 km. Sie beschreibt eine Näherung aus der Schrittzahl.

Im klar gekennzeichneten **Demomodus** dienen Beispieldaten und **+100 / +1'000 / Demo zurücksetzen** der Vorführung. Live- und Demo-Schrittverläufe bleiben getrennt gespeichert.

## Sensor und Speicherung

- **Android:** Erfasst Schritte, während die App im Vordergrund aktiv ist. Der Tageswert enthält die von dieser App erfassten Schritte.
- **iOS:** Liest verfügbare Bewegungsdaten der letzten sieben Tage über Core Motion und aktualisiert heute im Vordergrund.
- **Browser/Emulator:** Für die Funktionsvorführung den Demomodus verwenden, wenn kein Sensor verfügbar ist.

Sensorzugriff über die angezeigte Aktion erlauben. Die App zeigt verweigerte Berechtigungen und fehlende Sensoren verständlich an.

Profilname, Tagesziel, eigene Ziele samt Haken, Modus und beide Schrittverläufe werden lokal auf dem Gerät gespeichert. Eigene Ziele bleiben erhalten, bis sie geändert oder gelöscht werden. Der Schrittverlauf orientiert sich an lokalen Kalendertagen.

## Prüfen und nächster Schritt

```bash
npm run typecheck
npm test
npm run verify
```

`verify` führt TypeScript-Prüfung und Tests aus. Zusätzlich: [manuelle Abnahme](docs/ABNAHME.md), [Architektur](docs/ARCHITEKTUR.md) und [Sprint-Zuordnung](docs/SPRINTS.md).

**Sprint 3:** Epic 7 mit Health-Anbindung ist als nächster, separat umzusetzender Schritt geplant.

### Messgrenze auf Android

Android zählt nur bei geöffneter App im Vordergrund. Der erste Sensorwert einer neuen Messsitzung dient als Ausgangswert. Dadurch kann ungefähr ein Schritt pro neuer Sitzung fehlen. Hintergrunddaten und die Health-Anbindung sind für Sprint 3 vorgesehen.

## Diesen Stand in euer Repository übernehmen

Jedes Sprint-ZIP enthält einen vollständigen, eigenständig startbaren Projektstand. Übernimm die Stände in der Reihenfolge **Sprint 0 → Sprint 1 → Sprint 2** in denselben Repository-Ordner. Kopiere jeweils den **Inhalt** des entpackten ZIPs in den Repository-Ordner und ersetze die vorhandenen Projektdateien. Kopiere auch `.github`, `.gitignore` und `.gitattributes`. Der vorhandene `.git`-Ordner eures Repositories bleibt erhalten.

Lege keine drei Sprint-Unterordner im Repository an. Prüfe und committe jeden Stand, bevor du den nächsten übernimmst. Die Dateien liegen in allen Ständen an denselben Pfaden, damit Git die Ergänzungen und Änderungen als normale Diffs zeigt. Bereits gespeicherte App-Daten werden beim Wechsel von Sprint 1 auf Sprint 2 übernommen.

Commit für diesen Stand:

```bash
git add .
git commit -m "feat(sprint-2): Geschätzte Distanz, eigene Ziele und Profilname"
git push
```

Nach einem Standwechsel die laufende Expo-Instanz stoppen, `npm ci` ausführen und die App neu starten. Bei einem Metro-Cacheproblem hilft `npx expo start --clear`.

Die Commit-Nachricht steht auch in `COMMIT.txt`. Durchgeführte technische Prüfungen und ihre Grenzen: [PRUEFUNG.md](docs/PRUEFUNG.md). Der Commit erhält das tatsächliche Datum deiner Ausführung; die Sprint-Nummer beschreibt den jeweiligen Funktionsumfang.
