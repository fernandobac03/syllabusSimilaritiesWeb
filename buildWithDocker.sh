#!/bin/bash

docker stop websimilitud
docker rm websimilitud
#docker rmi websimilitud
docker build -t websimilitud .
