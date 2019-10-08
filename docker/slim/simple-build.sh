#!/bin/bash
REPO=docker-reg.emotibot.com.cn:55688
CONTAINER=admin-ui
TAG="`git rev-parse --short HEAD`"_simple
DOCKER_IMAGE=$REPO/$CONTAINER:$TAG

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILDROOT=$DIR/../

# Build docker
cmd="docker build \
  -t $DOCKER_IMAGE \
  -f $DIR/SimpleDockerfile $BUILDROOT"
echo $cmd
eval $cmd
