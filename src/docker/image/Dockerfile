FROM mhart/alpine-node:9.2

RUN apk update && \
    apk upgrade && \
    apk add bash curl git perl util-linux bash && \
    rm -rf /var/cache/apk/*

COPY build.sh build.sh

ENV SHELL=/bin/bash

CMD ["/bin/bash", "build.sh"]
