# CO₂ Factory Multiplayer V1.5

## Starten

Node.js ab Version 20. START-WINDOWS.bat, START-MAC-LINUX.sh oder `npm start` ausführen.
Im Browser http://localhost:3000 öffnen. Es sind keine zusätzlichen npm-Pakete erforderlich.

## Ziel und Spielende

Die Einstellung Geschäftsjahre entfällt. Sobald ein aktives Unternehmen nach seiner
Feldaktion das eingestellte CO₂-Ziel erreicht oder unterschreitet, beginnt die letzte Runde.
Nur die in dieser Runde noch folgenden Unternehmen ziehen nach. Beispiel: Spieler 2 von 4
erreicht das Ziel; Spieler 3 und 4 spielen noch, Spieler 1 erhält keinen zusätzlichen Zug.
So haben alle verbliebenen Unternehmen gleich viele Züge. Ausgestiegene werden übersprungen.

Unter den nicht ausgestiegenen Unternehmen am Ziel gewinnt der niedrigste aktuelle
Jahres-CO₂-Wert; bei Gleichstand entscheidet das höhere Kapital. Die kumulierten Emissionen
werden weiterhin angezeigt, entscheiden aber nicht die Zielwertung. Wenn bereits alle
Unternehmen beim Start am Ziel sind, endet das Spiel ohne Spielzüge.

## Änderungen in V1.5

- Standardwerte: 300.000 € Startkapital und 100.000 € Jahresergebnis.
- Direkte Landung auf Feld 1 zahlt das doppelte aktuelle Jahresergebnis aus. Beim Überqueren
  gibt es das einfache Jahresergebnis. Das gilt auch für ein negatives Jahresergebnis;
  Jahreszähler und kumulierte Emissionen werden jeweils nur einmal fortgeschrieben.
- Größere, nummerierte Figuren mit deutlicher Umrandung und Hervorhebung der aktiven Figur.
  Bei mehreren Figuren auf demselben Feld werden diese platzsparend angeordnet.
- Unternehmensdaten in der Brettmitte: Kapital, Jahresergebnis, aktuelle CO₂-Emissionen und
  kumulierte Emissionen. Alle Unternehmenskarten zeigen auch ihr Jahresergebnis.
- Gesperrte Investments haben dunklen Text auf hellem Hintergrund und nennen verfügbares
  Kapital sowie den fehlenden Betrag.
- Audit auf Feld 15 unten links; Zum Audit auf Feld 35 oben rechts, diagonal gegenüber.
- Ereignisfelder 4, 10, 17, 24, 30 und 37, im Abstand von sechs oder sieben Feldern.
- Ohne feste Laufzeit vergleicht das Audit die aktuellen Emissionen mit dem eingestellten
  CO₂-Ziel. Die Abgabe pro Tonne darüber skaliert weiterhin mit dem Startkapital.

## Spielleitung und Beitreten

Beim Erstellen zwischen Spielleitung ohne mitzuspielen und mitspielender Spielleitung wählen.
Im Professorenmodus hat die Spielleitung keine Figur, kein Unternehmen und keinen Zug.
Zwei bis acht Unternehmen können zusätzlich teilnehmen; nur die Spielleitung startet.
Teilnehmer scannen den lokal erzeugten QR-Code in der Lobby, geben ihren Namen ein und treten bei.
Der QR-Code enthält nur den Einladungslink und keine Zugangstoken.
Bei lokalem Start wird eine LAN-Adresse vorgeschlagen. Die Geräte müssen im selben erreichbaren
Netz sein; gegebenenfalls die passende Netzwerkadresse auswählen. Auf Render wird die dortige
Webadresse verwendet. Beitreten ist vor Spielbeginn möglich.

## Weitere Regeln und Bedienung

Ereignisse wirken verpflichtend, sofort und genau einmal. Negatives Kapital bedeutet kein
Ausscheiden. Nicht finanzierbare Ausgaben sind gesperrt, kostenlose oder positive Optionen
bleiben möglich. Entscheidungs-Popups gehören der Person am Zug. Alle können Felder zur
Information öffnen. Ereignistab und Parameterbereich bleiben deaktiviert.
CO₂-Abgaben, Auditkosten und CO₂-Preisschock skalieren mit dem Startkapital (1 Mio. € = 100 %).
Ein bestätigter Ausstieg entfernt die Figur und überspringt das Unternehmen in der Zugfolge.
Bei Ausstieg der aktiven Person geht der Zug sofort weiter. Sind alle ausgestiegen, endet das Spiel.

Das rechteckige Brett mit allen 40 Feldern passt sich PC, Tablet und Handy im Querformat an.
Auf kleinen Bildschirmen werden Feldnamen gekürzt; vollständige Texte stehen im Popup.
Unternehmen und Protokoll oben öffnen für weitere Details. Das FH-Logo ist entfernt.

## Update auf GitHub / Render

Den Inhalt dieses Ordners in das Hauptverzeichnis des bestehenden Projekts übernehmen.
`public/` vollständig aktualisieren, einschließlich goal.css, landscape.css, qrcode.js,
game-data.json und sämtlicher SVG-Feldbilder. Nicht nur die ZIP als einzelne Datei hochladen.
Startbefehl: `npm start`. Neue Räume verwenden die Regeln 1.5. Spielstände werden getrennt
unter storage/v15 gespeichert; ältere Räume werden wegen der neuen Feldanordnung nicht geladen.
Der Download des Pakets verändert die bisherige Live-Seite noch nicht.

## Prüfung

`npm test`. Details in TESTBERICHT.md, Konsolenergebnis in TESTERGEBNISSE.txt.
Vorschaubilder liegen unter vorschau/. Das Paket enthält keine Spielstände oder Zugangsdaten.
Lizenzhinweis zum enthaltenen QR-Generator: THIRD_PARTY_NOTICES.md.
