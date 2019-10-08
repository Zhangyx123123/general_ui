#!/bin/bash
REPO=harbor.emotibot.com/bfop
CONTAINER=admin-ui

TAG=$2
if [ "$TAG" == "" ]; then
    TAG="latest"
fi
DOCKER_IMAGE=$REPO/$CONTAINER:$TAG
echo "TAG: $TAG"
echo "DOCKER_IMAGE: $DOCKER_IMAGE"

MOUNT_PATH_DFL=/home/deployer/infrastructure/volumes/houta/Files
MOUNT_PATH=$3
if [ "$MOUNT_PATH" == "" ]; then
    MOUNT_PATH=$MOUNT_PATH_DFL
fi

if [ ! -d $MOUNT_PATH ]; then
    mkdir -p $MOUNT_PATH
fi


DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Load the env file
source $1
if [ $? -ne 0 ]; then
  if [ "$#" -eq 0 ];then
    echo "Usage: $0 <envfile>"
    echo "e.g., $0 dev.env"
  else
    echo "Erorr, can't open envfile: $1"
  fi
  exit 1
else
  envfile=$1
  echo "# Using envfile: $1"
fi

# Start docker
docker rm -f -v $CONTAINER

if [ ${USER} == "deployer" ]; then
  GlobalConfig="
    -v /etc/localtime:/etc/localtime \
    -v $MOUNT_PATH:/build/dist/Files \
  "
fi


cmd="docker run -idt --name $CONTAINER \
  --restart="always" \
  -p 80:80 \
  $GlobalConfig
  --env-file $envfile \
  $DOCKER_IMAGE \
"

echo $cmd
eval $cmd
