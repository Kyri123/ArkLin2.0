FROM debian:bullseye

ARG SSH_ROOT_USER
ARG SSH_ROOT_PASS

RUN echo ${SSH_ROOT_USER}:${SSH_ROOT_PASS} | chpasswd
#RUN echo ${SSH_ROOT_PASS} | passwd --stdin ${SSH_ROOT_USER}

RUN apt-get update && apt-get install -y --no-install-recommends openssh-server nano

COPY ssh_config /etc/ssh/ssh_config
COPY sshd_config /etc/ssh/sshd_config

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD tail -f /dev/null
