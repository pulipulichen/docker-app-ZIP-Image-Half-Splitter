#!/bin/bash

IMAGE_NAME=pudding/docker-app:zip-image-half-spliter-20231110-2003

docker tag docker-app-zip-image-half-splitter-app ${IMAGE_NAME}
docker push "${IMAGE_NAME}"