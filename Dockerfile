FROM node:alpine

WORKDIR ./

# Copy main configs
COPY *.lock ./
COPY *.html ./
COPY *.ts ./
COPY *.json ./
COPY *.js ./

# Copy source folder
COPY ./src ./src
COPY ./server ./server
COPY ./public ./public
COPY src/Shared ./Shared
COPY ./config ./config

# create main files
RUN yarn install
RUN yarn build

EXPOSE 28080:28080
EXPOSE 28100:28100/udp

CMD yarn start:production
