1. Den Analyzer anstecken

2. Prüfen ob und wie der USB serial converter erkannt wird. Mit dem Befehl `dmesg`.
   ```text
   $ dmesg
   ...
   usb 1-3: New USB device found, idVendor=0403, idProduct=6001, bcdDevice= 6.00
   usb 1-3: New USB device strings: Mfr=1, Product=2, SerialNumber=3
   usb 1-3: Product: FT232R USB UART
   usb 1-3: Manufacturer: FTDI
   usb 1-3: SerialNumber: 00301O3O
   ```
   Wichtig sind hier vor allem `idVendor` und `idProduct`, auch kann man einen Blick auf `SerialNumber` werfen.

3. UDEV-Rule erstellen
   Neue Datei erstellen: `/etc/udev/rules.d/80-AskSinAnalyzer.rules` mit folgendem Inhalt wobei idVendor und idProduct sowie serial entsprechend der Ausgabe von `dmesg` angepasst werden muss. Andere USB-Serial-Adapter wie der CH340 haben **keine** Serial, dann wird dieser Filter aus der Rule gestrichen.
   ```text
   SUBSYSTEM=="tty", ATTRS{idVendor}=="0403", ATTRS{idProduct}=="6001", ATTRS{serial}=="00301O3O", GROUP="users", MODE="0666", SYMLINK+="ttyUSB_AskSinAnalyzer"
   ``` 
   Anschließend wird die UDEV-Rule geladen: `udevadm control --reload-rules` und die Trigger ausgeführt: `udevadm trigger`. Nun sollte das neue Device angelegt worden sein:
   ```bash
   $ ls -l /dev/ttyUSB*
   crw-rw-rw- 1 root uucp 188, 0 31. Aug 19:54 /dev/ttyUSB0
   crwxrwxrwx 1 root root      7 31. Aug 19:54 /dev/ttyUSB_AskSinAnalyzer -> ttyUSB0
   ```
   Wichtig ist hier die ID von `188`.

4. Anpassung der LXC Config (zB: `/etc/pve/nodes/proxmox/lxc/<id>.conf`)
   ```text
   lxc.cgroup.devices.allow: c 188:* rwm
   lxc.mount.entry: /dev/ttyUSB_AskSinAnalyzer dev/ttyUSB0 none bind,optional,create=file
   ```
   Im Container sollte nun `/dev/ttyUSB0` vorhanden sein welcher im Analyzer verwendet werden kann.

