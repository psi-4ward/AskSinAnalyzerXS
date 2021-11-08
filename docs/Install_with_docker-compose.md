# Beispiel Konfiguration für Docker-Compose

Im gewünschten Zielpfad einfach eine ```docker-compose.yml``` anlegen.  
Folgenden Inhalt einfügen, ggf. muss der Port angepasst werden, falls unter diesem Port bereits ein Dienst läuft und das USB-Device sollte gemäß dem verwendeten Gerät ausgewählt werden.

```
version: '3.2'
services:
  asksinanalyzer:
    container_name: asksinanalyzer
    image: psitrax/asksinanalyzer
    restart: unless-stopped
    volumes:
      - ./data:/data
      - /run/udev:/run/udev:ro
    ports:
      - 8081:8081
    environment:
      - TZ=Europe/Berlin
    devices:
      # Make sure this matched your adapter location
      - /dev/ttyUSB1:/dev/ttyUSB1
```

Danach ```docker-compose pull``` und ```docker-compose up -d```  
Die Konfigurationsdaten und persistent gespeicherten Daten werden unter dem angegebenen Pfad (hier der Unterordner "./data") abgelegt.
