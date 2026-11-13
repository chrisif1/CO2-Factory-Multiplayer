# CO₂ Factory Multiplayer V1.8

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

## Spieldauer beim Erstellen

Die voraussichtliche Dauer steht direkt im Erstellungsformular. Sie aktualisiert sich bei
Änderung der Spielerzahl, der Scope-Startwerte und des CO₂-Ziels. Startkapital und Jahresergebnis
werden ebenfalls berücksichtigt, weil sie die Finanzierung der Investitionen beeinflussen.
Vor Erstellung wird volle Belegung mit der eingestellten Unternehmenszahl angenommen;
die reine Spielleitung zählt nicht als Unternehmen. Im Wartebereich gilt ab zwei beigetretenen
Unternehmen die tatsächliche Teilnehmerzahl, darunter die eingestellte volle Belegung.

Grundlage sind zehn reproduzierbare Beispielpartien mit der tatsächlichen Spielengine,
Würfeln, Ereignissen, Audits, Entscheidungen und Investitionen. Die Beispielstrategie bevorzugt
klimafreundliche Entscheidungen und bezahlbare Investitionen, berücksichtigt aber das laufende
Ergebnis bei Maßnahmen mit Mehrkosten. Dieselbe Erreichbarkeitsprüfung wie im echten Raum
passt zu hohe Startemissionen an; die Schätzung zeigt die wirksamen Werte.

Zeitannahme: 20–40 Sekunden je abgeschlossenem Zug und etwa drei Minuten Vorbereitung.
Die Ergebnisse werden als grobe, auf fünf Minuten gerundete Spanne angezeigt. Würfelglück,
Investitionsentscheidungen, Erfahrung und Diskussionen können die Dauer stark verändern.
Ein Pluszeichen kennzeichnet eine nach oben offene Spanne. Werden innerhalb des begrenzten
Simulationshorizonts kaum Partien beendet, wird keine feste obere Grenze behauptet.
Ist das Ziel bereits beim Start erreicht, zeigt die Anzeige null Spielminuten.
Die Zahlen sind eine modellbasierte Orientierung, keine empirisch gemessene Spielzeitgarantie.

Schätzungen verändern keinen echten Raum und benötigen keinen Spielerzugang. Wiederholte
Werte werden zwischengespeichert. Ein Fehler bei der Schätzung verhindert die Raumerstellung
nicht. Die Berechnung wird nur im Erstellungsformular und Wartebereich angefragt.

## Geschäftsjahr, Piktogramme und Zughinweis

- Die goldene Kachel heißt wieder **Geschäftsjahr** und behält den Richtungspfeil.
- Besetzte Felder reservieren getrennte Bereiche für Piktogramm und Figuren. Das Motiv wird
  auch bei mehreren Figuren und bei acht Figuren auf dem Geschäftsjahr-Feld angezeigt.
  Die Marker werden bei engem Platz kompakter angeordnet, statt das Motiv zu verdecken.
- Auf schmalen Feldern werden Namen gekürzt oder auf besetzten Feldern ausgeblendet;
  vollständige Namen und Informationen stehen im anklickbaren Feld-Popup.
- Unternehmenswerte stehen auf den Unternehmenskarten. Scope-Details und kumulierte Werte
  bleiben unter Unternehmen & Protokoll verfügbar. Das CO₂-Ziel steht einmal groß rechts oben.
- Nur die Person am Zug erhält „Du bist dran!“, einmal pro Zug und Browser-Tab. Neuladen nach
  Bestätigung wiederholt den Hinweis nicht. Die reine Spielleitung erhält ihn nicht.
  Reihenfolge: globale Ereignisse, persönlicher Zughinweis, gegebenenfalls Aktions-Popup.

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

Der Stapel hat 28 Ereignisse: dreizehn globale und fünfzehn persönliche/lokale. Alle sind verpflichtend und
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

## Politische globale Ereignisse

Vier zusätzliche Karten sind fiktive politische Szenarien. Sie beschreiben keine geltenden
Gesetze oder tatsächlichen Förderansprüche. Alle wirken automatisch auf aktive Unternehmen.

| Szenario | Spielwirkung |
|---|---|
| Förderpaket für Energieeffizienz | 10 % der bereits bezahlten Investitionen in LED, Druckluft, PV, Wärmerückgewinnung, effiziente Maschinen/Antriebe, Wärmepumpe und Dämmung. Höchstens 40.000 € je Ereignis; ohne passende Investition kein Zuschuss. |
| CO₂-Grenzausgleich beschlossen | Aktuelle Scope-3-Tonnen × 50 €/t × Startkapitalfaktor. Klimaarme Lieferanten senken die Restkosten um 50 %, emissionsarmer Stahl um weitere 40 %. |
| Neue Kreislaufvorgaben | 20.000 € Umstellungskosten. Recyclingmaterial −70 %, Mehrweg −20 %, materialarmes Design −30 % der jeweils verbleibenden Kosten. |
| Öffentliche Aufträge mit Klimakriterien | Bei höchstens 600 t CO₂e/Jahr: 20.000 € Bonus. Mit klimaarmen Lieferanten 30.000 €. Oberhalb der Grenze kein Bonus. |

Keine dieser Geldwirkungen verändert physische Emissionen. Die individuelle Anzeige erklärt
Zuschüsse und vermiedene Kosten. Eigene Animationen für Fördergeld, Grenzübertritt, Kreislauf
und öffentliche Aufträge; alle Ereignisse erscheinen im Archiv und persönlichen Lernbericht.
Die Zeitschätzung verwendet auch diese Karten. Frühere Audit-, Ziel- und Zugregeln bleiben erhalten.

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
der clarity.css und duration.css, des Clients, game-data.json und sämtlicher Feld-SVGs.
Auch engine.js, server.js, duration-estimate.js, global-events.js, feasibility.js und reflection.js mitliefern.
Render-Startbefehl: `npm start`. Version 1.8 verwendet weiterhin storage/v17. Laufende V1.7-Räume erhalten beim Neustart die vier politischen Karten einmalig am Stapelende. Zugfolge und gehaltener IMS-Schutz bleiben erhalten.
Server nach dem Update neu starten, damit der Schätzungs-Endpunkt geladen wird. Der Download verändert
die bisherige Render-Seite nicht.

`npm test`: 73 erfolgreiche Regel- und HTTP-Tests. Weitere Angaben in TESTBERICHT.md,
Konsolenergebnis in TESTERGEBNISSE.txt, Browsermessungen in TESTDARSTELLUNG.json.
Vorschaubilder unter vorschau/. Keine Spielstände oder Zugangstoken im Paket.
Lizenz des QR-Generators: THIRD_PARTY_NOTICES.md.
