#!/bin/bash
source $1
if [ "$?" -ne 0 ]; then
  echo "Erorr, can't open envfile: $1"
  echo "Usage: $0 <env file>"
  echo "e.g., "
  echo " $0 text.env"
  exit 1
else
  envfile=$1
  echo "# Using envfile: $envfile"
fi
shift

mkdir -p persistant_storage

# prepare docker-compose env file
cp $envfile .env

SELF_IP=`ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -n1`

rm nginx.conf
while read line
do 
  echo $line | sed -e "s/\${SELF_IP}/$SELF_IP/g" | sed -e "s/\${RUNTIME_PHP_IP}/$RUNTIME_PHP_IP/g">> nginx.conf
done < nginx.conf.template

if [[ $# -eq 0 ]]
then
  docker-compose down
fi
cmd="docker-compose -f ./docker-compose.yml up --force-recreate --remove-orphans -d $@" 
echo $cmd
eval $cmd
