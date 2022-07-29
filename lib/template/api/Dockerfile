# This Dockerfile is for the source environment. The base image is Linux alpine with Node installed on it.
# The DockerFile Logins to NPM registry in GitHub to pull Rize SKD and install all the dependencies.
# The container listens to port 3000 to serve the reques.

# Set up base node image
FROM node:10-alpine

ARG GITHUB_USERNAME
ARG GITHUB_PASSWORD
ARG GITHUB_EMAIL

RUN mkdir -p /usr/src/api/node_modules 

WORKDIR /usr/src/api
COPY . .

# Log in to the Rize SDK package's NPM registry (Github)
RUN apk add expect
RUN sh ./npm-login.sh

# Pulls in the package.json file and installs all the node dependencies
# The .dockerignore file should ignore the node module since the container will operate on a
# linux server.
RUN npm cache clean --force && npm install --force --save

EXPOSE 3000


CMD [ "sh", "./start.sh" ]