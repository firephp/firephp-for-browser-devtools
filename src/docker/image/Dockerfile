FROM node:13.0.1-alpine

RUN apk update && apk upgrade

RUN apk add --no-cache \
	bash curl git perl python make gcc g++ coreutils

COPY install.sh install.sh
COPY build.sh build.sh

ENV SHELL=/bin/bash
ENV NODE_PATH=/usr/lib/node_modules
ENV PATH="/node_modules/.bin:$PATH"

RUN ["/bin/bash", "install.sh"]

ENTRYPOINT ["/bin/bash", "build.sh"]
