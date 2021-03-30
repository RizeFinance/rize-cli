#!/bin/bash

echo "NODE ENV:" $NODE_ENV

# Wait for db to be ready
while ! nc -z $DB_HOST 5432; do sleep 3; done

# List completed and pending migration files
npm run db:migrate-list

# Run db migrations
npm run db:migrate