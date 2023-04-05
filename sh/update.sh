if [ "$(whoami)" != "steam" ]; then
        echo "Script must be run on steam user!"
        exit 1
fi

BRANCH="$1"

export DOCKER_UID=$(id -u)
export DOCKER_GID=$(id -g)

cd ~/KAdmin/ArkLin2.0
docker compose down

git stash 
git pull https://github.com/Kyri123/ArkLin2.0.git $BRANCH

echo "Setzte Rechte..."
chmod 777 -R ./sh
chmod 777 -R ./mount/config
chmod 777 ./mount/Server
chmod 777 ./mount/Backups
chmod 777 -R ./mount/PanelLogs
chmod 777 -R /etc/arkmanager/

chmod 777 -R ./sh
./sh/start.sh