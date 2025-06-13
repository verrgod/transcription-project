#!/bin/bash

echo "Waiting for ksqlDB to be ready..."
until $(curl --output /dev/null --silent --head --fail http://ksqldb-server:8088); do
    printf '.'
    sleep 5
done

echo "ksqlDB is ready. Executing init.sql..."

# Ensure the file path for init.sql is correct in the Docker container
curl -X POST -H "Content-Type: application/vnd.ksql.v1+json; charset=utf-8" \
    --data @/init.sql \  # Use an absolute path if the file is in the root directory
    http://ksqldb-server:8088/ksql

echo "Initialization complete."