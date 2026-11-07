# Testbericht – V1.5, 07.11.2026

## Automatisierte Regeln und HTTP

33 Tests erfolgreich. Geprüft wurden Standardwerte, Entfernung der Jahresbegrenzung,
40 Felder, diagonale Auditpositionen, regelmäßige Ereignisabstände, Investitionen und
Kapitalprüfung, negative Kapitalstände, verpflichtende Ereignisse genau einmal,
stabile Photovoltaik-/Wartungsbezüge nach der Feldumordnung und CO₂-Kostenskalierung.

Jahresabschluss: normaler Betrag beim Überqueren, doppelter aktueller Betrag auf Feld 1,
auch nach einer Änderung des Jahresergebnisses und bei negativem Jahresergebnis;
Emissionen werden nur einmal fortgeschrieben. Kein automatisches Ende nach 21 Jahren.

Zielrennen: erster, mittlerer und letzter Spieler als Auslöser; gleiche Zugzahlen;
keine zusätzliche Runde; Nachziehender kann gewinnen; Kapital entscheidet Gleichstand;
alle schon beim Start am Ziel; Ausstieg während eigener Entscheidung, außerhalb des
eigenen Zuges, während der Nachziehrunde, des Auslösers und aller Unternehmen.

Vollständige Simulation mit acht Unternehmen und Standardwerten: reguläres Zielende
mit gleicher Zahl abgeschlossener Züge. Professorenmodus, mitspielende Spielleitung,
gesperrte Spielleitungszüge, Lobbyplätze, QR-Erzeugung, HTTP-Autorisierung und Persistenz
sind ebenfalls abgedeckt.

## Browserprüfung

Isolierte lokale Testpartien wurden in echtem Chrome mit Playwright geöffnet und bedient.
Zwei bis acht Testunternehmen, Professorenansicht, Formularwerte, Audit-Popups,
gesperrtes Investment mit Verzicht, doppelte Auszahlung auf Feld 1 sowie Nachziehen
und anschließende Endwertung wurden über Oberfläche und HTTP geprüft.
Die Testzustände wurden reproduzierbar mit der tatsächlichen Spielengine erzeugt.

Alle 40 Felder, acht Unternehmenskarten, Namen, Kapital- und Jahresergebniszeilen sowie
die zentralen Kennzahlen liegen innerhalb ihrer Bereiche. Keine Seitenüberläufe bei:

- 1366 × 768 (PC)
- 1024 × 768 (Tablet)
- 844 × 390 (Handy quer)
- 668 × 375 (kleines Handy quer)
- 568 × 320 (sehr kleines Handy quer)

Eine zunächst abgeschnittene Jahresergebniszeile in der kleinsten Ansicht wurde korrigiert;
anschließend bestanden alle fünf Darstellungsprüfungen. Die Vorschaubilder zeigen den Endstand.
Bei einzeln besetzten Feldern messen die Figuren je nach Ansicht 14 bis 29 Pixel.
Der gesperrte Investmentknopf bleibt vollständig deckend und erreicht für Haupttext
und Hintergrund ein gemessenes Kontrastverhältnis von 10,64:1.
Keine abschließenden JavaScript-Fehler im Browser. Messdaten in TESTDARSTELLUNG.json.

Es handelt sich um Browseransichten dieser Größen, nicht um Tests auf physischen Mobilgeräten.
Die bisherige Render-Live-Version wurde nicht geändert.
