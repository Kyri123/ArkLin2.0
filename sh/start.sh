if [ "$(whoami)" != "steam" ]; then
        echo "Script must be run on steam user!"
        exit 1
fi

cd ~/KAdmin/ArkLin2.0

export DOCKER_UID="$(id -u)"
export DOCKER_GID="$(id -g)"

echo "Stoppe Docker..."
docker compose down

./sh/folder.sh

echo "Starte Docker..."
docker compose up -d --build