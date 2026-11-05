# CO₂ Factory Multiplayer V1.3

## Starten

Node.js ab Version 20 installieren. Unter Windows `START-WINDOWS.bat` öffnen,
unter macOS/Linux `START-MAC-LINUX.sh` ausführen oder im Spielordner `npm start` starten.
Im Browser `http://localhost:3000` aufrufen. Andere Geräte im selben WLAN verwenden
die beim Start angezeigte LAN-Adresse. Für die Internetversion die Spieldateien
im bestehenden GitHub/Render-Projekt aktualisieren; die ZIP selbst nicht hochladen.

## Änderungen

- CO₂-Abgaben, Auditgebühren, CO₂-Preisschock und Audit-Sofortberatung skalieren mit dem Startkapital.
- Formel: relevante Tonnen × Basissatz × Startkapital / 1.000.000 €. 500.000 € entsprechen 50 %, 2 Mio. € entsprechen 200 %.
- Ereignisse wirken beim Betreten sofort, verpflichtend und genau einmal. Wenn eine fachliche Voraussetzung fehlt, bleibt der Effekt automatisch aus.
- Keine sichtbaren Ereigniskartennummern; die Feldnummer bleibt sichtbar.
- Größere, zentrierte Spielernummern und kräftigere Feldrahmen.
- Jedes Feld lässt sich per Klick, Antippen oder Tastatur in einem Popup ansehen.
- Automatische Aktions-Popups und Auswahltasten erhält nur die Person am Zug. Die Berechtigungen prüft zusätzlich der Server.
- Nach einer Auswahl bleibt der Feldbezug erhalten. Audit-Versetzungen unterscheiden Landefeld und tatsächliche Position.
- Schulden führen nicht zum Ausscheiden. Kostenlose Investitionen und kostenlose oder positive Entscheidungen bleiben möglich; nicht finanzierbare Ausgaben sind gesperrt.
- Ereigniskarten-Tab und Parameterbereich sind deaktiviert. Die Navigation bietet Spielbrett und CO₂/Budget; Berechnungsparameter sind serverseitig gesperrt. Startkapital und andere Startwerte werden weiterhin beim Erstellen festgelegt.
- Hover-Hinweise liegen außerhalb des scrollbaren Brettrahmens und werden innerhalb des Fensters positioniert. Auf Mobilgeräten werden Felder angetippt.
- Große Auswahlflächen, scrollbare Dialoge, Tastaturfokus und Berücksichtigung reduzierter Animationen.

## Aktualisierung auf Render

Den Inhalt dieses Ordners in das Hauptverzeichnis des bestehenden Projekts übernehmen.
`public/` vollständig mit hochladen, einschließlich `refinements.css`, `client.js`,
`game-data.json`, Logo und `img/`. Startbefehl: `npm start`.
Die laufende Live-Version wird durch den Download dieser ZIP noch nicht aktualisiert.

## Prüfungen

`npm test` führt die automatisierten Tests aus. Ergebnisse und Browserprüfung stehen in
`TESTBERICHT.md`; Vorschau-Bilder befinden sich im Ordner `vorschau/`.
Das Paket enthält keine Spielstände oder Spielerzugänge.
