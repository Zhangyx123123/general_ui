#!/bin/bash
REPO=docker-reg.emotibot.com.cn:55688;
CONTAINER=admin-ui-storybook;
TAG="`git rev-parse --short HEAD`";
DOCKER_IMAGE=$REPO/$CONTAINER:$TAG;

# Build docker
docker rm -f $CONTAINER;
cmd="docker run -idt --name $CONTAINER -p 9001:9001 $DOCKER_IMAGE"
echo $cmd
eval $cmd
