# Dockerfile.alpine
FROM mhart/alpine-node:8

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD ./src /usr/src/app/
ADD ./public /usr/src/app/assets/public

RUN ls -l /usr/src/app/
RUN ls -l /usr/src/app/assets