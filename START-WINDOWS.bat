@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js wird benoetigt. Bitte die LTS-Version von https://nodejs.org installieren.
 echo Danach START-WINDOWS.bat erneut doppelklicken.
 pause
 exit /b 1
)
echo CO2 Factory Multiplayer startet ...
echo Auf diesem PC http://localhost:3000 oeffnen.
echo Die Netzwerkadresse steht gleich unter dieser Meldung.
node server.js
pause

