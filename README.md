# Taupi-4.0 - BETA and growing ...
Installationsanleitung: 
https://www.youtube.com/watch?v=BIO-l9YzWxA

Alles läuft noch nicht, offene Themen sind im Backlog dokumentiert.

A dewpoint triggered ventilaton system based on a Shelly Plug S Plus and two Shelly H+T Blu humidity and temperature sensors 

Getestet mit:
Shelly Plus Plug S, Gerätemodell SNPL-00112EU, Firmware-Version 20250730-063227/1.7.0-gbe7545d
Shelly BLU HT, Gerätemodell SBHT-003C, Firmware-Version 20250818-045415/v1.0.23@27f3ef9b

Inspiriert durch den phänomenalen Taupunktlüfter aus der Zeitschrift MAKE 1/2022 ....
- geplagt von grässlichen Versuchen mit dem Arduino (Version 1: grrr, kein WLAN)
- gequält von lausigen DHT22 Sensoren an einem selbst programmierten ESP8266 (Version 2: Kotz, DHT22 und EMV...)
- geflasht von ESP easy, Rules und den BME280 (Version 3: laaangweilig, damit war der Taupunktlüfter an einem Nachmittag fertig).
  
... habe ich als Version 4.0 eine idiotensichere Variante ohne Löten, ohne Kabel zu den Sensoren, ohne 230V Basteleien zusammengestellt.

Warum auf einer Shelly Plug und nicht im coolen HomeAssitant oder IOBroker oder sowas? Das ist doch Steinzeit.

- Damit es als Insel mit minimalem Aufwand fernab von WLANs und Routern laufen kann. 
- Und weils geht.

Was ist die Aufgabe des Taupunktlüfters?

- Der Taupunktlüfter soll die Luftfeuchtigkeit in einem Raum (meist Keller) durch gesteuerte Belüftung möglichst weit absenken.
- Den Begriff Taupunkt erkläre ich nicht, die Kollegen von der MAKE erklären das Prinzip perfekt.

Wie macht der Lüfter das? 

- Der Taupunktlüfter lüftet nur dann, wenn die Außenluft (deutlich) weniger Wasser als die Innenluft enthält.

Woraus besteht das System?

  - zwei kabellose Temperatur und Feuchtigkeitssensoren Shelly H+T Blu (einer für innen, einer für außen)
  - einer Shelly Plug S Plus (schaltet den Lüfter, ist die Plattform für die Skripte)
  - einem Lüfter (230V Lüfter mit Stecker, z.B. 150mm, 15W)
  - drei Skripte, die auf der Shelly Plug installiert werden
  - einem Skript zur einmaligen Initialisierung des KVS Variablenspeichers im Shelly Plug

Instalationsanleitung als Video:
https://www.youtube.com/watch?v=BIO-l9YzWxA

Kurzversion: 
- BT-Sensoren mit Shelly Plug koppeln.
- Firmwareupdates durchführen. 
- Skripte installieren (Lüfter_schalten, event_handler, BLE und KVS). 
- KVS Script starten und wieder löschen.
- Skripte auf automatischen Start stellen.
- Adressen der BT-Sensoren raussuchen und in event-handler anpassen.

P.S.: ich habe wenig Ahnung von Programmieren, deshalb ist einiges recht rustikal gelöst, aber es hat Spass gemacht.

Anregungen und Korrekturen gerne, das Projekt wird sicher wachsen :-)

