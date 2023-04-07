if [ "$(whoami)" != "steam" ]; then
        echo "Script must be run on steam user!"
        exit 1
fi

BRANCH="$1"
echo "useBranch: $BRANCH"

export DOCKER_UID=$(id -u)
export DOCKER_GID=$(id -g)

cd ~/KAdmin/ArkLin2.0
echo "Stoppe Docker..."
docker compose down

git fetch --all
git reset --hard origin/$BRANCH

echo "Setzte Rechte..."
chmod 777 -R ./sh

./sh/start.sh