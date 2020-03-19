# Installation als Debian Service

Raspberry Pi Images basieren oft auf Debian. Hier wird erläutert wie man den Analyzer als Systemd-Service unter Strech installieren kann.

1. **Node.js installieren**

    Falls noch nicht vorhanden wird zuerst curl installiert, anschließend Node.js (Version 12).
    
    ```bash
    sudo apt-get update
    sudo apt-get install curl
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
    
    Nun sollte `node` und `npm` vorhanden sein
    ```bash
    # node -v
    v12.16.1
    # npm -v
    v6.13.4
    ```

1. **AskSin Analyzer XS installieren**

    Die Installation erfolgt über npm als "global" womit die ausführbare Datei `asksin-analyzer-xs` direkt zur Verfügung steht.

    ```bash
    sudo npm install -g --unsafe asksin-analyzer-xs 
    ```

1. **Benutzer anlegen**

    Aus Sicherheitsgründen legt man einen eigenen Benutzer an unter dem der Analyzer später betrieben wird.

    ```bash
    sudo useradd -M -N -r -s /bin/false -c "AskSin Analyzer user" -G dialout analyzer
    ```
    
    Der Benutzer muss das UART-Device öffnen können. Je nach Anschlussvariante `/dev/ttyUSB0`, `/dev/ttyS1` oder ähnlich.
    
    ```bash
    ls -l /dev/ttypUSB0
    crw-rw---- 1 root dialout 4, 65 Mär 14 10:43 /dev/ttyUSB0
    ```
    
    In der obigen beispielhaften Ausgabe sieht man, dass `ttyUSB0` der Gruppe `dialout` angehört welche wir beim Erstellen des Users mit angegeben habe.

1. **Datenverzeichnis erstellen**

    Für die persistente Speicherung der Konfiguration und der Nutzdaten wird ein Verzeichnis anlegen mit entsprechenden Berechtigungen. Dies könnte man auch auf eine SD-Karte auslagern.
  
    ```bash
    sudo mkdir -p /opt/analyzer
    sudo chown analyzer /opt/analyzer
    ```

1. **Systemd Unit erstellen**

    Da der Analyzer als Systemdienst betrieben werden soll wird ein Systemd Unit File erstellt unter `/etc/systemd/system/analyzer.service` mit folgendem Inhalt:
    
    ```ini
    [Unit]
    Description=Analyzer for radio telegrams in a HomeMatic environment
    Documentation=https://github.com/psi-4ward/AskSinAnalyzerXS
    After=network.target
    
    [Service]
    Environment="PORT=8088"
    ExecStart=/usr/local/bin/asksin-analyzer-xs -d /opt/analyzer
    Type=simple
    User=analyzer
    Restart=on-failure
    
    [Install]
    WantedBy=multi-user.target
    ```
    
    Ggf. liegt die ausführbare `asksin-analyzer-xs` Datei auch nur unter `/user/bin`. Dies kann mit `which asksin-analyzer-xs` überprüft werden.
    
    In diesem Unit-File gibt die Env-Vart `PORT` den Port für den Analyzer an. Dieser muss aufgrund von Sicherheitsbestimmungen über 1024 sein (privileged ports). Das Argument `-d` gibt den Speicherort der persistenten Daten an, dieser kann natürlich nach belieben angepasst werden. Wichtig ist nur, dass der Benutzer `analyzer` hier Lese- und Schreibrechte hat.

1. **Service aktivieren und starten**

    Zum Schluss wird der Service gestartet und der autostart beim Booten enabled.
    
    ```bash
    # AskSin Analyzer Service starten
    sudo systemctl start analyzer 
    # Status des Service überprüfen
    sudo systemctl status analyzer
    # Autostart nach dem Bootvorgang aktivieren
    sudo systemctl enable analyzer
    # Autostart ggf. deaktivieren
    sudo systemctl disable analyzer
    ```

    Die Logs von Systemd Services landen standardmäßig bei journald:
    ```bash
    sudo journalctl -u analyzer
