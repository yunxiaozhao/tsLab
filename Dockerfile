ARG VARIANT="14-buster"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}
COPY . /app
WORKDIR /app
RUN npm i -g ts-node
RUN npm i --save-dev @types/ramda
RUN npm i ramda