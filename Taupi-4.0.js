////////////// TAUPI 4.0 @ Shelly //////////////
// copyright by boeserbob und holzachr
// Fragen an quirb@web.de
// Dokumentation und aktuelle Versionen unter https://github.com/BoeserBob/Taupi-4.0
//
// Dieses Skript schaltet den Lüfter über den Schalter des Shellys auf dem er installiert ist.
//   - Es fängt Messwert-Events von BLE-Sensoren auf.
//   - Wenn die Messwerte von Innen- und Außen-Sensor stammen, werden aus Temperatur und Luftfeuchte die jeweiligen Taupunkte berechnet.
//   - Eine Timerschleife überprüft regelmäßig, ob alle Einschaltbedingungen fuer den Lüfter erfüllt sind:
//         - Wenn der Taupunkt innen größer als der Taupunkt außen + einem Schwellwert ist wird der Lüfter eingeschaltet, sonst ausgeschaltet.
//         - Wenn die Innentermperatur unter 10 °C und die Innenraumfeuchte unter 50 % ist wird der Lüfer ausgeschaltet.
// 
// Die nachfolgenden Zeilen müssen angepasst werden, mindestens die MAC-Adressen für "sensor_aussen" und "sensor_innen".
// Die Schaltkonfiguration kann bei Bedarf angepasst werden.
//

//========== Sensor-Konfiguration ==========
var sensor_aussen="7c:c6:b6:74:9a:2e";
var sensor_innen="0c:ef:f6:02:c2:dd";
//========== Schalt-Konfiguration ==========
var taupunktschwelle   = 2;                  // [°C] Lüfter einschalten wenn TPinnen > (TPaussen + taupunktschwelle)...
var mindesttemperatur  = 10;                 // [°C] ...und Tinnen > mindesttemperatur...
var mindesthumi        = 50;                 // [%]  ...und RHinnen > mindesthumi
var schaltzeit         = 60;                 // [s]  Schaltbedingung prüfen alle X Sekunden
//==========================================



var taupunkt_aussen;
var taupunkt_innen;
var temperatur_innen;
var temperatur_aussen;
var humidity_innen;
var humidity_aussen;

var luefterstatus = null;  // Merkt sich letzten Schaltzustand, um unnötige Schaltvorgänge zu vermeiden

// Taupunktberechnung
function taupunkt(T, RH) {
  var a = (T >= 0) ? 17.27 : 21.875;
  var b = (T >= 0) ? 237.7 : 265.5;
  var alpha = (a * T) / (b + T) + Math.log(RH / 100);
  return (b * alpha) / (a - alpha);
}

// Lüftersteuerung
function schalten() {
  // Sicherheitsprüfung: Sind alle benötigten Werte vorhanden?
  if (typeof taupunkt_innen === "undefined" ||
      typeof taupunkt_aussen === "undefined" ||
      typeof temperatur_innen === "undefined" ||
      typeof humidity_innen === "undefined")
  {
    print("Nicht alle Sensorwerte vorhanden – Schaltung übersprungen.");
    return;
  }

  let einschalten;

  if (!luefterstatus) {
    // Lüfter ist AUS → prüfen ob einschalten
    einschalten = (
      temperatur_innen > mindesttemperatur &&
      humidity_innen > mindesthumi &&
      taupunkt_innen > taupunkt_aussen + taupunktschwelle
    );
  } else {
    // Lüfter ist EIN → prüfen ob ausschalten (mit Hysterese)
    einschalten = !(taupunkt_innen < taupunkt_aussen + taupunktschwelle / 2);
  }

  if (einschalten !== luefterstatus) {
    print("Lüfter " + (einschalten ? "EIN" : "AUS"));
    Shelly.call("Switch.Set", { id: 0, on: einschalten });
    luefterstatus = einschalten;
  } else {
    print("Keine Änderung am Lüfterstatus. Lüfter ist " + (einschalten ? "EIN." : "AUS."));
  }
}

// Überprüft den tatsächlichen Status des Relais
function checkSwitchStatus() {
  print("----- Überprüfung des tatsächlichen Lüfterstatus -----");
  Shelly.call(
    "Switch.GetStatus",
    { id: 0 },
    function (result, error_code, error_message) {
      if (error_code === 0) {
        if (result.output !== luefterstatus) {
          print("ACHTUNG: Der tatsächliche Schalterstatus stimmt nicht mit dem Skriptstatus überein.");
          print("Korrigiere Skriptstatus von", luefterstatus, "auf", result.output);
          luefterstatus = result.output;
        } else {
          print("Tatsächlicher Status stimmt mit Skriptstatus überein.");
        }
      } else {
        print("Fehler beim Abrufen des Schalterstatus:", error_message);
      }
    }
  );
}

// Event-Verarbeitung
function checkBlu(event) {
  if (event.address === sensor_aussen) {
    temperatur_aussen = event.temperature;
    humidity_aussen   = event.humidity;
    taupunkt_aussen   = taupunkt(event.temperature, event.humidity);
    print("Neue Werte für Außen:", temperatur_aussen, "°C,", humidity_aussen, "%, Tp:", taupunkt_aussen, "°C");
  } else if (event.address === sensor_innen) {
    temperatur_innen = event.temperature;
    humidity_innen   = event.humidity;
    taupunkt_innen   = taupunkt(event.temperature, event.humidity);
    print("Neue Werte für Innen:", temperatur_innen, "°C,", humidity_innen, "%, Tp:", taupunkt_innen, "°C");
  }
}

// Haupt-Timer für Steuerlogik
Timer.set(schaltzeit * 1000, true, function () {
  print("----- Steuerung alle", schaltzeit, "s -----");
  print("Innen: T =", temperatur_innen, "°C, RH =", humidity_innen, "%, Tp =", taupunkt_innen);
  print("Außen: T =", temperatur_aussen, "°C, RH =", humidity_aussen, "%, Tp =", taupunkt_aussen);
  schalten();
});

// Neuer Timer zur Statusüberprüfung alle 5 Minuten
Timer.set(300 * 100, true, checkSwitchStatus);

///////////////// BLE-Decoder ///////////////////////

// Der nachfolgende Code ist eine modifizierte Version von
// https://github.com/ALLTERCO/shelly-script-examples/blob/main/ble-shelly-blu.js
//
//   Copyright 2024 Shelly Europe
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0

const BTHOME_SVC_ID_STR = "fcd2";

const uint8 = 0;
const int8 = 1;
const uint16 = 2;
const int16 = 3;
const uint24 = 4;
const int24 = 5;

// The BTH object defines the structure of the BTHome data
const BTH = {
  0x00: { n: "pid", t: uint8 },
  0x01: { n: "battery", t: uint8, u: "%" },
  0x02: { n: "temperature", t: int16, f: 0.01, u: "tC" },
  0x03: { n: "humidity", t: uint16, f: 0.01, u: "%" },
  0x05: { n: "illuminance", t: uint24, f: 0.01 },
  0x21: { n: "motion", t: uint8 },
  0x2d: { n: "window", t: uint8 },
  0x2e: { n: "humidity", t: uint8, u: "%" },
  0x3a: { n: "button", t: uint8 },
  0x3f: { n: "rotation", t: int16, f: 0.1 },
  0x45: { n: "temperature", t: int16, f: 0.1, u: "tC" },
};

function getByteSize(type) {
  if (type === uint8 || type === int8) return 1;
  if (type === uint16 || type === int16) return 2;
  if (type === uint24 || type === int24) return 3;
  // Impossible as advertisements are much smaller;
  return 255;
}

// Functions for decoding and unpacking the service data from Shelly BLU devices
const BTHomeDecoder = {
  utoi: function (num, bitsz) {
    const mask = 1 << (bitsz - 1);
    return num & mask ? num - (1 << bitsz) : num;
  },
  getUInt8: function (buffer) {
    return buffer.at(0);
  },
  getInt8: function (buffer) {
    return this.utoi(this.getUInt8(buffer), 8);
  },
  getUInt16LE: function (buffer) {
    return 0xffff & ((buffer.at(1) << 8) | buffer.at(0));
  },
  getInt16LE: function (buffer) {
    return this.utoi(this.getUInt16LE(buffer), 16);
  },
  getUInt24LE: function (buffer) {
    return (
      0x00ffffff & ((buffer.at(2) << 16) | (buffer.at(1) << 8) | buffer.at(0))
    );
  },
  getInt24LE: function (buffer) {
    return this.utoi(this.getUInt24LE(buffer), 24);
  },
  getBufValue: function (type, buffer) {
    if (buffer.length < getByteSize(type)) return null;
    let res = null;
    if (type === uint8) res = this.getUInt8(buffer);
    if (type === int8) res = this.getInt8(buffer);
    if (type === uint16) res = this.getUInt16LE(buffer);
    if (type === int16) res = this.getInt16LE(buffer);
    if (type === uint24) res = this.getUInt24LE(buffer);
    if (type === int24) res = this.getInt24LE(buffer);
    return res;
  },

  // Unpacks the service data buffer from a Shelly BLU device
  unpack: function (buffer) {
    // Beacons might not provide BTH service data
    if (typeof buffer !== "string" || buffer.length === 0) return null;
    let result = {};
    let _dib = buffer.at(0);
    result["encryption"] = _dib & 0x1 ? true : false;
    result["BTHome_version"] = _dib >> 5;
    if (result["BTHome_version"] !== 2) return null;
    //can not handle encrypted data
    if (result["encryption"]) return result;
    buffer = buffer.slice(1);

    let _bth;
    let _value;
    while (buffer.length > 0) {
      _bth = BTH[buffer.at(0)];
      if (typeof _bth === "undefined") {
        print("BTH: Unknown type");
        break;
      }
      buffer = buffer.slice(1);
      _value = this.getBufValue(_bth.t, buffer);
      if (_value === null) break;
      if (typeof _bth.f !== "undefined") _value = _value * _bth.f;

      if (typeof result[_bth.n] === "undefined") {
        result[_bth.n] = _value;
      }
      else {
        if (Array.isArray(result[_bth.n])) {
          result[_bth.n].push(_value);
        }
        else {
          result[_bth.n] = [
            result[_bth.n],
            _value
          ];
        }
      }

      buffer = buffer.slice(getByteSize(_bth.t));
    }
    return result;
  },
};

// Saving the id of the last packet, this is used to filter the duplicated packets
let lastPacketId = 0x100;

// Callback for the BLE scanner object
function BLEScanCallback(event, result) {
  // Exit if not a result of a scan
  if (event !== BLE.Scanner.SCAN_RESULT) {
    return;
  }

  // Exit if service_data member is missing
  if (typeof result.service_data === "undefined" ||
      typeof result.service_data[BTHOME_SVC_ID_STR] === "undefined") {
    return;
  }

  let unpackedData = BTHomeDecoder.unpack(result.service_data[BTHOME_SVC_ID_STR]);

  // Exit if unpacked data is null or the device is encrypted
  if (unpackedData === null ||
      typeof unpackedData === "undefined" ||
      unpackedData["encryption"]) {
    print("Error: Encrypted devices are not supported");
    return;
  }

  // Exit if the event is duplicated
  if (lastPacketId === unpackedData.pid) {
    return;
  }

  lastPacketId = unpackedData.pid;

  unpackedData.address = result.addr;

  checkBlu(unpackedData);
}

// Initializes the script and performs the necessary checks and configurations
function initBLE() {
  // Get the config of ble component
  const BLEConfig = Shelly.getComponentConfig("ble");

  // Exit if the BLE isn't enabled
  if (!BLEConfig.enable) {
    print("Error: The Bluetooth is not enabled, please enable it from settings");
    return;
  }

  // Check if the scanner is already running
  if (BLE.Scanner.isRunning()) {
    print("Info: The BLE gateway is running, the BLE scan configuration is managed by the device");
  }
  else {
    // Start the scanner
    const bleScanner = BLE.Scanner.Start({
        duration_ms: BLE.Scanner.INFINITE_SCAN,
        active: false  // Active scan means the scanner will ping back the Bluetooth device to receive all its data, but it will drain the battery faster
    });

    if(!bleScanner) {
      print("Error: Can not start new scanner");
    }
  }

  // Subscribe a callback to BLE scanner
  BLE.Scanner.Subscribe(BLEScanCallback);
}

initBLE();
