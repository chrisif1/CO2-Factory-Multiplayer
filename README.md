# CO₂ Factory Multiplayer V1.4

## Starten

Node.js ab Version 20. `START-WINDOWS.bat`, `START-MAC-LINUX.sh` oder `npm start` ausführen.
Im Browser `http://localhost:3000` öffnen. Es sind keine zusätzlichen npm-Pakete erforderlich.

## Neue Funktionen

- FH-Logo aus der Oberfläche und dem Paket entfernt.
- Rechteckiges Brett mit 15 Spalten, 7 Reihen und allen 40 Feldern. Das Brett nutzt die verfügbare Fensterhöhe und bleibt im Querformat vollständig sichtbar.
- Unternehmenskarten liegen in der Brettmitte. Vollständige Kennzahlen und das Protokoll sind über die Schaltflächen oben erreichbar.
- Beim Erstellen die Rolle wählen: **Spielleitung – ohne mitzuspielen** oder **Spielleitung – selbst mitspielen**.
- Im Professorenmodus erhält die Spielleitung keine Figur, kein Kapital, keinen Platz in der Zugfolge und kein Spielergebnis. Bis zu acht Unternehmen können zusätzlich teilnehmen.
- Nur die Spielleitung darf starten und vor dem Start Spielerplätze freigeben. Nur die jeweiligen Spieler dürfen ihre Züge bedienen.
- QR-Code in der Lobby: scannen, Unternehmensnamen eingeben, beitreten. Der QR-Code enthält ausschließlich den Einladungslink mit Raumcode, keinen Spieler- oder Hostzugang.
- Der QR-Code wird lokal erzeugt. Keine externe QR-Webseite und kein Internetdienst sind dafür nötig.
- Wer während der Partie „Spiel verlassen“ bestätigt, scheidet aus. Die Figur verschwindet und das Unternehmen wird in der Zugfolge und Endwertung übersprungen. Bei Ausstieg der aktiven Person wird eine offene Entscheidung verworfen und das nächste aktive Unternehmen kann sofort würfeln.
- Wenn alle Unternehmen abgeschlossen haben oder ausgestiegen sind, endet die Partie. Vor Spielbeginn gibt ein Ausstieg den Spielerplatz frei.

## QR-Code und Netzwerk

Auf der Render-Seite verwendet der QR-Code die aufgerufene Webadresse.
Beim lokalen Aufruf über localhost wird eine LAN-Adresse des Servers vorgeschlagen.
Mitspieler müssen sich dann im selben erreichbaren WLAN/LAN befinden.
Wenn mehrere Netzwerkadapter vorhanden sind, die richtige Adresse in der Lobby auswählen.
Ein abgeschottetes Hochschul-Gastnetz kann direkte Geräteverbindungen verhindern; dann die
öffentlich erreichbare Render-Seite verwenden.
Beitreten ist wie bisher vor Spielbeginn möglich. Der Professor startet nach mindestens zwei beigetretenen Unternehmen.

## Bestehende Spielregeln

CO₂-Abgaben, Auditkosten und CO₂-Preisschock skalieren mit dem Startkapital
(Referenz: 1 Mio. € = 100 %). Ereignisse wirken sofort, verpflichtend und genau einmal.
Negatives Kapital führt nicht zum Ausscheiden. Nicht finanzierbare Ausgaben bleiben gesperrt;
kostenlose oder positive Optionen sind weiterhin möglich. Entscheidungs-Popups gehören nur
der Person am Zug. Alle können Felder lesend öffnen. Ereigniskarten-Tab und Parameterbereich
bleiben deaktiviert. Hover-Hinweise werden außerhalb des Brettrahmens angezeigt.

## Update auf GitHub/Render

Den Inhalt dieses Ordners in das Hauptverzeichnis des bestehenden Projekts übernehmen.
`public/` vollständig aktualisieren, einschließlich `landscape.css` und `qrcode.js`.
Die ZIP selbst nicht als einzelne Datei hochladen. Startbefehl: `npm start`.
Der Download des Pakets ändert die bisherige Live-Seite noch nicht.

## Prüfung

`npm test`. Einzelheiten stehen in `TESTBERICHT.md`, Konsolenergebnis in `TESTERGEBNISSE.txt`.
Vorschaubilder liegen unter `vorschau/`. Das Paket enthält keine Spielstände oder Zugangsdaten.
QR-Quellcode und Lizenzhinweis: `THIRD_PARTY_NOTICES.md`.
