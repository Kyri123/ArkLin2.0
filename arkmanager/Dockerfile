FROM debian:bullseye

# Taking over args from docker-compose.yml
ARG SSH_ROOT_USER
ARG SSH_ROOT_PASS
ARG SSH_STEAM_USER
ARG SSH_STEAM_PASS
ARG DEBIAN_FRONTEND=noninteractive

# Change root password (is there a better way?)
RUN echo ${SSH_ROOT_USER}:${SSH_ROOT_PASS} | chpasswd

# Install dependencies (as minimal, as possible. some tools for testing, cleanup later)
RUN dpkg --add-architecture i386
RUN apt-get update -qy && apt-get dist-upgrade -y
RUN apt-get install -y --no-install-recommends openssh-server sudo nano lib32gcc-s1 curl ca-certificates software-properties-common locales iputils-ping perl rsync sed tar perl-modules lsof libc6-i386 bzip2
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

#############
### Option 1: Install steamcmd from akamai/valve (unfinished! use Option 2 yet)
#RUN curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" --create-dirs --output /usr/games/steamcmd/steamcmd_linux.tar.gz
#RUN tar zxvf /usr/games/steamcmd/steamcmd_linux.tar.gz --directory /usr/games/steamcmd/
#RUN chmod +x /usr/games/steamcmd/linux32/steamcmd
#RUN ln -sf /usr/games/steamcmd/linux32/steamcmd /usr/bin/steamcmd
#RUN ln -sf /usr/games/steamcmd/linux32/steamcmd /home/steam/steamcmd

#############
### Option 2: Install steamcmd from repo https://developer.valvesoftware.com/wiki/SteamCMD#Package_From_Repositories
RUN apt-add-repository contrib
RUN apt-add-repository non-free
RUN apt-get update -qy && \
  echo steam steam/question select "I AGREE" | debconf-set-selections && \
  echo steam steam/license note '' | debconf-set-selections && \
  apt-get install -q -y --no-install-recommends steamcmd
RUN ln -sf /usr/games/steamcmd /usr/bin/steamcmd
RUN ln -sf /usr/games/steamcmd /home/steam/steamcmd

#############
### Arkmanager aka ARK Server Tools installation
RUN curl -sL https://raw.githubusercontent.com/arkmanager/ark-server-tools/master/netinstall.sh | sudo bash -s steam

#############
# Define Entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD tail -f /dev/null
