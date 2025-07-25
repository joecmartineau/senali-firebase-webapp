#!/bin/bash
echo "Starting Firebase Functions API server..."
node firebase-functions-local.js &
API_PID=$!
echo "API server started with PID $API_PID"
echo $API_PID > api-server.pid
sleep 2
echo "Testing API connection..."
curl -s http://localhost:8081/api/children || echo "API not ready yet"