#!/bin/bash

echo "Waiting for database to be ready..."
/wait-for-it.sh postgres:5432

echo "Running migrations..."
npm run migrate

# Start server
echo "Starting server..."
npm run server