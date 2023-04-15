cd ~/KAdmin/ArkLin2.0

echo "Erstelle Ordner..."
mkdir -p ../mount/config
mkdir -p ../mount/Server
mkdir -p ../mount/Backups
mkdir -p ../mount/PanelLogs
mkdir -p ../mount/Logs
mkdir -p ../mount/mongodb

echo "Setzte Rechte..."
chmod 777 -R ./sh
chmod 777 -R ../mount/config
chmod 777 ../mount/Server
chmod 777 ../mount/Backups
chmod 777 ../mount/mongodb
chmod 777 ../mount/Logs
chmod 777 -R ../mount/PanelLogs
chmod 777 -R /etc/arkmanager/