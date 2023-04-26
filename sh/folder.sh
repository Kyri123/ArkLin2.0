cd ~/KAdmin/ArkLin2.0

echo "Erstelle Ordner..."
mkdir -p -v ../mount/config
mkdir -p -v ../mount/Server
mkdir -p -v ../mount/Backups
mkdir -p -v ../mount/PanelLogs
mkdir -p -v ../mount/Logs
mkdir -p -v ../mount/mongodb

echo "Setzte Rechte..."
chmod 777 -R ./sh
chmod 777 -R ../mount/config
chmod 777 ../mount/Server
chmod 777 ../mount/Backups
chmod 777 ../mount/mongodb
chmod 777 ../mount/Logs
chmod 777 -R ../mount/PanelLogs
chmod 777 -R /etc/arkmanager/
