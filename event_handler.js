////////////// TAUPI 4.0 @ Shelly ///// Script taupi_event_handler_checkBlu ////////////////////
// Diese Software und die zugehörigen Skripte unterliegen der Boost Software License - Version 1.0 - August 17th, 2003
// copyright by boeserbob
// Fragen an quirb@web.de
// Dokumentation und aktuelle Versionen unter https://github.com/BoeserBob/Taupi-4.0
// Getestet mit Firmware 
// Shelly Plus Plug S 20241011-114442/1.4.4-g6d2a586
// Shelly BLU HT 1.0.16
// 
// Der Taupunktlüfter besteht aus vier skripten:
//     einem event handler (taupi_event_handler_checkBlu)
//     einer Lüftersteuerung (Luefter_schalten)
//     einem bluetooth "Empfänger" (ble-shelly-blu, der ist nicht von mir sondern ein fertiges Beispiel von shelly)
//     einem Script zur Anlage der KVS, der nur einmal aufgerufen werden muss (KVS_anlegen).
// 
// Dieser Script hier ist der event handler, er lauscht auf die vom bluetooth Empfänger geworfenen events der H&T Blu Sensoren.
// er liest die Daten für Temperatur und Feuchtigkeit aus den JSON Paketen aus
// er berechnet den Taupunkt
// er speichert notwendige Daten in den dauerhaften KVS Speicher des Shellys.
//
//
// 
//////// Hier musst du die Adresse der H&T Blu Sensoren eingeben
var sensor_aussen="7c:c6:b6:57:99:45";
var sensor_innen="7c:c6:b6:61:e8:11";
//////////////////////////////// ab hier nichts mehr ändern ///////////////////

var taupunkt_aussen;
var taupunkt_innen;
var temperatur_innen;
var temperatur_aussen;
var humidity_innen;
var humidity_aussen;


function checkBlu(event) { 
  print("check blu aufgerufen");
  print(JSON.stringify(event));

// Abfangen fremde events
let eventinhalt = (JSON.stringify(event)); 
let suchbegriff = "shelly-blu"; 
let index = eventinhalt.indexOf(suchbegriff); 
if (index !== -1) { 
  print("Suchbegriff gefunden an Position: " + index); 
  } 
  else { 
    print("Suchbegriff nicht gefunden, fremden event abgefangen");
    return;
    }

// ende if abfangen fremder events
  
 print(event.info.data.address);
   
  // ist es der äußere Sensor? 
  if(event.info.data.address!=sensor_aussen) { 
      print("sensor aussen erkannt -------------------------------");
      var taupunkt_aussen = taupunkt(event.info.data.temperature,event.info.data.humidity);
      var temperatur_aussen = (event.info.data.temperature);
      var humidity_aussen = (event.info.data.humidity);      
      print("aussen feuchte, temperatur, taupunkt:");
      print(event.info.data.humidity);
      print(event.info.data.temperature);
      print(taupunkt_aussen);
      
      // taupunkt in KVS wegspeicher
      Shelly.call("KVS.Set", {
      "key": "taupunkt_aussen", "value": taupunkt_aussen}
      );

 } // ende if aussen

// ist es der innere sensor?
  if (event.info.data.address!=sensor_innen) {
      print("sensor innen erkannt ----------------------------------------------");
      let taupunkt_innen = taupunkt(event.info.data.temperature,event.info.data.humidity);
      let temperatur_innen = (event.info.data.temperature);
      let humidity_innen = (event.info.data.humidity);
      print("innen feuchte, temperatur, taupunkt:");
      print(event.info.data.humidity);
      print(event.info.data.temperature);
      print(taupunkt_innen);
      Shelly.call("KVS.Set", {
      "key": "taupunkt_innen", "value": taupunkt_innen}
      );
      Shelly.call("KVS.Set", {
      "key": "temperatur_innen", "value": temperatur_innen}
      );
      Shelly.call("KVS.Set", {
      "key": "humidity_innen", "value": humidity_innen}
      );
 } // // ende if innen


} // Ende Funktion check blu

// Taupunktberechnung ///////////////////////////////////////////////////////////////////////
function taupunkt(temperatur, luftfeuchtigkeit) {
    var a = 17.27;
    var b = 237.7;
    var c = 21.875;
    var d = 265.5;
     
    // Berechnung für über 0°C
    if (temperatur >= 0) {
        var alpha = (a * temperatur) / (b + temperatur) + Math.log(luftfeuchtigkeit / 100);
        var taup = (b * alpha) / (a - alpha);
        print ("taupunkt für über 0");
        print (taup);
        return taup;
    }
    // Berechnung für unter 0°C
    if (temperatur < 0) {
        var alpha = (c * temperatur) / (d + temperatur) + Math.log(luftfeuchtigkeit / 100);
        var taup = (d * alpha) / (c - alpha);
        print ("taupunkt für unter 0");
        print (taup);
        return taup;
    }
} 

// Ende Taupunktberechnung ///////////////////////////////////////////////////////////////////////

Shelly.addEventHandler(checkBlu); // registriert checkEvent als EventHandler
