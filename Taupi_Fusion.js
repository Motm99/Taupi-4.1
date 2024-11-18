////////////// TAUPI 4.0 @ Shelly ///// Script taupi_event_handler_checkBlu ////////////////////
// Diese Software und die zugehörigen Skripte unterliegen der Boost Software License - Version 1.0 - August 17th, 2003
// copyright by boeserbob
// Fragen an quirb@web.de
// Dokumentation und aktuelle Versionen unter https://github.com/BoeserBob/Taupi-4.0
// Getestet mit Firmware 
// Shelly Plus Plug S 20241011-114442/1.4.4-g6d2a586
// Shelly BLU HT 1.0.16
// 
// Der Taupunktlüfter besteht aus folgenden skripten:
//     event handler und Lüftersteuerung (Taupi_Fusion_script)
//     einem bluetooth "Empfänger" (ble-shelly-blu, der ist nicht von mir sondern ein fertiges Beispiel von shelly)
//     einem Script zur Anlage der KVS, der nur einmal aufgerufen werden muss (KVS_anlegen).
// 
// Dieser Script hier ist der event handler + Lüftersteuerung, er lauscht auf die vom bluetooth Empfänger geworfenen events der H&T Blu Sensoren.
// er liest die Daten für Temperatur und Feuchtigkeit aus den JSON Paketen aus
// er berechnet den Taupunkt
// er speichert notwendige Daten in den dauerhaften KVS Speicher des Shellys.
// er steuert den Lüfter an
//
//////// Hier musst du die Adresse der H&T Blu Sensoren eingeben
var sensor_aussen="7c:c6:b6:57:99:45";
var sensor_innen="7c:c6:b6:61:e8:11";
/////////////// Schaltparameter ///////////////
let taupunktschwelle = 2; // in °C = Differenz zwischen Taupunkt innen ud aussen, ab der der Lüfter einschaltet
let mindesttemperatur = 8; // in °C = unterhalb dieser Temperatur wird nicht gelüftet 
let mindesthumi = 50; // in % = unterhalb dieser Schwelle wird nicht mehr gelüftet
//////////////////////////////// ab hier nichts mehr ändern ///////////////////

var taupunkt_aussen;
var taupunkt_innen;
var temperatur_innen;
var temperatur_aussen;
var humidity_innen;
var humidity_aussen;

// Event Handler auswerten, diese Funktion schreibt die Messwerte und die berechneten Taupunkte in den KVS
function checkBlu(event) { 
  print("check blu aufgerufen");
  print(JSON.stringify(event));

 // abfangen fremder events
 if(event.component=="switch:0") { 
      print("fremden event abgefangen");
      return;
 } // ende if abfangen fremder events
  
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
      
      // taupunkt in KVS wegspeichern
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


} 
/////////////////////// Ende Funktion check blu //////////////////////

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

// Diese Funktion übernimmt das ein- und Ausschalten des Shelly //
function schalten(taupunkt_innen,taupunkt_aussen,temperatur_innen,humidity_innen) {
 print("schalten_aufgerufen ");

   if (temperatur_innen > mindesttemperatur && humidity_innen > mindesthumi) {
    if (taupunkt_innen > taupunkt_aussen + taupunktschwelle) {
      print("lüfter einschalten ");
      Shelly.call("Switch.Set", {id:0, on:true}); 
      } else {
        print("lüfter ausschalten");
      Shelly.call("Switch.Set", {id:0, on:false});;
      }
      }
    else {
        print("lüfter ausschalten weil zu kalt oder zu trocken");
      Shelly.call("Switch.Set", {id:0, on:false});
    }

}


// Diese Funktion 
function kvsGet(key1,key2,key3,key4) {
Shelly.call(
        "KVS.get",
        { "key": key1 },
        function (result) {
        taupi_innen = result.value;
        }
    );
    Shelly.call(
        "KVS.get",
        { "key": key2 },
        function (result) {
        taupi_aussen = result.value;
        }
    );
        Shelly.call(
        "KVS.get",
        { "key": key3 },
        function (result) {
        temp_innen = result.value;
        }
    );
        Shelly.call(
        "KVS.get",
        { "key": key4 },
        function (result) {
        humi_innen = result.value;
        }
    );
    
}

//kvsGet("taupunkt_innen","taupunkt_aussen","temperatur_innen","humidity_innen");
  let taupi_innen;
  let taupi_aussen;
  let temp_innen;
  let humi_innen;
  
Timer.set(5000, true, function(ud) { //Start Timerschleife
  kvsGet("taupunkt_innen","taupunkt_aussen","temperatur_innen","humidity_innen");
  print("Timerergebnis:"); 
  print(taupi_innen);
  print(taupi_aussen);
  print(temp_innen);
  print(humi_innen);
  schalten(taupi_innen,taupi_aussen,temp_innen,humi_innen);
     
 } // Ende Timerschleife
 , null);


// Verzögerter Start des Event Handlers, um die ganzen mir nicht bekannten Events beim Start des Shellys die ich noch nicht abfangen kann abzuwarten. 
function verzoegerter_start(millisekunden) {
    Timer.set(millisekunden, false, function() {
        print("Pause beendet nach " + millisekunden + " Millisekunden.");
        Shelly.addEventHandler(checkBlu); // registriert checkEvent als EventHandler
         });
}

// Beispielaufruf der Pause-Funktion mit einer Verzögerung von 3000 Millisekunden (3 Sekunden)
verzoegerter_start(10000);
