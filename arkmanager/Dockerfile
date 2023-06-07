FROM debian:bullseye

ARG SSH_ROOT_USER
ARG SSH_ROOT_PASS

# Change root password (is there a better way?)
RUN echo ${SSH_ROOT_USER}:${SSH_ROOT_PASS} | chpasswd

# Install dependencies (as minimal, as possible)
RUN dpkg --add-architecture i386
RUN apt-get update -qy && apt-get dist-upgrade -y
RUN apt-get install -y --no-install-recommends openssh-server nano lib32gcc-s1 curl ca-certificates software-properties-common locales
COPY ssh_config /etc/ssh/ssh_config
COPY sshd_config /etc/ssh/sshd_config

##############
### Important sidenote:
# To suppress hanging on errors while docker build/run when a command does not return an exit code, we append " || :" on the end of RUN line
#RUN command || :
# Only for debugging purposes. Usually commands do return an exit code 0 if successful, or other than 0 if error. When we forget some argument, command could hang interactively waiting for an input, so no exit code goes to docker buld/run
# and build/run will hang infinitely, not even canceling with CTRL+C helps (reboot of the docker host would be the only other option, i found so far. Even killing docker including all child procs globally doesn't help, build processes respawn again)
# If there is a better solution, please add a comment...
# Update: had an idea, maybe a condition could work too and would be actually better, since on else condition we could return the exit code and
# echo/print the command output... "RUN if [ command ]; then; else; fi" could work, but i didn't tested that in Dockerfile yet

##############
# Installing steamCMD as root yet, if possible to avoid to create user steam in the docker container, since security should be given, that the container is running as user steam on the host (?) and ssh won't be exposed

##############
### Option 1: Install steamcmd from akamai/valve
#RUN curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" --create-dirs --output /usr/games/steamcmd/steamcmd_linux.tar.gz
#RUN tar zxvf /usr/games/steamcmd/steamcmd_linux.tar.gz --directory /usr/games/steamcmd/

##############
### Option 2: Install steamcmd from repo
# Add contrib and non-free
RUN apt-add-repository contrib
RUN apt-add-repository non-free

#complex shit to agree terms for steamcmd... not beautiful, but if it can hold a few years, it would be good enough :)
RUN apt-get update -qy && \
  echo steam steam/question select "I AGREE" | debconf-set-selections && \
  echo steam steam/license note '' | debconf-set-selections && \
  DEBIAN_FRONTEND=noninteractive apt-get install -q -y --no-install-recommends steamcmd

##############
### Set link to executable for both options above
RUN ln -sf /usr/games/steamcmd /usr/bin/steamcmd

##############
### Following issue is happening to both options, this is why i tried both:

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
# i will keep the shitload of comments here until it is solved by valve/akamai. Also i will stick with the apt repo for steamcmd (non-free, as both version are affected anyway, and apt version works fine)
# also see docker-compose.yml for the abowe workaround: extra_hosts

### another shit again:
#WARNING: setlocale('en_US.UTF-8') failed, using locale: 'C'. International characters may not work.
# But it works with another installed package and locale-fix
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG en_US.UTF-8  
ENV LANGUAGE en_US:en  
ENV LC_ALL en_US.UTF-8

##############
### Arkmanager aka ARK Server Tools installation (finally arrived here!) ...




COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD tail -f /dev/null
