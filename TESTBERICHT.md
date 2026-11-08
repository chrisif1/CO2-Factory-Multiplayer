# Testbericht – V1.6, 08.11.2026

50 Regel- und HTTP-Tests erfolgreich. Enthalten: alle 23 Pflichtkarten genau einmal,
globale und lokale Reichweite, PV-Schutz vor Strompreisen, multiplikative Wettervorsorge,
Schienenabhängigkeit und Streik, Wartung/Netzengpass, Recycling/Rohstoffpreis,
Planung/Starkregen, Sonnenertrag, ausgeschiedene Unternehmen, zeitweilige Emissionen,
globale Zielerreichung, faire Nachziehrunde, Authentifizierung und persistierte Rollen.

Reflexion: eigene Käufe, Kosten, jährliche Effekte, nominale und tatsächliche dauerhafte
Scope-Minderung an der Nullgrenze trotz zeitweiliger Effekte, persönliche Ereignisse und
vermiedene Kosten. Berichte erst nach Spielende. Unveränderte Regeln für Schulden und Ausstieg.
Exakte Landung auf Feld 1 verwendet 1,2 auch bei verändertem oder negativem Jahresergebnis.

Zielschutz: Standardwerte bleiben unverändert; zu hohe Startwerte bei Zielen 0, 1, 100,
350 und 400 t werden passend reduziert. Entscheidung mit unmöglicher Restminderung wird
abgewiesen. Kostenloses Vertagen funktioniert. Verschiedene zulässige Kauf-/Entscheidungsfolgen
erhalten die rechnerische Erreichbarkeit. Vollständige Simulation mit acht Unternehmen endet
weiterhin am Ziel mit gleicher Zugzahl. Die Prüfung ersetzt keine Finanzierungsentscheidung.

## Chrome-Browserprüfung

Reproduzierbare lokale Testpartien mit der tatsächlichen Spielengine und HTTP-Server,
anschließend mit Playwright in echtem Chrome geöffnet und bedient.
Gemeinsame Übersicht, Protokoll, Investitionsdetails und Tastatur-fähige Unternehmenskarten.
Eine globale Hitzewelle gleichzeitig aus drei getrennten Browserkontexten betrachtet:
Spielleitung, auslösender Spieler und weiterer Spieler. Alle sehen individuelle Ergebnisse,
auch nachdem das Serverprotokoll bereits zum nächsten Spieler weitergeschaltet wurde.
Bestätigte Meldung bleibt beim nächsten Poll geschlossen; Archiv kann sie erneut öffnen.
Alle neun Ereignisthemen geprüft: carbon, power, cold, heat, transport, sun, grid, materials, rain.
Animationen vorhanden, bei prefers-reduced-motion deaktiviert. Ein 1,2-Bonus-Popup geprüft.
Gesperrte Luftfracht mit Erklärung und Vertagen über die Oberfläche geprüft.

Podest zeigt drei Plätze in Reihenfolge 2–1–3. Eine kleine Überlappung der Bronze-Beschriftung
wurde korrigiert. Bericht öffnet für den eigenen Spieler; Wechsel zu einem Unternehmen ohne
Investitionen zeigt entsprechend anderes Feedback. Wiederöffnen nach Schließen funktioniert.
Raumerstellung mit zu hohen Emissionen zeigt die automatische Anpassung im Wartebereich.

## Ansichten

1366 × 768, 1024 × 768, 844 × 390, 668 × 375 und 568 × 320:
Alle 40 Felder, acht Unternehmenskarten samt Kapital/Jahresergebnis, zentrale Kennzahlen und
großes CO₂-Ziel passen ins Fenster; kein Seiten- oder Brettscrollen. Investitionsdialoge
passen in alle fünf Fenster. Ereignis- und Ergebnisdialoge passen auch ins kleine Querformat
und lassen sich für längere Inhalte intern scrollen. Schließen bleibt im Reflexionsbericht
beim Scrollen erreichbar. Keine abschließenden JavaScript-Fehler im Browser.
Messdaten in TESTDARSTELLUNG.json, Konsolenergebnis in TESTERGEBNISSE.txt.

Dies sind Browseransichten, keine Tests auf physischen Mobilgeräten. Keine Aktualisierung
der bisherigen Render-Live-Seite vorgenommen.
