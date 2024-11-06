# Taupi-4.0
A dewpoint triggered ventilaton system based on a Shelly Plug S Plus and two Shelly H+T Blu humidity and temperature sensors 

Inspiriert durch den phänomenalen Taupunktlüfter aus der Zeitschrift MAKE 1/2022 ....
... geplagt von grässlichen Versuchen mit dem Arduino (grrr, kein WLAN)
... gequält von lausigen DHT22 Sensoren (Kotz)
... inspieriert von ESP easy, den rules und BME280
Habe ich als Version 4.0 eine idiotensichere Variante ohne Löten, ohne Kabel zu den Sensoren, ohne 230V Basteleien zusammengestellt.

Was ist die Aufgabe des Taupunktlüfters? 
  Der Taupunktlüfter soll die Luftfeuchtigkeit in einem Raum durch gesteuerte Belüftung möglichst weit absenken. 
  Den Begriff Taupunkt erkläre ich nicht, die Kollegen von der MAKE erklären das Prinzip perfekt.

Wie macht der Lüfter das? 
  Der Taupunktlüfter lüftet nur dann, wenn die Außenluft (deutlich) weniger Wasser als die Innenluft enthält.

Woraus besteht das System?
  - zwei kabellosen Temperatur und Feuchtigkeitssensoren Shelly H+T Blu (einer für innen, einer für außen)
  - einer Shelly Plug S Plus (beinhaltet die Programme und schaltet den Lüfter)
  - einem Lüfter (230V Lüfter mit Stecker, 150mm, 15W aufwärts; gibts in Massen bei ebay)
  - 3 Skript, die auf dem Shelly Plug laufen
  - einem Skript zur Initialisierung des KVS Variablenspeichers im Shelly Plug

Wie wird installiert -> Film ansehen.

P.S.: ich habe wenig Ahnung von Programmieren, deshalb ist einiges recht rustikal gelöst.
Anregungen ud Korrekturen gerne, das Projekt wird sicher wachsen :-)
Aber es hat Spass gemacht.
