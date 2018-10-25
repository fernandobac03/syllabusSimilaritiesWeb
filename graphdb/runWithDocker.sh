#!/bin/bash

docker stop graphdb
docker rm graphdb
docker run -d --name graphdb -p 8080:7200 -v graphdbvol:/graphdb/data dhlabbasel/graphdb-free
docker cp graphdb.properties graphdb:/graphdb/conf
docker restart  graphdb
