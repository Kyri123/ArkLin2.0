FROM debian:bullseye

# Taking over args from docker-compose.yml
ARG SSH_ROOT_USER
ARG SSH_ROOT_PASS
ARG SSH_STEAM_USER
ARG SSH_STEAM_PASS
ARG DEBIAN_FRONTEND=noninteractive

### used for debugging
#RUN echo "Dockerfile line 11" >> /tmp/info.txt || :
#RUN whoami >> /tmp/info.txt || :
#RUN echo $HOME >> /tmp/info.txt || :
#RUN echo $PWD >> /tmp/info.txt || :

# Change root password (is there a better way?)
RUN echo ${SSH_ROOT_USER}:${SSH_ROOT_PASS} | chpasswd

# Install dependencies (as minimal, as possible)
RUN dpkg --add-architecture i386
RUN apt-get update -qy && apt-get dist-upgrade -y
RUN apt-get install -y --no-install-recommends openssh-server sudo nano lib32gcc-s1 curl ca-certificates software-properties-common locales iputils-ping
COPY ssh_config /etc/ssh/ssh_config
COPY sshd_config /etc/ssh/sshd_config

# Create steam user
RUN useradd -m -d /home/${SSH_STEAM_USER} -G ssh ${SSH_STEAM_USER} -s /bin/bash
RUN echo ${SSH_STEAM_USER}:${SSH_STEAM_PASS} | chpasswd
RUN echo 'PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin"' >> /home/${SSH_STEAM_USER}/.profile
RUN echo "${SSH_STEAM_USER} ALL=NOPASSWD:/bin/rm" >> /etc/sudoers
RUN echo "${SSH_STEAM_USER} ALL=NOPASSWD:/bin/mkdir" >> /etc/sudoers
RUN echo "${SSH_STEAM_USER} ALL=NOPASSWD:/bin/chown" >> /etc/sudoers
RUN echo "${SSH_STEAM_USER} ALL=NOPASSWD:/usr/sbin/useradd" >> /etc/sudoers
RUN echo "${SSH_STEAM_USER} ALL=NOPASSWD:/usr/sbin/deluser" >> /etc/sudoers
RUN echo "${SSH_STEAM_USER} ALL=NOPASSWD:/usr/sbin/chpasswd" >> /etc/sudoers

# Codepage fix for steamcmd (doesn't help anyway)
#RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen en_US.UTF-8
#ENV LANG en_US.UTF-8
#ENV LANGUAGE en_US:en
#ENV LC_ALL en_US.UTF-8

#############
# To suppress docker build/run hangs while a command does not return an exit code, we append " || :" to RUN insturction (for debugging purposes only)
# this could happen, when some command wants interaction, becuase of forgotten argument or something

#############
### Option 1: Install steamcmd from akamai/valve
#RUN curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" --create-dirs --output /usr/games/steamcmd/steamcmd_linux.tar.gz
#RUN tar zxvf /usr/games/steamcmd/steamcmd_linux.tar.gz --directory /usr/games/steamcmd/
#RUN chmod +x /usr/games/steamcmd/linux32/steamcmd
#RUN ln -sf /usr/games/steamcmd/linux32/steamcmd /usr/bin/steamcmd
#RUN ln -sf /usr/games/steamcmd/linux32/steamcmd /home/steam/steamcmd


#mkdir steamcmd
#curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" --create-dirs --output /home/steam/steamcmd/steamcmd_linux.tar.gz
#
#tar zxvf /home/steam/steamcmd/steamcmd_linux.tar.gz --directory /home/steam/steamcmd/
#
#/home/steam/steamcmd/linux32/steamcmd +login anonymous +force_install_dir +quit


#############
### Option 2: Install steamcmd from repo https://developer.valvesoftware.com/wiki/SteamCMD#Package_From_Repositories
# Add contrib and non-free
RUN apt-add-repository contrib
RUN apt-add-repository non-free
RUN apt-get update -qy && \
  echo steam steam/question select "I AGREE" | debconf-set-selections && \
  echo steam steam/license note '' | debconf-set-selections && \
  apt-get install -q -y --no-install-recommends steamcmd
RUN ln -sf /usr/games/steamcmd /usr/bin/steamcmd
RUN ln -sf /usr/games/steamcmd /home/steam/steamcmd

### used for debugging
#USER steam
#WORKDIR /home/steam
#RUN echo "line 79" >> /home/steam/info.txt || :
#RUN whoami >> /home/steam/info.txt || :
#RUN echo $HOME >> /home/steam/info.txt || :
#RUN echo $PWD >> /home/steam/info.txt || :

### don't know why, but those are not working, in entrypoint.sh installation works
#RUN steamcmd +login anonymous +force_install_dir +quit || :
#RUN HOME=/home/steam;steamcmd +quit || :
#RUN steamcmd +quit || :

#############
### Initial start of steamcmd to get all the updates of it self
#RUN bash -c "/usr/bin/steamcmd +login anonymous +quit" || :

#############
### Arkmanager aka ARK Server Tools installation (finally arrived here?) ...

### used for debugging
#USER root
#WORKDIR /
#RUN echo "line 99" >> /tmp/info.txt || :
#RUN whoami >> /tmp/info.txt || :
#RUN echo $HOME >> /tmp/info.txt || :
#RUN echo $PWD >> /tmp/info.txt || :

#############
# Define Entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD tail -f /dev/null



#############
### NOTES ###
#############

### Following issue is happening to both steamcmd options, this is why i tried both:
#ILocalize::AddFile() failed to load file "public/steambootstrapper_english.txt".
#[  0%] Checking for available update...
#KeyValues Error: LoadFromBuffer: missing {   (current key: '<!doctype') in file manifest [offset: 15]
#apt-get install dnsutils iputils-ping
#from home:
#ping media.steampowered.com
#  64 bytes from media.steampowered.com (23.10.249.160): icmp_seq=1 ttl=60 time=2.56 ms
#dig media.steampowered.com
#  media.steampowered.com.	60	IN	CNAME	cdn.akamai.steamstatic.com.edgesuite.net.
#  cdn.akamai.steamstatic.com.edgesuite.net. 21600	IN CNAME a1843.b.akamai.net.
#  a1843.b.akamai.net.	20	IN	A	2.16.238.151
#  a1843.b.akamai.net.	20	IN	A	2.16.238.140
#  a1843.b.akamai.net.	20	IN	A	23.0.174.26
#  a1843.b.akamai.net.	20	IN	A	23.10.249.160
#  a1843.b.akamai.net.	20	IN	A	173.222.108.209
#  a1843.b.akamai.net.	20	IN	A	173.222.108.210
#  a1843.b.akamai.net.	20	IN	A	95.101.54.113
#  a1843.b.akamai.net.	20	IN	A	95.101.54.209
# and some more IN A records
# from docker:
#ping media.steampowered.com
#  64 bytes from a23-53-41-113.deploy.static.akamaitechnologies.com (23.53.41.113): icmp_seq=1 ttl=56 time=9.27 ms
#dig media.steampowered.com
#  media.steampowered.com.	7	IN	CNAME	cdn.akamai.steamstatic.com.edgesuite.net.
#  cdn.akamai.steamstatic.com.edgesuite.net. 20301	IN CNAME a1843.b.akamai.net.
#  a1843.b.akamai.net.	20	IN	A	2.21.22.184
#  a1843.b.akamai.net.	20	IN	A	2.21.22.169
# and also many more, but the 23.10.249.160 never returned on docker (i know, round robin, but again, after 30++ digs with dns cache flushing, never this one)
# post from Kevin King from here https://askubuntu.com/questions/1318238/steam-install-not-finding-internet-connection-on-ubuntu-20-04/1318567#1318567
# i added now as he suggested exactly this one IP to /etc/hosts ... it works -.-
# for reference my hosts entries:
# 23.10.249.160    media.steampowered.com
# 23.10.249.160    client-download.steampowered.com
# TODO: find out why, and if no fix from valve/akamai, add to Dockerfile
# lol, from some other machines worldwide i have under my control, client-download.steampowered.com not even resolvable. NOT an issue on my side or something Host -> LXC -> Docker specific, even physical wintendos have resolving issues!
# will keep the shitload of comments here until it is solved by valve/akamai. Also i will stick with the apt repo for steamcmd (non-free, as both version are affected anyway, and apt version works fine)
# also i will keep both options updated

# Temporary fix added to docker-compose.yml(.example)
# extra_hosts
#  - "media.steampowered.com:23.10.249.160"
#  - "client-download.steampowered.com:23.10.249.160"
