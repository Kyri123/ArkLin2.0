# 🦕 KAdmin-ArkLIN2 🦕

Webbasiertes Admin Panel für Ark-Gameserver basierend auf [Arkmanager](https://github.com/arkmanager/ark-server-tools)

## 🌟 Features

* Todo

## 🔜 Geplante Features

* Ziehe [Click Up](https://app.clickup.com/30351857/v/l/s/90060096400)

## 🚩 Wichtig

* *[Dev-Tree]* benutzten auf eigene *GEFAHR*: Debugs, Tests usw.
* Derzeitiger Status: *ALPHA*
* `Links`
* [Spenden?](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=68PT9KPRABVCU&source=url)
* [Discord](https://discord.gg/ykGnw49)

## 🛠️ Installation

. Installiere alle nötigen Module

* Installiere Docker + Docker Compose
* Installiere SteamCMD &amp; Arkmanager https://github.com/arkmanager/ark-server-tools
* Installiere ArkLin2: `su steam` dann `curl -sL https://raw.githubusercontent.com/Kyri123/ArkLin2.0/main/sh/install.sh | bash -s -- --me`
* Konfiguriere nun nacheinander alle dateien.
* Starte das Panel (als steam user) mit `~/KAdmin/ArkLin2.0/sh/start.sh`
* Docker compose wird automatisch das image erstellen und alle nötigen zusätze erstellen

## 🛠️ Konfiguration

### `docker-compose.yml`

* volumes sind alle links zum Host. sollte hier ein Pfad abweichen (steam z.B. dann ändere dies hier) (host:docker)
* environment kann geändert werden wenn der Installationspfad sich ändern oder eine andere MONGODB verwendet werden soll
* ports sind die ports die nach außen gehen um sich mit dem Dashboard zu verbinden

### `/Kadmin/mount/config`

Dieser Ordner beinhaltet alle konfigurationen NICHT `/Kadmin/ArkLin2.0/config`!!!

* `API_BaseConfig.json` dies beinhaltet alle API relevanten Konfiguration
* `Dashboard_BaseConfig.json` dies beinhaltet alle Server relevanten Konfiguration
* `Debug.json` dies beinhaltet alle Debug relevanten Konfiguration
* `Tasks.json` dies beinhaltet alle Task relevanten Konfiguration (aufgaben die Zyklisch abgearbeitet werden)

## ⏫ Update

`~/KAdmin/ArkLin2.0/sh/update.sh main` (statt main kann auch eine andere branch verwendet werden!)

*Wichtig: Ist das automatische update system aktiv wird das Panel dies automatisch tun. sofern SSH richtig eingestellt
ist!*

## ⏫ Autostart einrichten

- Wird nicht mehr benötigt da Docker Compose dies alles für dich übernimmt solang `restart:` auf `always` ist!

## 🔐 Standart Registrierung

* Ist kein standart Account erstellt ist der code `KAdmin-ArkLIN2`

##  Benötigt

* Arkmanager
* SteamCMD
* **Docker + Docker Compose**

## 🤝 Danke

* Danke an [*JetBrains*](https://www.jetbrains.com) für die bereitstellung der IDE's für die Entwicklung dieser
  Open-Source-Software
* Sowie allen Testern und jeden gemeldeten BUG!

## 🌐 Links

* [Frontend made with *AdminLTE 3.1*](https://github.com/ColorlibHQ/AdminLTE)
* [Arkmanager](https://github.com/arkmanager/ark-server-tools)
