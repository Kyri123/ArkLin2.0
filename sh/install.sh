if [ "$(whoami)" != "steam" ]; then
        echo "Script must be run on steam user!"
        exit 1
fi

BRANCH="$1"

cd ~

echo "Create Folder and Clone ArkLIN2..."
mkdir KAdmin
cd KAdmin
git clone https://github.com/Kyri123/ArkLin2.0.git $BRANCH
cd ArkLin2.0

export DOCKER_UID="$(id -u)"
export DOCKER_GID="$(id -g)"

echo "Start Docker..."
docker compose up -d --build
docker compose down

echo "Setzte Rechte..."
chmod 777 -R ./sh
chmod 777 -R ./mount/config
chmod 777 ./mount/Server
chmod 777 ./mount/Backups
chmod 777 -R ./mount/PanelLogs
chmod 777 -R /etc/arkmanager/

echo "Bitte Konfiguriere nun die .json in ./mount/config/"