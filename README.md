# KAdmin-ArkLIN2

Webbasiertes Admin Panel für Ark-Gameserver basierend auf [Arkmanager](https://github.com/arkmanager/ark-server-tools)

## Features

* Todo

## Geplante Features

* Ziehe [Click Up](https://app.clickup.com/30351857/v/l/s/90060096400)

## Wichtig

* *[Dev-Tree]* benutzten auf eigene *GEFAHR*: Debugs, Tests usw.
* Derzeitiger Status: *ALPHA*
* `Links`
* [Spenden?](https://www.paypal.com/cgi-bin/webscr?shell=_s-xclick&hosted_button_id=68PT9KPRABVCU&source=url)
* [Discord](https://discord.gg/ykGnw49)
* [Trello](https://trello.com/b/8cKrUtSV)

## Installation

. Installiere alle nötigen Module

* Installiere Docker + Docker Compose
* Installiere SteamCMD &amp; Arkmanager https://github.com/arkmanager/ark-server-tools
* Installiere ArkLin2: `su steam && curl -sL https://raw.githubusercontent.com/Kyri123/ArkLin2.0/main/sh/install.sh`
* Konfiguriere nun nacheinander alle dateien.
* Starte das Panel (als steam user) mit `~/KAdmin/ArkLin2.0/sh/start.sh`
* Docker compose wird automatisch das image erstellen und alle nötigen zusätze erstellen

## Update

`~/KAdmin/ArkLin2.0/sh/update.sh main` (statt main kann auch eine andere branch verwendet werden!)

*Wichtig: Ist das automatische update system aktiv wird das Panel dies automatisch tun. sofern SSH richtig eingestellt
ist!*

## Autostart einrichten

- Wird nicht mehr benötigt da Docker Compose dies alles für dich übernimmt solang `restart:` auf `always` ist!

## Standart Registrierung

* Ist kein standart Account erstellt ist der code `KAdmin-ArkLIN2`

## Benötigt

* Arkmanager
* SteamCMD
* **Docker + Docker Compose**

## Danke

* Danke an [*JetBrains*](https://www.jetbrains.com) für die bereitstellung der IDE's für die Entwicklung dieser
  Open-Source-Software
* Sowie allen Testern und jeden gemeldeten BUG!

## Links

* [Frontend made with *AdminLTE 3.1*](https://github.com/ColorlibHQ/AdminLTE)
* [Arkmanager](https://github.com/arkmanager/ark-server-tools)