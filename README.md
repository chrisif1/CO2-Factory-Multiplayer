# CO₂ Factory Multiplayer V1.7

## Starten

Node.js ab Version 20. START-WINDOWS.bat, START-MAC-LINUX.sh oder `npm start` ausführen.
Im Browser http://localhost:3000 öffnen. Keine zusätzlichen npm-Pakete erforderlich.

## Neue persönliche Karte: Integriertes Managementsystem

Im gemeinsamen Stapel gibt es eine Karte „Integriertes Managementsystem“ (IMS).
Nur das ziehende Unternehmen erhält sie. Sie wirkt nicht sofort auf Kapital oder Emissionen,
sondern wird aufbewahrt, bis dieses Unternehmen das nächste Audit erreicht.
Ein IMS-Kennzeichen auf der Unternehmenskarte und die Unternehmensdetails zeigen den Besitz.

Beim nächsten Audit wird der Schutz automatisch eingelöst:

- Direkt auf dem Audit: keine Auditgebühr, die Karte wird verbraucht.
- Über „Zum Audit“: Bewegung auf Feld 15 bleibt, aber keine Auditgebühr, kein Aussetzen
  und keine Bezahlung für die Sofortberatung beim nächsten Zug.
- Danach kommt die Karte hinter die übrigen ziehbaren Karten zurück in den Stapel.
  Sie kann erneut von demselben oder einem anderen Unternehmen gezogen werden.

Während sie aufbewahrt wird, ist die Karte nicht im Stapel und kann nicht mehrfach gehalten
oder von jemand anderem gezogen werden. Sie bleibt über Jahresabschlüsse und fremde Züge
erhalten. Bestätigter Ausstieg legt eine gehaltene Karte ebenfalls zurück. Ohne Karte gelten
die bisherigen Auditgebühren und die Entscheidung zwischen Beratung und Aussetzen weiter.
Die Unternehmensdetails und der Reflexionsbericht zeigen Einsätze und erlassene Auditgebühren.
Die Regeln sind didaktisch vereinfacht; reale Managementsysteme garantieren keine Gebührenbefreiung.

## Aufgeräumtes Brett und Zughinweis

- Goldene Startkachel mit Richtungspfeil, dunklem Rand und START-Beschriftung. Auch acht
  Figuren auf Start werden vollständig angeordnet; die Beschriftung bleibt sichtbar.
- Unternehmenswerte stehen nur auf den Unternehmenskarten, die zusätzliche Momentaufnahme
  des aktiven Unternehmens entfällt. Scope-Details und kumulierte Werte sind weiterhin unter
  Unternehmen & Protokoll verfügbar. Unternehmenskarten bleiben für Investitionsdetails anklickbar.
- Der eingestellte CO₂-Zielwert steht auf dem Brett einmal groß rechts oben.
- Doppelte Feldnummern aus den Illustrationen entfernt; die Feldnummer am Rahmen bleibt.
- Nur die Person am Zug erhält „Du bist dran!“ mit Unternehmensname und Los-geht’s-Schaltfläche.
  Einmal pro Zug und Browser-Tab; ein Neuladen nach Bestätigung zeigt ihn nicht erneut.
  Beim nächsten eigenen Zug erscheint ein neuer Hinweis. Die reine Spielleitung erhält ihn nicht.
- Globale Ereignisse werden zuerst gelesen, danach der Zughinweis, dann gegebenenfalls das
  Aktions-Popup. Bei einem Zugwechsel wird ein überholter Zughinweis geschlossen.

## Ziel, Spielende und Finanzierung

Standardwerte: 300.000 € Startkapital, 100.000 € Jahresergebnis, Scope 1 / 2 / 3:
250 / 300 / 450 t, CO₂-Ziel 400 t/Jahr. Zu hohe Anfangsemissionen werden proportional
reduziert und je Scope auf zwei Dezimalstellen abgerundet. Der Wartebereich erklärt die Änderung.
Die Prüfung berücksichtigt alle verfügbaren Investitionen und eine Reserve für die größten
positiven Scope-Wirkungen der Entscheidungen. Während der Partie sind Entscheidungen gesperrt,
die das CO₂-Ziel mit den verbleibenden Investitionen rechnerisch unerreichbar machen würden.
Kostenloses Vertagen bleibt möglich. Investitionen müssen weiterhin finanziert und die Felder
erreicht werden; die Prüfung garantiert keinen automatischen wirtschaftlichen Erfolg.

Sobald ein Unternehmen das CO₂-Ziel erreicht oder unterschreitet, ziehen nur die späteren
Unternehmen der laufenden Runde nach. Bei globaler Zielerreichung gilt der laufende Spielzug
als Nachziehgrenze. Die verbliebenen Unternehmen haben gleich viele abgeschlossene Züge.
Niedrigster aktueller Jahres-CO₂-Wert gewinnt; bei Gleichstand entscheidet das Kapital.
Ausgestiegene sind ausgeschlossen. Wenn niemand am Ziel bleibt, gibt es keinen Zielsieger.
Am Ende erscheinen die ersten drei Plätze auf dem Podest und persönliche Reflexionsberichte.

Direkt auf Feld 1: 1,2-faches aktuelles Jahresergebnis. Beim Überqueren: einfaches Ergebnis.
Jahreszähler und Emissionen werden jeweils nur einmal fortgeschrieben. Negatives Kapital
führt nicht zum Ausscheiden. Ein bestätigter Ausstieg entfernt das Unternehmen aus der
Zugfolge und gibt bei Bedarf sofort den nächsten Zug frei. Keine feste Geschäftsjahresgrenze.

## Globale Ereignisse

Der Stapel hat 24 Ereignisse: neun globale und fünfzehn persönliche/lokale. Alle sind verpflichtend und
werden beim Ziehen automatisch genau einmal angewendet. Globale Ereignisse betreffen alle
nicht ausgestiegenen Unternehmen, unabhängig davon, wer die Karte gezogen hat.

| Ereignis | Wirkung ohne Schutz | Zusammenhang mit Investitionen |
|---|---|---|
| CO₂-Preisschock | 50 €/t × Startkapitalfaktor × aktuelle Jahresemissionen | Bereits vermiedene Tonnen werden nicht belastet. |
| Strompreiserhöhung | Stromverbrauch × Preisaufschlag | PV schützt vollständig im Spiel; LED −10 %, Druckluft −10 %, effiziente Maschinen −25 %, Antriebe −10 % der Restbelastung. |
| Kältewelle | 18.000 € und zusätzlicher Heizbedarf | Dämmung −60 %, Wärmerückgewinnung −35 %, Wärmepumpe −50 %. |
| Hitzewelle | 16.000 € und zusätzlicher Kühlstrom | Dämmung −50 %, PV −40 %, Antriebe −15 %. |
| Bahnstreik | 12.000 € und Transportemissionen | Schieneninvestition erhöht Streikexposition um 50 %; digitale Planung senkt die Restwirkung um 60 %. |
| Sonnenreiches Jahr | Ohne PV keine Wirkung | Mit PV: 12.000 € Mehrertrag und zeitweilig geringere Stromemissionen. |
| Netzengpass | 30.000 € Ausfallkosten | PV −30 %, Predictive Maintenance −50 %, Antriebe −25 %. |
| Rohstoffpreisschub | 40.000 € Mehrkosten | Recyclingmaterial −60 %, materialarmes Design −40 %, Mehrweg −20 %. |
| Starkregen & Lieferketten | 25.000 € und 12 t Scope 3 | Digitale Planung −60 %, Routenzug −25 %. |

Schutzwirkungen werden auf die verbleibende Belastung multipliziert, nicht addiert. Beispiel:
Dämmung und PV reduzieren Hitzekosten auf 16.000 × 0,5 × 0,6 = 4.800 €.
Diese Zusammenhänge sind transparente didaktische Spielannahmen, keine Prognosen realer
Anlagen. Insbesondere ist vollständiger PV-Schutz vor einer Strompreiserhöhung vereinfacht;
bei einem Netzengpass schützt PV im Spiel nur teilweise.

Jede globale Meldung zeigt allen Teilnehmern und der Spielleitung die individuellen Wirkungen
mit Begründung und Lernhinweis. Wetter, Energie, Material und Transport haben passende
Animationen; bei reduzierter Bewegung werden diese abgeschaltet. Meldungen können in der
gemeinsamen Übersicht erneut geöffnet werden. Die letzten 60 Meldungen bleiben im Archiv;
der persönliche Bericht berücksichtigt alle während der aktiven Teilnahme erfassten Ereignisse.
Ein Wechsel des aktiven Spielers überschreibt die Meldung nicht. Geld wird sofort verbucht;
zeitweilige Emissionsänderungen gelten bis zum nächsten eigenen Jahresabschluss.

## Spielleitung, Details und Reflexion

Reine Professoren-Spielleitung oder mitspielender Host. Zwei bis acht Unternehmen;
nur die Spielleitung startet. QR-Code enthält den Einladungslink, keine Zugangstoken.
Lokal müssen sich die Geräte im selben erreichbaren Netz befinden. Vor Spielbeginn beitreten.
Nur die Person am Zug entscheidet; Felder können alle zur Information öffnen.
Ereignis- und Parameterbereiche bleiben deaktiviert. Audit auf Feld 15, Zum Audit auf Feld 35.

Unternehmen & Protokoll vereint Unternehmensübersicht, Protokoll und Weltereignis-Archiv.
Die Karten in der Mitte öffnen getätigte Investitionen und Entscheidungen.
Reflexionsberichte erklären die eigene Strategie, tatsächliche und nominale Investitionswirkung,
Ereignisschutz und Audit-Schutz. Gesamtminderungen enthalten auch Entscheidungen und Ereignisse.
Vergleiche vermiedener Ereigniskosten sind keine vollständige Alternativrechnung der Strategie.

## Aktualisierung und Prüfung

Alle Dateien im Projekt ersetzen, insbesondere den gesamten public-Ordner einschließlich
der neuen clarity.css, des Clients, game-data.json und sämtlicher Feld-SVGs.
Auch engine.js, server.js, global-events.js, feasibility.js und reflection.js mitliefern.
Render-Startbefehl: `npm start`. Neue Räume verwenden die Regeln 1.7 und storage/v17;
ältere Spielstände bleiben wegen der geänderten Regeln getrennt. Der Download verändert
die bisherige Render-Seite nicht.

`npm test`: 60 erfolgreiche Regel- und HTTP-Tests. Weitere Angaben in TESTBERICHT.md,
Konsolenergebnis in TESTERGEBNISSE.txt, Browsermessungen in TESTDARSTELLUNG.json.
Vorschaubilder unter vorschau/. Keine Spielstände oder Zugangstoken im Paket.
Lizenz des QR-Generators: THIRD_PARTY_NOTICES.md.
