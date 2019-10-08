#!/bin/bash
REPO=docker-reg.emotibot.com.cn:55688
CONTAINER=admin-ui-storybook
TAG="`git rev-parse --short HEAD`"
DOCKER_IMAGE=$REPO/$CONTAINER:$TAG

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILDROOT=$DIR/../../

# Build docker
cmd="docker build \
  -t $DOCKER_IMAGE \
  -f $DIR/Dockerfile $BUILDROOT"
echo $cmd
eval $cmd
