#!/bin/bash

cp test.env .env
SELF_IP=`ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -n1`;

while getopts "IHh" opts ; do
  case ${opts} in
    I)
      API_IP=$SELF_IP:8182;
      ;;
    H)
      AUTH_IP=$SELF_IP:8088;
      ;;
    h)
      echo "Usage: $0 [-I|-H] <remote_ip>";
      echo "    -I : Use local api";
      echo "    -H : Use local auth";
      exit 1
      ;;
  esac
done
shift $(expr $OPTIND - 1 )
if [ "$#" -lt 1 ]; then
  echo "Parameter erorr"
  echo "Usage: $0 [-I|-H] <remote_ip>"
  echo "e.g., "
  echo " $0 172.16.101.98"
  exit 1
else
  REMOTE_IP=$1
  echo "Use remote api service: $1"
fi
KG_IP="$REMOTE_IP:15501";
KG_NEW_IP="$REMOTE_IP:18811";
KBQA_IP="$REMOTE_IP:13508";
UTILS_IP="$REMOTE_IP:15307";
SSM_UI_IP="$REMOTE_IP:3001";
SSM_SERVER_IP="$REMOTE_IP:8686";
CCS_UI_IP="$REMOTE_IP:8110";
CCS_CONTROLLER_IP="$REMOTE_IP:10000";
CCS_DAL_IP="$REMOTE_IP:16256";
CCS_DIVERTER_IP="$REMOTE_IP:16255";
if [[ -z "$API_IP" ]]; then
  API_IP=$REMOTE_IP
fi
if [[ -z "$AUTH_IP" ]]; then
  AUTH_IP=$REMOTE_IP
fi

rm nginx.conf
while read line
do
  echo $line | sed -e "s/\${SELF_IP}/$SELF_IP/g" | \
    sed -e "s/\${REMOTE_IP}/$REMOTE_IP/g" | \
    sed -e "s/\${KG_NEW_IP}/$KG_NEW_IP/g" | \
    sed -e "s/\${KG_IP}/$KG_IP/g" | \
    sed -e "s/\${KBQA_IP}/$KBQA_IP/g" | \
    sed -e "s/\${API_IP}/$API_IP/g" | \
    sed -e "s/\${AUTH_IP}/$AUTH_IP/g" | \
    sed -e "s/\${UTILS_IP}/$UTILS_IP/g" | \
    sed -e "s/\${SSM_UI_IP}/$SSM_UI_IP/g" | \
    sed -e "s/\${SSM_SERVER_IP}/$SSM_SERVER_IP/g" | \
    sed -e "s/\${CCS_UI_IP}/$CCS_UI_IP/g" | \
    sed -e "s/\${CCS_CONTROLLER_IP}/$CCS_CONTROLLER_IP/g" | \
    sed -e "s/\${CCS_DAL_IP}/$CCS_DAL_IP/g" | \
    sed -e "s/\${CCS_DIVERTER_IP}/$CCS_DIVERTER_IP/g" >> nginx.conf
done < nginx.conf.ui.template

echo "REMOTE_IP : $REMOTE_IP";
echo "API_IP   : $API_IP";
echo "AUTH_IP  : $AUTH_IP";
echo "KG_IP  : $KG_IP";
echo "KG_NEW_IP  : $KG_NEW_IP";
echo "SSM_UI_IP  : $SSM_UI_IP";
echo "SSM_SERVER_IP  : $SSM_SERVER_IP";
echo "CCS_UI_IP  : $CCS_UI_IP";
echo "CCS_CONTROLLER_IP  : $CCS_CONTROLLER_IP";
echo "CCS_DAL_IP  : $CCS_DAL_IP";
echo "CCS_DIVERTER_IP  : $CCS_DIVERTER_IP";

cmd="docker-compose -f ./docker-compose.yml up --force-recreate -d nginx"
echo $cmd
eval $cmd
