#!/bin/bash

docker stop websimilitud
docker rm websimilitud
docker run -d --name websimilitud -p 8081:80 websimilitud
