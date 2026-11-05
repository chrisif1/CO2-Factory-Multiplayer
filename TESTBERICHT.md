# Testbericht – CO₂ Factory V1.3

Prüfdatum: 05.11.2026.

## Automatisierte Tests

17 Tests erfolgreich (Node.js 24). Abgedeckt: 2–8 Spieler, Spielstart und Zugrechte,
Investitionen, alle 20 Pflicht-Ereignisse ohne doppelte Anwendung, Jahreswechsel,
reguläres Spielende, negatives Kapital, kostenlose Investitionen bei Schulden,
exakte CO₂-Kostenskalierung einschließlich 0 € und hoher Startwerte, Audit-Versetzung,
Feldbezug, feste Parameter, Navigation sowie HTTP-Mehrspielerzugriff und Speicherung.
Ein zusätzlicher kompletter Regeldurchlauf mit acht Unternehmen und negativem Jahresergebnis
endet regulär nach zwei Geschäftsjahren; kein Unternehmen scheidet wegen Schulden aus.

## Bedienung im Browser

Eine vollständige Partie mit zwei unabhängigen Browserzugängen wurde über 42 Spielzüge
bis zur Endwertung bedient. Enthalten waren Investitionen, Unternehmensentscheidungen,
automatische Ereignisse, Auditgebühren, Versetzung, Aussetzen und Jahresabschluss.
Aktions-Popups erschienen nur beim jeweiligen Spieler am Zug. Die Endwertung und Diagramme
zeigten die konsistenten Spielstände beider Unternehmen.

Alle 40 Felder wurden anschließend geöffnet und geschlossen: richtige Feldnummer,
lesende Ansicht und kein horizontaler Überlauf im Dialog.

## Darstellung

- 1280 × 900: Desktopbrett, Dialog, Endwertung und Diagramme.
- 992 × 1118: Investitionspopup und Auswahlabschluss.
- 390 × 844: Aktive Unternehmensentscheidung mit drei Optionen, Investitionsabschluss und Spielerwechsel.
- 320 × 568: Schmale Feldansicht mit langem Text und allen Optionen über den Dialog scrollbar.
- Obere Reihe und rechter Rand: Hover-/Fokushinweis liegt außerhalb des Brettrahmens und vollständig innerhalb des sichtbaren Fensters.
- Finale Navigation: nur Spielbrett und CO₂/Budget.
- In der abschließenden Browserprüfung keine Konsolenfehler.

Gefundene und korrigierte Darstellungsfehler: unnötig lange Dialogtitel,
unpassende Umbrüche, überlagernde mobile Tooltips und abgeschnittene Hover-Hinweise.

Die Mobilprüfung verwendet Browseransichten mit den genannten Größen; es wurde kein
separates physisches iOS- oder Android-Gerät getestet. Die Render-Live-Version wurde
nicht überschrieben; die neue Version wurde lokal getestet und als Paket erstellt.
