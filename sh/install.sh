if [ "$(whoami)" != "steam" ]; then
        echo "Script must be run on steam user!"
        exit 1
fi

BRANCH="$1"
echo "useBranch: $BRANCH"

cd ~

echo "Create Folder and Clone ArkLIN2..."
mkdir KAdmin
cd KAdmin
rm -R ArkLin2.0 -f
git clone https://github.com/Kyri123/ArkLin2.0.git ArkLin2.0
cd ArkLin2.0

git fetch --all
git reset --hard origin/$BRANCH

echo "Create mount folder on steam user"
mkdir -p -v ../mount/config
mkdir -p -v ../mount/Server
mkdir -p -v ../mount/Backups
mkdir -p -v ../mount/PanelLogs
mkdir -p -v ../mount/Logs
mkdir -p -v ../mount/mongodb

chmod 777 -R ./sh
chmod 777 -R ../mount/config
chmod 777 ../mount/Server
chmod 777 ../mount/Backups
chmod 777 ../mount/mongodb
chmod 777 ../mount/Logs
chmod 777 -R ../mount/PanelLogs
chmod 777 -R /etc/arkmanager/

mv docker-compose.yml.example docker-compose.yml

export DOCKER_UID="$(id -u)"
export DOCKER_GID="$(id -g)"

echo "Start Docker..."
docker compose up -d --build
docker compose down


echo "Bitte Konfiguriere nun die .json in ~/Kadmin/mount/config/"
