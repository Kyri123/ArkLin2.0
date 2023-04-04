if [ "$(whoami)" != "steam" ]; then
        echo "Script must be run on steam user!"
        exit 1
fi

cd ~/KAdmin/kadmin-arklin2

export DOCKER_UID="$(id -u)"
export DOCKER_GID="$(id -g)"

echo "Stoppe Docker..."
docker compose down

echo "Setzte Rechte..."
chmod 777 -R ./sh
chmod 777 -R ./mount/config
chmod 777 ./mount/Server
chmod 777 ./mount/Backups
chmod 777 -R ./mount/PanelLogs
chmod 777 -R /etc/arkmanager/

echo "Starte Docker..."
docker compose up -d --build