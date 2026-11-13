# Testbericht – V1.7, 13.11.2026

60 Regel- und HTTP-Tests erfolgreich. Die bisherigen Regeln einschließlich Zielschutz,
Nachziehrunde, globaler Ereignisse, Reflexion, Schulden, Ausstieg und 1,2-Bonus bestehen weiter.
Vollständige Simulation mit acht Unternehmen endet weiterhin am Ziel mit gleicher Zugzahl.

## Neue Karte

24 Pflichtkarten: neun globale, fünfzehn persönliche/lokale. Managementsystem ohne sofortige
Geld- oder CO₂-Wirkung; ausschließlich beim ziehenden Unternehmen aufbewahrt. Karte aus dem
Stapel entfernt, Aufbewahrung über Jahresabschlüsse und fremde Züge. Direkter Auditbesuch und
Versetzung zum Audit verbrauchen sie genau einmal. Keine Auditgebühr und keine Audit-Wartezeit.
Nach dem Verbrauch kein weiterer Schutz, bis die Karte erneut gezogen wird. Rückgabe hinter
allen anderen ziehbaren Karten; erneutes Ziehen und erneuter Verbrauch funktionieren.
Ausstieg gibt die Karte frei. Serien-Speicherung erhält Besitz, Zähler und Stapel.
Schutz bei Schulden und auch ohne anfallende Auditgebühr. Normales Bezahlen/Aussetzen ohne
Karte bleibt unverändert. Kein Zugangstoken wird im veröffentlichten Spielstand übertragen.

## Browserprüfung

Mit tatsächlicher Engine erzeugte lokale Testpartien über echten HTTP-Server in Chrome mit
Playwright bedient. Derselbe Raum in drei unabhängigen Kontexten: aktiver Spieler, weiterer
Spieler und Professor. Nur der aktive Spieler sieht „Du bist dran!“. Bestätigung unterdrückt
Wiederholung beim Poll und nach Neuladen desselben Tabs. Nach HTTP-Spielzügen erscheint der
Hinweis beim nächsten Spieler und beim nächsten eigenen Zug erneut.
Ein offenes globales Ereignis verzögert den Zughinweis, bis es bestätigt ist; kein überlagertes
Feld-Popup. Persönliche Managementsystem-Karte, Aufbewahrungsansicht und geschützter Audit
im Browser geprüft. Am Ende Podest und Reflexion weiterhin erreichbar, kein Zughinweis mehr.

## Darstellung

1366 × 768, 1024 × 768, 844 × 390, 668 × 375 und 568 × 320:
Alle 40 Felder und acht Unternehmenskarten samt Kapital/Jahresergebnis innerhalb des Fensters,
kein Seiten- oder Brettscrollen. Zielwert genau einmal auf dem Brett. Doppelte Momentaufnahme,
Scope-Kacheln und Markenüberschrift aus der Brettmitte entfernt. Investitionsdetails passen in
alle fünf Ansichten. Zughinweis im kleinen Handyquerformat und Audit-Popup intern scrollbar.
Start goldfarben, mit Rahmen und Richtungspfeil. Zusätzliche Prüfung mit acht Figuren auf Start
bei PC-Größe und 568 × 320: Ein anfänglicher Überlauf wurde korrigiert; alle Figuren und die
START-Beschriftung liegen danach vollständig im Feld. IMS-Kennzeichen in der Unternehmenskarte.
Keine abschließenden JavaScript-Fehler im Browser.

Browseransichten, keine Tests auf physischen Mobilgeräten. Die Render-Live-Seite wurde nicht
aktualisiert. Messdaten in TESTDARSTELLUNG.json, Vorschaubilder im Ordner vorschau/.
