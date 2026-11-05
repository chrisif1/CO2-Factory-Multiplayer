# CO₂ Factory – Multiplayer für 2 bis 8 Geräte

**Version:** 1.0 (04.11.2026)  
**Grundlage:** CO₂ Factory V2 mit 40 Spielfeldern, sechs unterschiedlichen Entscheidungsfeldern, 20 realitätsnah parametrisierten Ereigniskarten und dem von der Projektgruppe gelieferten FH-Oberösterreich-Logo.

Das Spiel funktioniert sowohl im **gleichen WLAN/LAN** als auch über **das Internet**, sofern derselbe Server über eine öffentlich erreichbare HTTPS-Adresse bereitgestellt wird. Die Spieler benötigen **keine EXE, keine App und keine Installation**, nur einen modernen Browser. Eine Person startet den Server und erstellt den Raum. Bis zu sieben weitere Personen treten mit einem sechsstelligen Code bei. Jeder verwaltet sein eigenes Unternehmen.

## 1. Im gemeinsamen WLAN starten (Windows)

1. Diese ZIP-Datei vollständig entpacken.
2. Falls noch nicht vorhanden: **Node.js LTS** von https://nodejs.org/ installieren (ab Version 20). Anschließend Terminal neu öffnen.
3. `START-WINDOWS.bat` doppelklicken, alternativ im entpackten Ordner `node server.js` ausführen.
4. Auf dem Host-Laptop im Browser `http://localhost:3000` öffnen.
5. Die Startkonsole zeigt die WLAN-Adresse an, z. B. `http://192.168.1.52:3000`. **Diese Adresse** öffnen die anderen Geräte im selben Netzwerk. `localhost` funktioniert nur am Host.
6. Ein Unternehmen und die Spieldauer (1–20 Jahre) einstellen, Raum erstellen, Einladungslink oder **sechsstelligen Raumcode** weitergeben.
7. Die Gäste wählen „Raum beitreten“. Ab zwei Teilnehmenden kann die Spielleitung starten.

**Wichtig:** Das Serverfenster muss geöffnet bleiben. Bei einer Windows-Firewall-Abfrage den lokalen Zugriff **nur für vertrauenswürdige private Netzwerke** erlauben, sofern die Organisationsrichtlinien das zulassen. Keine Sicherheitssoftware abschalten. Gast-WLANs blockieren möglicherweise die Kommunikation zwischen Geräten; in diesem Fall ein freigegebenes Netzwerk nutzen oder die Internetvariante.

### Mac / Linux

Im entpackten Verzeichnis `sh START-MAC-LINUX.sh` oder `node server.js` ausführen. Erfordert ebenfalls Node.js ab Version 20.

## 2. Über das Internet spielen

Die lokale Adresse `http://192.168...:3000` ist **nicht** über das Internet erreichbar. Damit Personen von verschiedenen Standorten mitspielen können, muss das Projekt auf einem **öffentlichen Node.js-Host mit HTTPS** laufen.

**Variante A – Cloud-Hosting (für Gruppen am einfachsten):**

1. Den Projektordner in ein privates Git-Repository legen oder über die Hosting-Oberfläche als Code/Docker-Projekt bereitstellen.
2. Bei einem Node.js-fähigen Anbieter (z. B. Render, Railway oder eigener VPS) einen Web-Service erstellen. **Startbefehl:** `npm start` (Build-Schritt nicht nötig, keine externen Laufzeitpakete). Die Anwendung berücksichtigt automatisch die Port-Variable `PORT`.
3. HTTPS-Domain des Dienstes öffnen, z. B. `https://meine-co2-factory.example` (nur ein Platzhalter, **keine bereits existierende Website**).
4. Dort einen Raum erstellen und die URL bzw. den Code teilen. Gäste können von überall beitreten.
5. Für dauerhaft nutzbare Spielstände **persistent storage** konfigurieren und ggf. `CO2_DATA_DIR=/data` setzen, wenn der Dienst einen permanenten Datenträger unter `/data` bereitstellt. Sonst können Räume bei einem Neustart oder einer Neuveröffentlichung verloren gehen.

**Variante B – Privater Server / Docker:**

- `docker build -t co2-factory .`
- `docker run --rm -p 3000:3000 -v co2-spielstand:/app/storage co2-factory`
- Den Dienst hinter einem **HTTPS-Reverse-Proxy** mit gültigem Zertifikat bereitstellen. Offenen HTTP-Port 3000 **nicht ungeschützt** im Internet veröffentlichen.

Ein sicher konfigurierter HTTPS-Tunnel zum lokalen Server ist ebenfalls möglich; der Tunnel muss während des Spiels aktiv bleiben. Die App benötigt dafür **keine Codeänderung**.

**Es wurde noch kein öffentlicher Server für euch bereitgestellt.** Das ZIP enthält die lauffähige Anwendung und die Konfiguration; der letzte Schritt ist eure Bereitstellung bei einem Host.

## 3. Spielablauf

- **2–8 Spieler** mit eigener Browser-Sitzung. Ein Gerät kann Gastgeber und Spieler 1 zugleich sein.
- **1–20 Geschäftsjahre** vor Start einstellbar; weitere Startwerte sind konfigurierbar.
- **40 individuell illustrierte Spielfelder** mit Monopoly-inspirierter Laufrichtung. Start = Feld 1, Audit = Feld 11, Innovationsförderung = Feld 21, Zum Audit = Feld 31.
- **Sechs unterschiedliche Entscheidungsfelder** zu Produktionsprogramm, Lieferantenstrategie, Qualifizierung, Fertigungssteuerung, Distribution und Produktdesign mit je drei Alternativen.
- **20 Ereigniskarten** mit Parameterformeln und unterschiedlichen, teils bedingten oder temporären Emissions-/Geldeffekten.
- **Würfel- und Kartenanimation**, gemeinsamer Verlauf (CO₂ und Liquidität), Geschäftsabschluss und Endrangliste.
- Jeder Spieler würfelt **nur am eigenen Zug**. Der Server prüft Investitionen, Zugwechsel und alle Berechnungen. Aktionen synchronisieren sich über Abfragen etwa alle **1,25 Sekunden**.
- Spielstände werden beim Server **nach jeder Aktion** in `storage/<RAUMCODE>.json` abgelegt. Nach einem Serverneustart können Spieler mit demselben Browserprofil und ihrer gespeicherten Zugangskennung wieder einsteigen.

**Sieger:** Unter den zahlungsfähigen Teams nach allen gewählten Geschäftsjahren gewinnt die niedrigste **kumulierte** CO₂e-Menge. Bei Gleichstand entscheidet das Kapital. Die aktuellen jährlichen CO₂e sind eine zusätzliche Kennzahl.

## 4. Technik, Sicherheit und Grenzen

- **Backend:** reines Node.js (`http`, `crypto`, `fs`), **keine npm-Abhängigkeiten** oder verdächtigen Launcher-EXEs.
- **Frontend:** HTML/CSS/JavaScript, keine externen CDN-Verbindungen.
- Raumcodes erlauben den Beitritt, eine getrennte, zufällige **Spielerkennung** erlaubt Aktionen. Nur die Spielleitung kann das Spiel starten und Emissionsparameter ändern.
- Keine Registrierung oder zentrale Benutzerverwaltung. Zugangscodes und Spielerdaten werden in lokal gespeicherten Server-JSON-Dateien gehalten. Dateien aus `storage/` privat halten und regelmäßig sichern; **nicht in öffentliche Git-Repositories hochladen**. Der Browser speichert die eigene Kennung lokal.
- Das ist ein **Lehr-/Planspiel-Prototyp**, kein kommerziell gehärteter Online-Gamingdienst. Für öffentliche Dauerbereitstellung sind zusätzliche Maßnahmen wie Authentifizierung, Überwachung, Rate-Limiting und Backups zu empfehlen.
- Der Server muss während des Spiels erreichbar bleiben. Verlässt ein Teilnehmer seinen Platz dauerhaft, kann dieser Zug ohne dessen Kennung nicht abgeschlossen werden; bei einem Abbruch mit demselben Browser wieder einsteigen.
- Die Emissionsparameter sind Modellannahmen der bereitgestellten Excel-Arbeitsmappe. Fachlich mögliche Doppelzählungen, z. B. bei mehreren Transport- oder Energiemaßnahmen, müssen gegebenenfalls manuell bereinigt werden.
- Die Version ersetzt keine regulatorische CO₂-Bilanzierung.

## 5. Änderungen / Entwicklung

| Datei | Inhalt |
|---|---|
| `engine.js` | Berechnungsregeln, alle 20 Ereignisformeln, Investitionen, Audit und Zugberechtigung |
| `server.js` | HTTP-API, Räume, Authentifizierung, Speicherung und Netzwerkserver |
| `public/game-data.json` | Spielfeldtexte, sechs Entscheidungen, Karteninformationen und 41 Ereignisparameter |
| `public/client.js` | Oberfläche, Raumeintritt, Synchronisierung, Animationen, Statistik |
| `public/style.css` | Layout für PC und Smartphone |
| `public/img/01.svg` … `40.svg` | Illustrationen der 40 Spielfelder |
| `public/logo-fh-ooe.png` | Von der Projektgruppe bereitgestelltes Logo |
| `storage/` | **private** Spielstände (nicht veröffentlichen) |

Tests mit `npm test` ausführen. Node.js ist die einzige Laufzeitvoraussetzung des Servers.

## 6. Hinweise zur V2

Die fachlichen Berechnungen und Karten entsprechen der bisherigen **CO₂ Factory V2**. Der Mehrspieler-Prototyp führt einen zentralen Spielstand auf dem Server; ältere lokale V2-JSON-Spielstände werden **nicht automatisch importiert**. Die bisherige Offline-HTML-Version kann weiterhin separat genutzt werden.
