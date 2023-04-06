FROM node:alpine

WORKDIR ./

# Copy main configs
COPY package*.json ./
COPY tsconfig*.json ./
COPY .env.production ./
COPY *.html ./
COPY *.ts ./

# Copy source folder
COPY ./src ./src
COPY ./server ./server
COPY ./public ./public
COPY src/Shared ./Shared
COPY ./config ./config

# create main files
RUN yarn install
RUN yarn tailwindcss
RUN yarn BuildServer
RUN yarn Client

EXPOSE 28080:28080
EXPOSE 28100:28100/udp

CMD yarn Server
