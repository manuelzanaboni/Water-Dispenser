#!/bin/sh -e
VERSION=$(jq -r .version package.json)
TAG=192.168.1.254:5000/water-dispenser:$VERSION
docker build -t $TAG .
docker push $TAG
