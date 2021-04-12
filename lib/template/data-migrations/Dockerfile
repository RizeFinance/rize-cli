# This Dockerfile is for the source environment.  It will create a container that sets up a local
# development server that will automatically refresh for you.
# To use this source environment:
# $ docker-compose down && docker-compose up -d

# Set up base node image
FROM node:10-alpine

ARG GITHUB_USERNAME
ARG GITHUB_PASSWORD
ARG GITHUB_EMAIL

# Set up the Docker Working Directory
ENV HOME=/usr/src/data-migrations
WORKDIR $HOME

# Pulls in the package.json file and installs all the node dependencies
# The .dockerignore file should ignore the node module since the container will operate on a
# linux server.
COPY ./package.json $HOME

RUN npm install -g npm-cli-login
RUN npm-cli-login -u $GITHUB_USERNAME -p $GITHUB_PASSWORD -e $GITHUB_EMAIL -r https://npm.pkg.github.com -s @rizefinance
RUN npm install --quiet

# Copies the host machine folder(s) into the docker container so you can develop on your host
# machine
COPY . $HOME

CMD ["sh", "init-db.sh"]
