#!/bin/sh
set -e

export NAMESERVER=`cat /etc/resolv.conf | grep "nameserver" | awk '{print $2}' | tr '\n' ' '`

# start crond
crond -n &

#decrypt password
if ! [[ -z "$DECRYPTION_SERVICE" ]]; then
    MYSQL_PASSWORD=$(/api/desEncrypt -t $ADMIN_AUTH_MYSQL_PASS)
    if [[ $? -ne 0 ]]; then
      exit 1
    fi
    export ADMIN_AUTH_MYSQL_PASS=$MYSQL_PASSWORD
fi
# init api
cd /api && ./files_init.sh

supervisord -c /etc/supervisord.conf