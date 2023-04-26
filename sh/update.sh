if [ "$(whoami)" != "steam" ]; then
        echo "Script must be run on steam user!"
        exit 1
fi

BRANCH="$1"
FORCE="$2"
echo "useBranch: $BRANCH"

export DOCKER_UID=$(id -u)
export DOCKER_GID=$(id -g)

cd ~/KAdmin/ArkLin2.0

if [ "$FORCE" == "TRUE" ]; then
  rm docker-compose.yml
  mv docker-compose.yml.example docker-compose.yml
fi

git fetch --all
git reset --hard origin/$BRANCH

./sh/folder.sh

echo "Erstelle Image und starte den Docker Container..."
docker compose up -d --build
