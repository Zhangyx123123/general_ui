#!/bin/bash
if [ "$#" -lt 1 ]; then
  echo "Parameter erorr"
  echo "Usage: $0 <remote_ip> [<template>]"
  echo "e.g., "
  echo " $0 172.16.101.98"
  exit 1
else
  REMOTE_IP=$1
  echo "Use remote api service: $1"
fi

TEMPLATE=""
if [ -z "$2" ]
  then
  TEMPLATE="nginx.conf.ui.te.template"
else
  TEMPLATE=$2
fi
echo "Use template: $TEMPLATE"

cp test.env .env
SELF_IP=`ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -n1`;
BF_IP="$REMOTE_IP:3000";

rm nginx.conf
while read line
do 
  echo $line | sed -e "s/\${SELF_IP}/$SELF_IP/g" | sed -e "s/\${REMOTE_IP}/$REMOTE_IP/g" | sed -e "s/\${BF_IP}/$BF_IP/g" >> nginx.conf
done < $TEMPLATE


CONTAINER=nginx
DOCKER_IMAGE=nginx
# Start docker
docker rm -f -v $CONTAINER
cmd="docker run -d --name $CONTAINER \
  -p 80:80 \
  -m 2048m \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf \
  --restart="always" \
  $DOCKER_IMAGE \
"

echo $cmd
eval $cmd

