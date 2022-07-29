#!/bin/bash

# Run the nodejs app
if [ "$NODE_ENV" = "integration" ] || [ "$NODE_ENV" = "staging" ] || [ "$NODE_ENV" = "production" ]; then
    npm start
else
    npm run dev
fi
