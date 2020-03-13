# docker run --rm --name analyzer -p 8081:8081 -v $PWD/data:/data --device=/dev/ttyUSB0 --cap-add SYS_PTRACE asksin-analyzer-xs
FROM node:12-alpine
MAINTAINER Christoph Wiechert <wio@psitrax.de>

ARG DOCKER_TAG=${DOCKER_TAG}

COPY /app /tmp/src/app
COPY /ui /tmp/src/ui
COPY /README.md /tmp/src/

RUN ls -l /tmp/src/app

RUN mkdir /data && \
    chown node /data && \
    apk add --no-cache udev && \
    apk add --no-cache --virtual build-deps python make g++ linux-headers && \
    if [ -n "$DOCKER_TAG" ] ; then cd /tmp/src/app && npm version $DOCKER_TAG ; fi && \
    cd /tmp/src/app && npm ci && npm run tsc && \
    cd /tmp/src/ui && npm ci && npm run build && \
    cd /tmp/src/app && node scripts/make-node-pkg.js && \
    npm install -g --quiet --unsafe /tmp/src/builds/asksin-analyzer-xs-*-node.tar.gz && \
    rm -rf /tmp/src && rm -rf /root/.cache && rm -rf /root/.npm && \
    apk del build-deps

WORKDIR /app
ENV NODE_ENV=production

EXPOSE 8081
VOLUME ["/data"]

CMD ["asksin-analyzer-xs", "-d", "/data"]
