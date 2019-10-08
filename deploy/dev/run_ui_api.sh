#!/bin/bash
if [ "$#" -lt 1 ]; then
  echo "Parameter erorr"
  echo "Usage: $0 <remote_ip>"
  echo "e.g., "
  echo " $0 172.16.101.47"
  exit 1
else
  REMOTE_IP=$1
  echo "Use remote api service: $1"
fi

cp test.env .env
SELF_IP=`ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -n1`

rm nginx.conf
while read line
do 
  echo $line | sed -e "s/\${SELF_IP}/$SELF_IP/g" | sed -e "s/\${REMOTE_IP}/$REMOTE_IP/g">> nginx.conf
done < nginx.conf.ui.api.template

cmd="docker-compose -f ./docker-compose.yml up --force-recreate -d nginx admin-api" 
echo $cmd
eval $cmd
