#!/bin/bash
if [ $NODE_ENV = "integration" ] || [ $NODE_ENV = "staging" ] || [ $NODE_ENV = "production" ]; then
    echo "Starting nginx on the remote environment"
    nginx -c /etc/nginx/nginx.dist.conf
else
    echo "Starting nginx on the local environment"
    nginx -c /etc/nginx/nginx.conf
fi
