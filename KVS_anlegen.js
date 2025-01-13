////////////// TAUPI 4.0 @ Shelly ///// Script KVS anlegen /////////////////////////////
// Fragen an quirb@web.de
// Dokumentation und aktuelle Versionen unter https://github.com/BoeserBob/Taupi-4.0
// Lizenz und erforderliche Firmware siehe in den Kommentaren des Scripts "taupi_event_handler_checkBlu"
//
// Dieser Script legt die KVS Variablen an. Er muss nur einmal gestartet werden. 
//


let taupunkt_innen;
let taupunkt_aussen;
let temperatur_innen;
let humidity_innen;
let battery_aussen;
let battery_innen;

      Shelly.call("KVS.Set", {
      "key": "taupunkt_innen", "value": 99}
      );
      Shelly.call("KVS.Set", {
      "key": "temperatur_innen", "value": 99}
      );
      Shelly.call("KVS.Set", {
      "key": "taupunkt_aussen", "value": 99}
      );
      Shelly.call("KVS.Set", {
      "key": "humidity_innen", "value": 99}
      );
      Shelly.call("KVS.Set", {
      "key": "battery_aussen", "value": 01}
      );
      Shelly.call("KVS.Set", {
      "key": "battery_innen", "value": 01}
      );


