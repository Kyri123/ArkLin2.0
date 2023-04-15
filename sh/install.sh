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
git clone https://github.com/Kyri123/ArkLin2.0.git
cd ArkLin2.0

git fetch --all
git reset --hard origin/$BRANCH

mv docker-compose.yml.example docker-compose.yml

export DOCKER_UID="$(id -u)"
export DOCKER_GID="$(id -g)"

echo "Start Docker..."
docker compose up -d --build
docker compose down

./sh/folder.sh

echo "Bitte Konfiguriere nun die .json in ./mount/config/"