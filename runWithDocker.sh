#!/bin/bash

docker stop websimilitud
docker rm websimilitud
docker run -d --name websimilitud -p 80:80 websimilitud
