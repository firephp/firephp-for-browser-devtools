FROM mhart/alpine-node:8.7

RUN apk update && \
    apk add bash curl git perl util-linux && \
    rm -rf /var/cache/apk/*

COPY build.sh build.sh

CMD ["bash", "build.sh"]