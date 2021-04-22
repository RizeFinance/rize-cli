#!/bin/bash

echo "NODE ENV:" $NODE_ENV

# Wait for data-migrations to be completed to be ready
if [ "$DATA_MIGRATIONS_HOST" ]; then
    while ping -c 1 $DATA_MIGRATIONS_HOST &> /dev/null; do sleep 1; done
fi

# Run the nodejs app
if [ $NODE_ENV = "integration" ] || [ $NODE_ENV = "staging" ] || [ $NODE_ENV = "production" ]; then
    npm start
else
    npm run dev
fi
