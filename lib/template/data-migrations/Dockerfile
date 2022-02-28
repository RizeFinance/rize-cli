# This Dockerfile is for the source environment. The base image is Linux alpine with Node installed on it.
# The DockerFile Logins to NPM registry in GitHub to pull Rize SKD and install all the dependencies.

# Set up base node image
FROM node:10-alpine

ARG GITHUB_USERNAME
ARG GITHUB_PASSWORD
ARG GITHUB_EMAIL

# Set up the Docker Working Directory
# RUN mkdir -p /usr/src/data-migrations
WORKDIR /usr/src/data-migrations

# Copy the files to the container
COPY . .

# Log in to the Rize SDK package's NPM registry (Github)
RUN apk add expect
RUN sh npm-login.sh

# Pulls in the package.json file and installs all the node dependencies
# The .dockerignore file should ignore the node module since the container will operate on a
# linux server.
RUN npm install --quiet

RUN chmod a+x ./init-db.sh

CMD ["sh", "./init-db.sh"]
