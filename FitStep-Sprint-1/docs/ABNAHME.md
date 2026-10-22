# Definition of Done und Abnahme · Sprint 1

Diese Liste am tatsächlichen Projektstand ausfüllen. Automatisierte Prüfungen ersetzen den Test auf dem Zielgerät nicht.

## Definition of Done

- [ ] Die vereinbarten User Stories sind anhand der folgenden Prüfungen erfüllt.
- [ ] `npm run verify` läuft erfolgreich.
- [ ] Live- und Demodaten bleiben bei allen geprüften Aktionen getrennt.
- [ ] Eingabefehler und Sensorzustände sind verständlich.
- [ ] Das Ergebnis und offene Punkte sind im Review nachvollziehbar.

## Manuelle Abnahme

| Bereich | Prüfung |
|---|---|
| Navigation | Alle drei Tabs bedienen; aktive Ansicht erkennen; auf kleinem Bildschirm auf Überdeckungen prüfen. |
| Schritte | Im Demomodus +100 und +1'000 verwenden. Dashboard, Zähler und Wochenwert für heute aktualisieren sich gemeinsam. |
| Tagesziel | Einen positiven Ganzzahlwert speichern. Leere Eingabe, 0, negative Werte und Dezimalzahlen werden abgewiesen. |
| Fortschritt | Mit Demo-Schritten unter, genau auf und über das Tagesziel gelangen. Prozentwert und Restschritte stimmen; der Ring überläuft nicht. |
| Woche | Genau sieben aufeinanderfolgende Kalendertage einschliesslich heute prüfen. Jeder Tag hat seinen eigenen Schrittwert. |
| Speicherung | Ziel ändern, Modus wechseln und Schritte ergänzen. App vollständig schliessen und neu öffnen; gespeicherte Werte prüfen. |
| Trennung | Demo-Schritte ergänzen und zu Live wechseln. Der Live-Wert übernimmt keine Demo-Schritte. |
| Sensor | Auf einem echten Gerät Zugriff erlauben und gehen; Anzeige prüfen. Berechtigung verweigern und die Fehlermeldung beziehungsweise Demo-Option prüfen. |
| Tageswechsel | Bei einem tatsächlichen lokalen Tageswechsel prüfen, dass neue Schritte dem neuen Tag zugeordnet werden und der Verlauf erhalten bleibt. |

## Prüfprotokoll und Rückblick

Notiere zu einem tatsächlich ausgeführten Test: Umgebung, Handlung, erwartetes Ergebnis, beobachtetes Ergebnis und offene Fehler. Für die Retro festhalten, was geholfen hat und welche konkrete Verbesserung ihr vereinbart. Namen, Termine und Beobachtungen ergänzt das Team aus seiner tatsächlichen Arbeit.
