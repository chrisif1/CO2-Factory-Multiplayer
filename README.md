# CO₂ Factory Multiplayer V1.6

## Starten

Node.js ab Version 20 installieren. START-WINDOWS.bat, START-MAC-LINUX.sh oder `npm start`
ausführen. Im Browser http://localhost:3000 öffnen. Es sind keine zusätzlichen npm-Pakete nötig.

## Neu in dieser Version

- Eine gemeinsame Schaltfläche **Unternehmen & Protokoll** rechts oben mit den Bereichen
  Unternehmen, Protokoll und Weltereignisse.
- Unternehmenskarten in der Brettmitte sind anklickbar und per Tastatur bedienbar. Die Ansicht
  zeigt gekaufte Investitionen, Kosten, Jahreswirkung, tatsächlich verbuchte dauerhafte
  Scope-Minderung und die gewählten Unternehmensentscheidungen.
- Das eingestellte CO₂-Ziel steht groß im Kopf des Spiels.
- Feld 1 zahlt bei direkter Landung das **1,2-Fache des aktuellen Jahresergebnisses** aus.
  Beim Überqueren bleibt es beim einfachen Ergebnis. Jahre und Emissionen zählen einmal.
- Ein Podest für die ersten drei nicht ausgestiegenen Unternehmen erscheint am Ende.
  Bei zwei Unternehmen werden zwei Plätze dargestellt; bei vollständigem Ausstieg kein Podest.
- Jeder Spieler erhält einen eigenen Reflexionsbericht mit seiner Strategie, Investitionen,
  laufenden Auswirkungen, Ereignisschutz, Entscheidungen und Fragen für die Nachbesprechung.
  Die Spielleitung kann alle Berichte auswählen; jeder Teilnehmer startet mit seinem eigenen.

## Erreichbarkeit des CO₂-Ziels

Die Anfangsemissionen werden bei Raumerstellung mit den verfügbaren Investitionen verglichen.
Zu hohe Werte werden im gleichen Verhältnis reduziert und je Scope auf zwei Dezimalstellen
abgerundet. Im Wartebereich stehen die ursprünglichen und die verwendeten Werte.
Die Standardwerte 250 / 300 / 450 t bei Ziel 400 t bleiben unverändert.

Die Startprüfung reserviert zusätzlich die jeweils größten positiven Scope-Wirkungen aller
Unternehmensentscheidungen. Während des Spiels wird jede Entscheidung erneut geprüft:
Die Summe der nach allen noch verfügbaren Investitionen verbleibenden Scope-Emissionen darf
das Ziel nicht überschreiten. Eine Option, die das Ziel unerreichbar machen würde, ist
serverseitig gesperrt und entsprechend beschriftet. Kostenloses Vertagen bleibt möglich,
ohne die Entscheidung dauerhaft zu verbrauchen. Deshalb ist kein zufälliges positives
Ereignis erforderlich, um das Ziel rechnerisch zu erreichen.

Das ist eine Prüfung der Emissionspotenziale. Investitionen müssen weiterhin finanziert und
die entsprechenden Felder erreicht werden; sie garantiert keine bestimmte Spieldauer oder
automatischen wirtschaftlichen Erfolg. Zeitweilige Ereignisemissionen enden am nächsten
eigenen Jahresabschluss. Es gibt keine feste Zahl von Geschäftsjahren.

## Globale Ereignisse

Der Stapel hat 23 Ereignisse: neun globale und vierzehn lokale. Alle sind verpflichtend und
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

## Reflexion und Endwertung

Sobald ein Unternehmen das CO₂-Ziel erreicht oder unterschreitet, ziehen nur die späteren
Unternehmen der laufenden Runde nach. Bei einem globalen Ereignis kann auch ein anderes
Unternehmen das Ziel erreichen; die Nachziehgrenze ist dann der gerade laufende Spielzug.
Alle verbleibenden Unternehmen haben am Ende gleich viele abgeschlossene Züge.
Platzierung: niedrigster aktueller Jahres-CO₂-Wert, bei Gleichstand höheres Kapital.
Ausgestiegene sind ausgeschlossen. Wenn niemand am Ziel bleibt, gibt es keinen Zielsieger.

Die Reflexion unterscheidet nominale und tatsächlich auf die dauerhafte Scope-Basis gebuchte
Investitionswirkungen. Die gesamte Emissionsänderung enthält zusätzlich Entscheidungen und
Ereignisse. Vermiedene Ereigniskosten vergleichen das gleiche Ereignis mit und ohne die
hinterlegten Schutzmaßnahmen; das ist keine vollständige Alternativrechnung der Strategie.
Einfache Amortisationen berücksichtigen weder Zinsen noch Ereignisse.

## Bestehende Funktionen

300.000 € Startkapital und 100.000 € Jahresergebnis als Standard. Reine Professoren-Spielleitung
oder mitspielender Host; zwei bis acht Unternehmen. Lokaler QR-Code mit Einladungslink,
ohne Zugangstoken. Bei lokalem Betrieb gleiche erreichbare WLAN-/LAN-Umgebung verwenden.
Beitreten vor Spielbeginn. Nur die Spielleitung startet und nur die Person am Zug entscheidet.
Negatives Kapital führt nicht zum Ausscheiden. Ein bestätigter Ausstieg entfernt die Figur und
gibt gegebenenfalls sofort den nächsten Zug frei. Ereignistab und Parameter bleiben gesperrt.
Audit auf Feld 15, Zum Audit auf Feld 35; regelmäßig verteilte Ereignisfelder. Rechteckiges
Brett für PC, Tablet und Handy im Querformat. Vollständige Feldtexte im antippbaren Popup.

## Aktualisieren und Prüfen

Alle Dateien dieses Ordners im bestehenden Projekt ersetzen, insbesondere auch die neuen
Module feasibility.js, global-events.js und reflection.js sowie public/experience.css.
Den gesamten public-Ordner einschließlich game-data.json, Client und SVGs aktualisieren.
Startbefehl auf Render: `npm start`. Neue Regeln verwenden neue Räume und storage/v16;
ältere Spielstände werden wegen der geänderten Regeln getrennt gehalten.
Der Download ändert die bisherige Render-Live-Version nicht.

`npm test`: 50 Tests. Browserbericht in TESTBERICHT.md und TESTDARSTELLUNG.json.
Vorschaubilder unter vorschau/. Das Paket enthält keine Spielstände oder Zugangstoken.
Lizenz des enthaltenen QR-Generators: THIRD_PARTY_NOTICES.md.
