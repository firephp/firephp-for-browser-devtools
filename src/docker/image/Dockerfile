FROM node:13.0.1-alpine

RUN apk update && \
    apk upgrade && \
    apk add bash curl git perl util-linux bash && \
    rm -rf /var/cache/apk/*

COPY install.sh install.sh
COPY build.sh build.sh

ENV SHELL=/bin/bash
ENV NODE_PATH=/usr/lib/node_modules
ENV PATH="/node_modules/.bin:$PATH"

RUN ["/bin/bash", "install.sh"]
CMD ["/bin/bash", "build.sh"]
