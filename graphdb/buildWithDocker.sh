#!/bin/bash

docker stop graphdb
docker rm graphdb
docker rmi graphdb-free
docker build -t graphdb-free .
