# Taupi-4.0 - BETA and growing ...
A dewpoint triggered ventilaton system based on a Shelly Plug S Plus and two Shelly H+T Blu humidity and temperature sensors 

Inspiriert durch den phänomenalen Taupunktlüfter aus der Zeitschrift MAKE 1/2022 ....
- geplagt von grässlichen Versuchen mit dem Arduino (Version 1: grrr, kein WLAN)
- gequält von lausigen DHT22 Sensoren, selbst auf einem ESP8266 programmiert (Version 2: Kotz, DHT22 und EMV...)
- gelangweilt von ESP easy, den rules und den BME280 (Version 3: damit war der Taupunktlüfter an ein einem Nachmittag fertig).
  
... habe ich als Version 4.0 eine idiotensichere Variante ohne Löten, ohne Kabel zu den Sensoren, ohne 230V Basteleien zusammengestellt.

Warum auf einer Shelly Plug und nicht im coolen HomeAssitant oder IOBroker oder sowas? Das ist doch Steinzeit.

  Damit es als Insel mit minimalem Aufwand fernab von WLANs und Routern laufen kann.
  Und weils geht.

Was ist die Aufgabe des Taupunktlüfters? 
  Der Taupunktlüfter soll die Luftfeuchtigkeit in einem Raum (meist Keller) durch gesteuerte Belüftung möglichst weit absenken. 
  Den Begriff Taupunkt erkläre ich nicht, die Kollegen von der MAKE erklären das Prinzip perfekt.

Wie macht der Lüfter das? 
  Der Taupunktlüfter lüftet nur dann, wenn die Außenluft (deutlich) weniger Wasser als die Innenluft enthält.

Woraus besteht das System?
  - zwei kabellosen Temperatur und Feuchtigkeitssensoren Shelly H+T Blu (einer für innen, einer für außen)
  - einer Shelly Plug S Plus (schaltet den Lüfter, ist die Plattform für die Skripte)
  - einem Lüfter (230V Lüfter mit Stecker, 150mm, 15W aufwärts; gibts in Massen bei ebay)
  - mehreren Skripte, die  auf der Shelly Plug laufen
  - einem Skript zur Initialisierung des KVS Variablenspeichers im Shelly Plug

Wie wird installiert: Film folgt. 
Kurzvesion: BT-Sensoren mit Shelly Plug koppeln, Skripte (Fusion, BLE und KVS) installieren, KVS Script starten und wieder löschen, Skripte auf automatischen Start stellen, Adressen der BT-Sensoren raussuchen -> 

Offene Themen sind im Backlog dokumentiert.

P.S.: ich habe wenig Ahnung von Programmieren, deshalb ist einiges recht rustikal gelöst.
Anregungen ud Korrekturen gerne, das Projekt wird sicher wachsen :-)
Aber es hat Spass gemacht.
