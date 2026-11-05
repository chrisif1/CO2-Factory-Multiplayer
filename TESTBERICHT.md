# Testbericht – V1.4, 05.11.2026

## Funktion

26 automatisierte Tests erfolgreich. Enthalten sind die bisherigen Regeltests sowie:
reine Spielleitung ohne Figur/Unternehmen/Spielerplatz, acht zusätzliche Unternehmen,
Spielstart nur durch die Spielleitung, blockierte Spielzüge für den Professor,
alternativer mitspielender Host, Entfernen des ersten Schülerplatzes,
HTTP-Zugriff und persistierte Rollen, neue Browserdateien und QR-Erzeugung.
Ein vollständiger Regeldurchlauf mit acht Unternehmen im Professorenmodus endet regulär;
die Spielleitung tritt in keinem Zug als Spieler auf.
Zusätzlich geprüft: Ausstieg während offener Entscheidung, Ausstieg außerhalb des eigenen Zugs,
Überspringen ausgeschiedener Unternehmen, kein weiterer Spielzug für Ausgestiegene,
Spielende nach Ausstieg aller Teilnehmer und Freigabe von Lobbyplätzen.

## Browserprüfung

Ein Professorenraum wurde über die Oberfläche erstellt. Ein Teilnehmer trat über genau den
im QR-Code enthaltenen LAN-Link bei, weitere Testunternehmen wurden bis zur Vollbelegung ergänzt.
Ein Teilnehmer würfelte, öffnete sein Popup erneut, kaufte Photovoltaik und beendete den Zug.
Die reine Spielleitung konnte das Geschehen und Protokoll sehen, hatte keinen aktiven Würfelknopf
und erhielt kein automatisches Entscheidungspopup.
In einer getrennten Testpartie verließ die aktive Person eine offene Photovoltaik-Investition
über „Spiel verlassen“. Der Browser kehrte zur Startseite zurück. Der Server bestätigte den
Ausstieg, hatte keine offene Entscheidung mehr und gab sofort den nächsten Spieler zum Würfeln frei.
Der Würfelaufruf des nächsten Spielers war erfolgreich (HTTP 200).

## Darstellung

- 1366 × 768: Professorenbrett mit allen 40 Feldern und acht Unternehmen.
- 1024 × 768: Tabletansicht, alle 40 Felder ohne Seiten- oder Brettscrollen.
- 844 × 390: Handyquerformat, alle Felder und alle acht Unternehmenskarten vollständig im Fenster; Namen und Kapitalzeilen auf Überlauf geprüft.
- 668 × 375: kleine Handyansicht einschließlich Spielerfiguren und Bedienelementen geprüft.
- 568 × 320: alle 40 Felder und acht Unternehmenskarten vollständig im Fenster.
- Investitionspopup im Handyquerformat, Schließen, Wiederöffnen und Auswahl geprüft.
- Unternehmen-/Protokollübersicht lässt sich öffnen und schließen.
- Keine abschließenden Browser-Konsolenfehler.

Auf kleinen Bildschirmen werden Feldnamen gekürzt; vollständige Texte stehen im antippbaren Popup.
Es handelt sich um Browseransichten der genannten Größen, nicht um Tests auf separaten physischen Geräten.

## QR-Code

Der tatsächlich in der Lobby angezeigte SVG-QR-Code wurde gerastert und unabhängig mit jsQR
dekodiert. Ergebnis stimmt exakt mit dem Einladungslink überein; beim lokalen Test enthielt er
die LAN-Adresse statt localhost. Der Browser konnte diesen Link erfolgreich öffnen.

Die Render-Live-Version wurde nicht verändert. Die neue Version wurde lokal geprüft.
