# AskSin Analyzer XS

[![latest release](https://img.shields.io/github/v/release/psi-4ward/AskSinAnalyzerXS)](https://github.com/psi-4ward/AskSinAnalyzerXS/releases/latest)
[![github downloads](https://img.shields.io/github/downloads/psi-4ward/asksinanalyzerxs/total.svg?color=%23a7a71f&label=github%20downloads)](https://somsubhra.com/github-release-stats/?username=psi-4ward&repository=AskSinAnalyzerXS) 
[![npm downloads](https://img.shields.io/npm/dt/asksin-analyzer-xs?color=%23a7a71f&label=npm%20downloads&)](https://www.npmjs.com/package/asksin-analyzer-xs)
[![Docker Pulls](https://img.shields.io/docker/pulls/psitrax/asksinanalyzer.svg?color=%23a7a71f&label=docker%20pulls)](https://hub.docker.com/r/psitrax/asksinanalyzer/)
[![build](https://api.travis-ci.org/psi-4ward/AskSinAnalyzerXS.svg?branch=master)](https://travis-ci.org/github/psi-4ward/AskSinAnalyzerXS/)

Funktelegramm-Dekodierer für den Einsatz in HomeMatic Umgebungen.

Betrieb ist sowohl als Desktop-Anwendung unter Windows, Mac und Linux möglich sowie auf Servern als Node.js-App oder über Docker.

Der AskSin Analyzer XS ist eine alternative Implementierung des [AskSinAnalyzer](https://github.com/jp112sdl/AskSinAnalyzer) ohne ESP32 und Display was die Umsetzung der Hardware vereinfacht. Es genügt ein AVR (ATMega 328P) mit CC1101 Funkmodul sowie ein USB-UART Adapter.

**Features**:
* Dekodieren von Homematic Telegrammen
* Darstellen der RSSI-Noise
* Langzeitsaufzeichnung der Telegramme
* Auflösen von Device-Namen über eine CCU oder FHEM
* [RedMatic support](https://github.com/psi-4ward/AskSinAnalyzerXS/blob/master/docs/NodeRED.md)

![AskSinAnalyzerXS-TelegramList](https://raw.githubusercontent.com/psi-4ward/AskSinAnalyzerXS/master/docs/AskSinAnalyzerXS-TelegramList.png)

## AskSinSniffer328P Hardware

Die Daten des AskSinSniffer328P werden über einen UART Schnittstelle an den AskSinAnalyzerXS übertragen und dort ausgewertet und visualisiert.

* Sniffer
  * Arduino Pro Mini 8Mhz 3.3V
  * CC1101 Funkmodul
* UART Schnittstelle
  * USB-UART Adapter (FTDI, CP2102, etc)   
  * Alternativ kann der Arduino auch [direkt an die UART GPIOs eines RaspberryPi](https://homematic-forum.de/forum/viewtopic.php?f=76&t=56395&start=70#p569429), Tinkerboard etc angeschlossen werden.

Der Aufbau folgt der [allgemeingültige Verdrahtung des Pro Mini mit dem CC1101 Funkmodul](https://asksinpp.de/Grundlagen/01_hardware.html#verdrahtung). Der Config-Taster findet keine Verwendung und die Status-LED ist optional. 

Alternativ funktioniert auch der [nanoCUL CC1101](https://www.nanocul.de/) mit [angepasstem GPIO Mapping](https://homematic-forum.de/forum/viewtopic.php?f=76&t=56395&start=10#p562580).

![AskSinAnalyzerXS-DutyCycle](https://raw.githubusercontent.com/psi-4ward/AskSinAnalyzerXS/master/docs/AskSinAnalyzerXS-DutyCycle.png)


## Installation

* [Latest release](https://github.com/psi-4ward/AskSinAnalyzerXS/releases/latest)
* [Develop release](https://github.com/psi-4ward/AskSinAnalyzerXS/releases/tag/0.0.0) 0.0.0

### AVR Sketch

Auf dem ATmega328P wird der [AskSinSniffer328P-Sketch](https://github.com/jp112sdl/AskSinAnalyzer/tree/master/AskSinSniffer328P) geflasht. Das Vorgehen ist auf [asksinpp.de](https://asksinpp.de/Grundlagen/) erläutert.

:point_up: **Achtung:** Die AskSinPP-Library 4.1.2 enthält noch nicht alle nötigen Funktionen für den Sniffer. Es ist der aktuelle [Master](https://github.com/pa-pa/AskSinPP/archive/master.zip) zu verwenden.

### Electron-App

Die Desktop-Anwendung steht für Windows, MacOS und Linux zum Download unter [Releases](https://github.com/psi-4ward/AskSinAnalyzerXS/releases) bereit.

Tipp: Der AskSinAnalyzerXS gibt einige Debug-Informationen auf der Commando-Zeile aus. Bei Problemen empfiehlt sich also ein Start über ein Terminal. (Bash, cmd).

### Node-App (npm)

Der AskSinAnalyzerXS kann auch als Node.js Anwendung betrieben werden was z.B. auf einem Server sinnvoll sein kann.

```bash
$ npm i -g asksin-analyzer-xs
$ asksin-analyzer-xs
Detected SerialPort: /dev/ttyUSB0 (FTDI)
Server started on port 8081
```

Die WebUI kann über den Browser auf [http://localhost:8081](http://localhost:8081) aufgerufen werden.

**Achtung:** Will man _wirklich_ ein npm-install als `root` durchführen ist der Parameter `--unsafe` nötig.

* Der develop-build des master-Branch ist **nicht** als npm-Paket verfügbar, kann aber trotzdem direkt installiert werden:
  ```bash
  npm i -g https://github.com/psi-4ward/AskSinAnalyzerXS/releases/download/0.0.0/asksin-analyzer-xs-0.0.0-node.tar.gz
  ```

* [Anleitung zur Installation als Debian-Service (z.B auf einem Raspberry Pi)](https://github.com/psi-4ward/AskSinAnalyzerXS/blob/master/docs/Install_as_Debian_Service.md)

### Docker

Der Analyzer XS ist auch als Docker-Image verfügbar. Der Device-Paramter ist entsprechend anzupassen.

```bash
docker run --rm --name analyzer -p 8081:8081 -v $PWD/data:/data --device=/dev/ttyUSB0 psitrax/asksinanalyzer
```


## Konfiguration

### Auflösung von Gerätenamen

Der AskSinSniffer328P sieht nur die _Device-Addresses_, nicht aber deren Seriennummern oder Namen. Damit die Adressen in Klartextnamen aufgelöst werden können muss eine DeviceListe von der CCU geladen werden wofür ein Script auf der CCU nötig ist. Siehe [AskSinAnalyzer CCU Untersützung](https://github.com/jp112sdl/AskSinAnalyzer/wiki/CCU_Unterst%C3%BCtzung).

Soll die Geräteliste von FHEM abgerufen werden ist in der `99_myUtils.pm` folgende Funktion einzufügen:

```ruby
sub printHMDevs {
  my @data;
  foreach my $device (devspec2array("TYPE=CUL_HM")) {
    my $snr = AttrVal($device,'serialNr','');
	$snr = "<Zentrale>" if AttrVal($device,'model','') eq 'CCU-FHEM';
	if( $snr ne '' ) {
	  my $name = AttrVal($device,'alias',$device);
	  my $addr = InternalVal($device,'DEF','0');
	  push @data, { name => $name, serial => $snr, address => hex($addr) };
	}
  }
  return JSON->new->encode( { created => time, devices => \@data } );
}
```

Im AskSinAnalyzerXS ist bei Verwendung vom FHEM die Option `Device-List Backend ist eine CCU` zu deaktivieren und als `Device-List URL` wird der Wert `http://fhem.local:8083/fhem?cmd={printHMDevs()}&XHR=1` eingetragen.

## Debugging / Fehlersuche

1. Der Analyzer gibt Debug-Informationen auf der Kommandozeile aus. 

    Windows-User müssen den `asksin-analyzer-xs-...-win.zip` Build laden und beim Start den Parameter `--enable-logging` anhängen.

2. Die Anwendung besitzt _DevTools_ die über das Menü `View -> Toggle Developer Tools` aufgerufen werden können.

## Lizenz

CC BY-NC-SA 4.0
